from django.db import models
from django.utils.translation import gettext_lazy as _ 
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.utils import timezone


class Shelf(models.Model):
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
    class WeatherBehavior(models.TextChoices):
        HEAT_BOOST = "HEAT_BOOST", _("Heat-Responsive") # Sales goes up when it's hot
        COLD_BOOST = "COLD_BOOST", _("Cold-Responsive") # Sales goes up when it's cold
        WEATHER_NEUTRAL = "WEATHER_NEUTRAL", _("All-Weather") # Sales are steady, ignore the weather
    id: int
    name = models.CharField(max_length=100)
    shelf = models.ForeignKey(Shelf, on_delete=models.PROTECT)
    type = models.CharField(max_length=50, choices=WeatherBehavior.choices)
    expire_date = models.DateTimeField(db_index=True)
    quantity = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    selling_price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

    @property
    def shelf_life(self):
        """ Calculates remaining shelf life dynamically based on the current date (Returns 7 today, 6 tomorrow, 5 the day after, and stops at 0). """
        if self.expire_date:
            date_diff = self.expire_date - timezone.now()
            return max(date_diff.days, 0) # "take the calculated days, but limit it at a minimum of 0"
        return 0 

    # 'is_expire' auto trigger when expire_date passes. while 'is_deleted' is manually Human click "Delete" (must record that explicit action)
    @property
    def is_expired(self):
        """ When product hits 0 shelf life, automatically marks it """
        if self.shelf_life == 0:
            return True
        return False


class Sales(models.Model):
    id: int
    created_at = models.DateTimeField(db_index=True, auto_now_add=True) # no need to add in views anymore
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


class SpoilageNotification(models.Model):
    class Level(models.TextChoices):
        WARNING = "WARNING", _("Warning")
        DANGER = "DANGER", _("Danger")
    id:int
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    message = models.TextField()
    level = models.CharField(max_length=10, choices=Level.choices, default=Level.WARNING)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.product.name}: {self.level}"
