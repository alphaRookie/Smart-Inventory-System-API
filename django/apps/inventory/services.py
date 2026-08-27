import requests
from .models import Product, Sales, Shelf, OrderPrediction, SpoilageNotification, ProductShelf
from datetime import timedelta, date, datetime
from decimal import Decimal
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db.models.functions import Coalesce
from django.db.models import Count, Q, F, Sum
import httpx
import os
from asgiref.sync import sync_to_async


class ProductService(): 
    @staticmethod
    def _increase_stock(product: Product, shelf_alloc): #auto-increase currect stock when new product added/patched
        for item in shelf_alloc: 
            shelf = item["shelf"]
            qty = item["quantity"]
           
            existing_link = ProductShelf.objects.filter(product=product, shelf=shelf).first() # Check if this spesifc product-shelf link already exists in the 3rd table

            if existing_link is None: # 1. if the product is not exist, we create new one
                shelf.current_stock += qty # add with whatever the quantity user put

                ProductShelf.objects.create(
                    product=product,
                    shelf=shelf,
                    quantity=qty
                )
                shelf.save()
            
            else: # 2. if the product link already exist, we do Patch
                qty_diff = qty - existing_link.quantity # new qty typed - old qty from DB
                shelf.current_stock += qty_diff # update the value in shelf table
                shelf.save()

                existing_link.quantity = qty # update value in ProductShelf table
                existing_link.save()
                

    @staticmethod
    def save_product(product: Product | None=None, **kwargs):

        # receive the raw kwargs package and filter out None value
        clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

        shelf_alloc = clean_kwargs.get("shelf_allocations")
        if shelf_alloc is None and product: # fallback if shelf_allocation field empty in patch
            shelf_alloc = [
                {"shelf": ps.shelf, "quantity": ps.quantity}
                for ps in product.shelf_allocations.all()
            ]
        
        # Validation 1
        if shelf_alloc:
            for item in shelf_alloc: # unpack the payload (it's a list of dictionaries)
                shelf = item["shelf"]
                qty = item["quantity"]

                # 2 lines below is to handle when patching (when PATCH we need true available space, not user input quantity like when POST)
                existing_link = ProductShelf.objects.filter(product=product, shelf=shelf).first() if product else None
                old_qty = existing_link.quantity if existing_link else 0

                available_space = (shelf.max_shelf_capacity - shelf.current_stock) + old_qty
                if qty > available_space:
                    raise ValidationError(f"Can't fit {qty} units on shelf id '{shelf.id}', space remaining: {available_space} ")

        # Validation 2
        selling_price = clean_kwargs.get("selling_price") or (product.selling_price if product else 0)
        unit_cost = clean_kwargs.get("unit_cost") or (product.unit_cost if product else 0)
        if selling_price and unit_cost:
            if selling_price < unit_cost:
                raise ValidationError("Selling price cannot be lower than unit cost (negative profit margin)")
            
        # Validation 3
        expire_date = clean_kwargs.get("expire_date") or (product.expire_date if product else None)
        if expire_date and expire_date <= timezone.localdate():
            raise ValidationError("Cannot add or update product with an expiration date in the past")
        
        # Validation 4
        if shelf_alloc:

            name = clean_kwargs.get("name") or (product.name if product else None)
            target_shelf = [item["shelf"] for item in shelf_alloc] # unpack with list comprehensive

            existing_name = Product.objects.filter(name__iexact=name, shelves__in=target_shelf) #Case-insensitive check

            if product: # Only exclude if product actually exists btw
                existing_name = existing_name.exclude(id=product.id) # "Look for other products with this name, but ignore the product I am currently editing"
            if existing_name.exists():
                raise ValidationError(f"A product named '{name}' already exists on this shelf")

        # M2M Validations
        total_qty = clean_kwargs.get("quantity") or (product.quantity if product else 0)
        if shelf_alloc is not None:
            # Validation 5
            if len(shelf_alloc) == 0:
                raise ValidationError("Product must be assigned to at least one shelf.")

            # Validation 6
            qty_pershelf = [item.get("quantity", 0) for item in shelf_alloc] #safely return 0
            if total_qty != sum(qty_pershelf):
                raise ValidationError(f"The total quantity of a product ({total_qty}) must match the number of product to be assign in each shelves")
            

        # pop the custom field out, bcoz Product model dont have this field (this belong to 3rd table)
        allocations_data = clean_kwargs.pop("shelf_allocations", None)

        if product:
            for key, value in clean_kwargs.items():   # Step 1: Loop through all valued fields from clean kwargs
                setattr(product, key, value)          # Step 2: Assign the valued field directly to the object (product.field = value)
        else:
            product = Product(**clean_kwargs)

        product.save() # save product first so it gets a database ID for the 3rd table

        if allocations_data:
            ProductService._increase_stock(product=product, shelf_alloc=allocations_data)
            
        product.save()
        return product
    

    @staticmethod
    def delete_product(product: Product):

        prod_shelf = product.shelf_allocations.all() # return queryset, not list of dict
        for item in prod_shelf:
            # decrease obj in shelf table with obj in product table
            item.shelf.current_stock -= item.quantity 
            item.shelf.save()

            # ensure the quantity will set to 0 when gets deleted
            item.quantity = 0
            item.save()

        product.is_deleted = True # mark with soft delete
        product.save()
        return product


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
        
        if product and product.expire_date <= timezone.localdate():
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
    async def fetch_single_prediction(product:Product):
        """ Sends a single product data to FastAPI and returns the prediction numbers. """

        lookback_days_sales = int(os.getenv("LOOKBACK_DAYS_SALES", 3)) # decide: user wants to find sales data in the last how many days? 
        target_days_prediction = int(os.getenv("TARGET_DAYS_PREDICTION", 3)) # decide: user wants to prepare stock for how many upcoming days?

        if lookback_days_sales < 1:
            raise ValidationError("Cannot lookback the sales data happened less than 1 day")
        if target_days_prediction < 1:
            raise ValidationError("Target days prediction must be at least 1 day.")
        if target_days_prediction > 5:
            raise ValidationError(f"Cannot predict for {target_days_prediction} days as OpenWeatherMap free tier forecast limit to 5 days.")

        # FastAPI URL endpoint
        url = "http://127.0.0.1:8001/api/predict-single"

        # find out how many product is sold based on each different types in the last ... days
        demand = await Sales.objects \
            .filter(product=product, created_at__gte= timezone.now() - timedelta(days=lookback_days_sales)) \
            .aaggregate(base_demand=Coalesce(Sum("quantity_sold"), 0)) # use async database query (aaggregate)

        # Request data to be sent to Fast api
        payload = {
            "product_id": product.id,
            "product_type": product.type,
            "base_demand": int(demand["base_demand"] / lookback_days_sales), # divide by ... to get daily baseline
            "current_stock": int(product.quantity) if product else 0, # explicitly, bcoz from a web form, they usually come in as strings
            "target_days_prediction": int(target_days_prediction)
        }

        try:
            async with httpx.AsyncClient() as client: # 1 call = 1 connection setup per product
                response = await client.post(url, json=payload, timeout=5) # send the payload data to target URL to be processed within 5 seconds
            
            if response.status_code == 200:
                # 1.save to DB (Convert raw JSON text into db rows directly)
                prediction_obj = await OrderPrediction.objects.acreate( # use async create method (acreate)
                    product=product,
                    demand_prediction=response.json()["predicted_demand"],
                    order_suggestion=response.json()["suggested_order"],
                    target_timing=timezone.localdate() + timedelta(days=target_days_prediction)
                )

                # 2.Return a dictionary so ai_data.get() can works in views
                return {
                    "predicted_demand": prediction_obj.demand_prediction,
                    "suggested_order": prediction_obj.order_suggestion
                }
            return None
        
        except Exception as e:
            print(f"Error in single prediction: {str(e)}")
            return None


    @staticmethod 
    async def fetch_batch_prediction():
        """ Sends all products data to FastAPI and returns the prediction numbers. """

        lookback_days_sales = int(os.getenv("LOOKBACK_DAYS_SALES", 3)) # decide: user wants to find sales data in the last how many days? 
        target_days_prediction = int(os.getenv("TARGET_DAYS_PREDICTION", 3)) # decide: user wants to prepare stock for how many upcoming days?

        if lookback_days_sales < 1:
            raise ValidationError("Cannot lookback the sales data happened less than 1 day")
        if target_days_prediction < 1:
            raise ValidationError("Target days prediction must be at least 1 day.")
        if target_days_prediction > 5:
            raise ValidationError(f"Cannot predict for {target_days_prediction} days as OpenWeatherMap free tier forecast limit to 5 days.")

        # FastAPI URL endpoint
        url = "http://127.0.0.1:8001/api/predict-batch"

        payload = [] # hold 'list' of data to be sent out to Fast Api

        products = Product.objects.filter(is_deleted=False)
        async for product in products:
            # find out how many product is sold based on each different types in the last ... days
            demand = await Sales.objects \
                .filter(product=product, created_at__gte= timezone.now() - timedelta(days=lookback_days_sales)) \
                .aaggregate(base_demand=Coalesce(Sum("quantity_sold"), 0)) # use async database query (aaggregate)

            # Request data to be sent to Fast api (Stored in Dictionary)
            payload.append({
                "product_id": product.id,
                "product_type": product.type, 
                "base_demand": int(demand["base_demand"] / lookback_days_sales), # divide by ... to get daily baseline
                "current_stock": int(product.quantity), 
                "target_days_prediction": int(target_days_prediction)
            })

        # WRAP IT in a Dict to macth BatchPredictionRequest in main.py
        custom_payload = {
            "target_days_prediction": int(target_days_prediction),
            "requests_list": payload,
        }
            
        try: #safely catch any error happened inside try block
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=custom_payload, timeout=5) # send the payload data to target URL to be processed within 5 seconds
            
            if response.status_code == 200:
                new_records = [
                    OrderPrediction( # Stored in Model Instance
                        product_id = item["product_id"],  # access its ID by '_' (while '__' only for DB query)
                        demand_prediction = item["predicted_demand"], 
                        order_suggestion = item["suggested_order"],
                        target_timing = timezone.localdate() + timedelta(days=target_days_prediction)
                    )
                    # LOOP COMPREHENSIVE. It loops through all prediction dict returned by FastAPI
                    for item in response.json() 
                ]

                # WRAP DB SAVE IN sync_to_async TO FIX Async Context Error
                if new_records:
                    await sync_to_async(OrderPrediction.objects.bulk_create)(new_records)

                return {"total_processed": len(new_records)}

            return {"total_processed": 0, "error": f"FastAPI error: {response.status_code}"}
        
        except Exception as e:
            print(f"Error in batch prediction: {str(e)}")
            return {"total_processed": 0, "error": "Connection failed"} # skipped error part and goes to next



