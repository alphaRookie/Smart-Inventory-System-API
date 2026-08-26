
from rest_framework import serializers
from .models import Product, Sales, Shelf, OrderPrediction, SpoilageNotification, ProductShelf

class ProductShelfSerializer(serializers.ModelSerializer):
    # "number passed here is referring to shelf.id as actual Shelf object (not just plain number)"
    shelf = serializers.PrimaryKeyRelatedField(queryset=Shelf.objects.all()) 
    class Meta:
        model = ProductShelf
        fields = ["shelf", "quantity"] # no need "id" for post/pacth payload

class ProductSerializer(serializers.ModelSerializer): 
    # Why did i create shelf_allocations?
    # To allow the user to split 1 product across multiple shelves (e.g., 50 units on Shelf 1, 30 units on Shelf 2)
    shelf_allocations = ProductShelfSerializer(
        many=True, 
        required=False
    )
    class Meta: 
        model = Product
        fields = ["id", "name", "type", "expire_date", "shelf_life", "quantity", "shelf_allocations", "unit_cost", "selling_price", "is_deleted", "is_expired"] # replace 'shelves' field with 'shelf_allocations'
        read_only_fields = ["id", "shelf_life", "is_expired"]

class SalesSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Sales
        fields = ["id", "created_at", "product", "quantity_sold", "total_revenue"]
        read_only_fields = ["id", "total_revenue"]

class ShelfSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Shelf
        fields = ["id", "category", "current_stock", "max_shelf_capacity"]
        read_only_fields = ["id", "current_stock"]

class OrderPredictionSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = OrderPrediction
        fields = ["id", "product", "demand_prediction", "order_suggestion", "target_timing"]
        read_only_fields = ["id", "product", "demand_prediction", "order_suggestion", "target_timing"] # put all bcoz AI who inputs it, not user

class SpoilageNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpoilageNotification
        fields = ["id", "product", "message", "level", "is_read", "created_at"]
        read_only_fields = ["id", "created_at"]
