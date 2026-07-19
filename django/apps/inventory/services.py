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
    def save_product(
        product: Product | None=None,
        name: str | None=None, 
        type: str |None=None,
        shelf: Shelf | None=None,
        expire_date:datetime | None=None,
        unit_cost:Decimal | None=None,
        selling_price:Decimal | None=None,
        quantity:int | None=None,
    ):
        if product:
            # constantly checking if blabla is not None, because a human might only update one field and leave the rest blank
            product.name = name if name is not None else product.name
            product.shelf = shelf if shelf is not None else product.shelf
            product.type = type if type is not None else product.type
            product.expire_date = expire_date if expire_date is not None else product.expire_date
            product.unit_cost = unit_cost if unit_cost is not None else product.unit_cost
            product.selling_price = selling_price if selling_price is not None else product.selling_price
            product.quantity = quantity if quantity is not None else product.quantity

        else:
            product = Product(
                name=name,
                shelf=shelf,
                type=type,
                expire_date=expire_date,
                unit_cost=unit_cost,
                selling_price=selling_price,
                quantity=quantity,
            )

        # No matter if it's new or an update, we recalculate 
        if expire_date:
            date_diff = expire_date - timezone.now()
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
