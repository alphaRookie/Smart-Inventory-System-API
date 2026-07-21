import requests
from .models import Product, Sales, Shelf, OrderPrediction
from datetime import timedelta, date, datetime
from decimal import Decimal
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db.models.functions import Coalesce
from django.db.models import Count, Q, F, Sum


class ProductService():

    @staticmethod
    def save_product(product: Product | None=None, **kwargs):

        # receive the raw kwargs package and filter out None value
        clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

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

        if shelf:
            for key, value in clean_kwargs.items():      
                setattr(shelf, key, value)         
        else:
            shelf = Shelf(**clean_kwargs)

        shelf.save()
        return shelf


class SalesService():

    @staticmethod
    def save_sales(**kwargs):
        clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

        # Instantiate in RAM, dont save directly by 'Sales.object.create'
        sales = Sales(**clean_kwargs) 

        # logic to auto-create 'total_revenue' field
        if sales.quantity_sold and sales.product:
            sales.total_revenue = sales.quantity_sold * sales.product.selling_price
        else:
            sales.total_revenue = Decimal("0")
            
        sales.save() 
        return sales
