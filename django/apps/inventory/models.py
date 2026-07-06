from django.db import models
from django.utils.translation import gettext_lazy as _ 
from django.core.validators import MinValueValidator, MaxValueValidator


class Product(models.Model):
    class Category(models.TextChoices):
        NON_CATEGORY = "NON_CATEGORY", _("Non-Category")
        CATEGORY_A = "CATEGORY_A", _("Category A")
        CATEGORY_B = "CATEGORY_B", _("Category B")
        CATEGORY_C = "CATEGORY_C", _("Category C")

    id: int
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.NON_CATEGORY)
    expire_date = models.DateTimeField(db_index=True)
    shelf_life = models.IntegerField(editable=False) # autofill from service.py
    unit_cost = models.IntegerField()
    selling_price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])

    def __str__(self):
        return self.name


class Sales(models.Model):
    id: int
    date = models.DateTimeField(db_index=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity_sold = models.IntegerField()
    total_revenue = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"Sales data of: {self.product.name}"
    

class WeatherRecord(models.Model):
    id: int
    date = models.DateTimeField(db_index=True)
    avg_temp = models.DecimalField(max_digits=4, decimal_places=1)
    humidity = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)]) 
    condition = models.CharField(max_length=50)

    def __str__(self):
        return f"Weather data at {self.date}"
    

class StockLevel(models.Model):
    id: int
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    current_stock = models.IntegerField()
    max_shelf_capacity = models.IntegerField()

    def __str__(self):
        return f"Stock of {self.product.name}: {self.current_stock} left"
    

#this is only just for showing info to help, it cant make decision
class OrderPrediction(models.Model):
    id: int
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    demand_prediction = models.IntegerField()
    order_suggestion = models.IntegerField()
    target_timing = models.DateTimeField()

    def __str__(self):
        return f"Order prediction for: {self.product.name}"