class SpoilageNotificationService():
    @staticmethod
    async def check_spoilage():
        almost_expired_prod = Product.objects.filter( # no need await
            expire_date__lt = timezone.localdate() + timedelta(days=14), # 14 days
            is_deleted = False
        )

        notifications_count = 0
        notif_list = []
        show_result = []

        # loop through each expiring product
        async for prod in almost_expired_prod:
            # each leftover stock of these expiring prod
            stock_left = prod.quantity

            # fetch latest prediction for this prod (as prediction can be multiple)
            prediction = await OrderPrediction.objects.filter(product=prod).afirst()
            predicted_demand = prediction.demand_prediction if prediction else 0

            spoilage_risk = stock_left - predicted_demand
            
            if spoilage_risk <= 0:
                continue # Stock will be sold out before expired (No alert needed) 
            else:
                # Spoilage risk detected!
                already_notified = await SpoilageNotification.objects.filter( # Check if an unread notification already exists for this product
                    product=prod, 
                    is_read=False
                ).aexists()

                if not already_notified:
                    notif_list.append(
                        SpoilageNotification( # Stored in Model Instance, not dict
                            product = prod,
                            level = SpoilageNotification.Level.DANGER if spoilage_risk > 20 else SpoilageNotification.Level.WARNING,
                            message = (
                                f"Spoilage Risk Alert! '{prod.name}' expires in {prod.shelf_life} days, Current stock is {stock_left}, but predicted demand is only {predicted_demand}"
                                f"Estimated waste: {spoilage_risk} units. Consider running a promotion or discount"
                            )
                        )
                    )
                    notifications_count += 1

                    show_result.append({ # indent to this level so it only run when there new spoilage fouund
                        "product_id": prod.id,
                        "product_name": prod.name,
                        "spoilage_risk": spoilage_risk,
                        "level": SpoilageNotification.Level.DANGER if spoilage_risk > 20 else SpoilageNotification.Level.WARNING,
                    })

        await SpoilageNotification.objects.abulk_create(notif_list)
        return {
            "notif_count": f"Spoilage check completed. {notifications_count} new alerts created.",
            "result": show_result if notifications_count>0 else "No new potential spoilage found, please check inbox to see previous notifications created."
        }

