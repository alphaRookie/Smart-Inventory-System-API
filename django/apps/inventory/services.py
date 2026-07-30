import requests
from .models import Product, Sales, Shelf, OrderPrediction
from datetime import timedelta, date, datetime
from decimal import Decimal
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db.models.functions import Coalesce
from django.db.models import Count, Q, F, Sum
import httpx


class ProductService():
    @staticmethod
    def increase_stock( #auto-increase currect stock when new product added/patched
        shelf: Shelf,
        product: Product,
    ):
        if product.id is None:
            shelf.current_stock += product.quantity # add with whatever the quantity user put
            shelf.save()
            return shelf
        
        else:#if its indeed the product that user adding rn, find out how much the quantity previously, then decrease with the new 
            if Product.objects.filter(id=product.id).exists(): 
                existing_prod = Product.objects.get(id=product.id)
                new_prod = product.quantity
                shelf.current_stock += (new_prod - existing_prod.quantity) # access quantity of the exsting prod

                shelf.save()
                return shelf

    @staticmethod
    def save_product(product: Product | None=None, **kwargs):

        # receive the raw kwargs package and filter out None value
        clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

        # Validation 1
        target_shelf = clean_kwargs.get("shelf") or (product.shelf if product else None) # take user input or take from DB(if user didnt input when patching)
        quantity = clean_kwargs.get("quantity") or (product.quantity if product else None)
        if target_shelf and quantity:
            available_space = target_shelf.max_shelf_capacity - target_shelf.current_stock

            if quantity > available_space:
                raise ValidationError(f"Cannot fit {quantity} units on this shelf, Only {available_space} space remaining.")

        # Validation 2
        selling_price = clean_kwargs.get("selling_price") or (product.selling_price if product else None)
        unit_cost = clean_kwargs.get("unit_cost") or (product.unit_cost if product else None)
        if selling_price and unit_cost:
            if selling_price < unit_cost:
                raise ValidationError("Selling price cannot be lower than unit cost (negative profit margin)")
            
        # Validation 3
        expire_date = clean_kwargs.get("expire_date") or (product.expire_date if product else None)
        if expire_date and expire_date <= timezone.now():
            raise ValidationError("Cannot add or update product with an expiration date in the past")
        
        # Validation 4
        name = clean_kwargs.get("name") or (product.name if product else None)
        existing_name = Product.objects.filter(name__iexact=name, shelf=target_shelf) #Case-insensitive check
        if product: # Only exclude if product actually exists btw
            existing_name = existing_name.exclude(id=product.id) # "Look for other products with this name, but ignore the product I am currently editing"
        if existing_name.exists():
            raise ValidationError(f"A product named '{name}' already exists on this shelf")


        if product:
            for key, value in clean_kwargs.items():   # Step 1: Loop through all valued fields from clean kwargs
                setattr(product, key, value)          # Step 2: Assign the valued field directly to the object (product.field = value)
        else:
            product = Product(**clean_kwargs)

        # Logic to auto-create 'shelf_life' field
        if product.expire_date:
            date_diff = product.expire_date - timezone.now()
            product.shelf_life = date_diff.days
        else:
            product.shelf_life = 0

        ProductService.increase_stock(shelf=product.shelf, product=product)
            
        product.save()
        return product
    

    @staticmethod
    def delete_product(product: Product, shelf: Shelf):
        if product:
            shelf.current_stock -= product.quantity # delete from shelf stock
            shelf.save()
            
            product.is_deleted = True # mark with soft delete
            product.save()
            return shelf


class ShelfService():

    @staticmethod
    def save_shelf(shelf: Shelf | None=None, **kwargs):
        clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

        if shelf and shelf.max_shelf_capacity < shelf.current_stock:
            raise ValidationError(f"Cannot change the max capacity to be lower than current stock ({shelf.current_stock})")

        if shelf:
            for key, value in clean_kwargs.items():      
                setattr(shelf, key, value)         
        else:
            shelf = Shelf(**clean_kwargs)

        shelf.save()
        return shelf


class SalesService():
    @staticmethod
    def decrease_stock(sales: Sales): 
        # auto-decrease quantity and currect stock when sales triggered
        sales.product.quantity -= sales.quantity_sold
        sales.product.shelf.current_stock -= sales.quantity_sold

        sales.product.shelf.save()
        sales.product.save()
        return sales

    @staticmethod
    def save_sales(**kwargs):
        clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

        product = clean_kwargs.get("product") 
        quantity_sold = clean_kwargs.get("quantity_sold", 0)

        if quantity_sold <= 0:
            raise ValidationError("Quantity sold must be greater than zero.")

        if product and quantity_sold > product.shelf.current_stock:
            raise ValidationError(f"Not enough stock available. Remaining stock: {product.shelf.current_stock}")
        
        if product and product.expire_date <= timezone.now():
            raise ValidationError("Cannot sell expired products.")

        # Instantiate in RAM, dont save directly by 'Sales.object.create'
        sales = Sales(**clean_kwargs) 

        # logic to auto-create 'total_revenue' field
        if sales.quantity_sold and sales.product:
            sales.total_revenue = sales.quantity_sold * sales.product.selling_price
        else:
            sales.total_revenue = Decimal("0")

        SalesService.decrease_stock(sales=sales)
            
        sales.save() 
        return sales


class OrderPredictionService():
    @staticmethod
    async def fetch_ai_prediction(product:Product, shelf:Shelf):
        """ Sends product data to FastAPI and returns the prediction numbers. """

        # FastAPI URL endpoint
        url = "http://127.0.0.1:8001/api/predict"

        # find out how many product is sold based on each different types in the last 3 days
        demand = await Sales.objects \
            .filter(product=product, created_at__gte= timezone.now() - timedelta(days=3)) \
            .aaggregate(base_demand=Coalesce(Sum("quantity_sold"), 0)) # use async database query (aaggregate)

        # Request data to be sent to Fast api
        payload = {
            "product_name": product.name,
            "product_type": product.type,
            "base_demand": int(demand["base_demand"] / 3), # divide by 3 to get daily baseline
            "current_stock": int(shelf.current_stock) # explicitly, bcoz from a web form, they usually come in as strings
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=5) # send the payload data to target URL to be processed within 5 seconds
            
            if response.status_code == 200:
                # 1.save to DB (Convert raw JSON text into db rows directly)
                prediction_obj = await OrderPrediction.objects.acreate( # use async create method (acreate)
                    product=product,
                    demand_prediction=response.json()["predicted_demand"],
                    order_suggestion=response.json()["suggested_order"],
                    target_timing=timezone.now() + timedelta(days=3)
                )

                # 2.Return a dictionary so ai_data.get() can works in views
                return {
                    "predicted_demand": prediction_obj.demand_prediction,
                    "suggested_order": prediction_obj.order_suggestion
                }
            return None
        
        except requests.exceptions.RequestException:
            return None
