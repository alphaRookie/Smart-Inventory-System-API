from django.contrib import admin
from .models import Product, Sales, Shelf, OrderPrediction

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "shelf", "expire_date", "shelf_life", "quantity", "unit_cost", "selling_price", "is_deleted") # use tuple(unchangeable) instead of list 
    readonly_fields = ("shelf_life",)
    list_filter = ("shelf",)
    date_hierarchy = "expire_date" 
    

@admin.register(Sales)
class SalesAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "product", "quantity_sold", "total_revenue")
    list_filter = ("product",) # Comma needed, bcoz it's Tuple (a list of items) not string
    date_hierarchy = "created_at"
   

@admin.register(Shelf)
class ShelfAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "current_stock", "max_shelf_capacity") 
    list_filter = ("category",)


@admin.register(OrderPrediction)
class OrderPredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "demand_prediction", "order_suggestion", "target_timing")
    list_filter = ("product",)
    date_hierarchy = "target_timing"
