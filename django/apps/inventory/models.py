from django.db import models
from django.utils.translation import gettext_lazy as _ 
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Shelf(models.Model): #enough only 4 shelfs
    class Category(models.TextChoices):
        PERISHABLE = "PERISHABLE", _("Perishable Goods")          # Fresh milk, meat, vegetables
        NON_PERISHABLE = "NON_PERISHABLE", _("Non-Perishable Goods")  # Canned food, grains
        FROZEN = "FROZEN", _("Frozen Food")                       # Requires freezer storage
        HAZMAT = "HAZMAT", _("Hazardous Materials")               # Chemicals, cleaning supplies
    id: int
    category = models.CharField(max_length=50, choices=Category.choices)
    current_stock = models.PositiveIntegerField(default=0) 
    max_shelf_capacity = models.PositiveIntegerField()

    def __str__(self):
        return f"Shelf category:{self.category} ; Id:{self.id}"


class Product(models.Model):
    id: int
    name = models.CharField(max_length=100)
    shelf = models.ForeignKey(Shelf, on_delete=models.PROTECT)
    expire_date = models.DateTimeField(db_index=True)
    shelf_life = models.PositiveIntegerField(editable=False) # autofill from service.py
    quantity = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    selling_price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name


class Sales(models.Model):
    id: int
    created_at = models.DateTimeField(db_index=True, auto_now_add=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity_sold = models.PositiveIntegerField()
    total_revenue = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)], default=Decimal("0.00"), blank=True)

    def __str__(self):
        return f"Sales data of: {self.product.name}"

    
#this is only just for showing info to help, it cant make decision
class OrderPrediction(models.Model):
    id: int
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    demand_prediction = models.PositiveIntegerField()
    order_suggestion = models.PositiveIntegerField()
    target_timing = models.DateTimeField()

    def __str__(self):
        return f"Order prediction for: {self.product.name}"
