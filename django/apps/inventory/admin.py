from django.contrib import admin
from .models import Product, Sales, Shelf, OrderPrediction, ProductShelf


class ProductShelfInline(admin.TabularInline):
    """Allows managing shelf allocations directly inside the Product admin page"""
    model = ProductShelf
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "get_shelves", "expire_date", "shelf_life", "quantity", "unit_cost", "type", "selling_price", "is_expired", "is_deleted") # use tuple(unchangeable) instead of list 
    readonly_fields = ("shelf_life",)
    list_filter = ("shelves",) # filter by M2M field name
    search_fields = ("name",) 
    date_hierarchy = "expire_date" 
    inlines = [ProductShelfInline]

    @admin.display(description="Shelves")

    # Custom method to display assigned shelves in a list separated by comma
    def get_shelves(self, obj):
        return ", ".join([str(shelf) for shelf in obj.shelves.all()])

    # Optimize query performance to prevent N+1 queries when loading list_display
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("shelves")
    

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


@admin.register(ProductShelf)
class ProductShelfAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "shelf", "quantity")
    list_filter = ("product", "shelf")
