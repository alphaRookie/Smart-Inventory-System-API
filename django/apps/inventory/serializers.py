
from rest_framework import serializers
from .models import Product, Sales, Shelf, OrderPrediction


class ProductSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Product
        fields = ["id", "name", "shelf", "expire_date", "shelf_life", "quantity", "unit_cost", "selling_price", "is_deleted"]
        read_only_fields = ["id", "shelf_life"]

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
