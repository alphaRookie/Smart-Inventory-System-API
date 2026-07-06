
from rest_framework import serializers
from .models import Product, Sales, WeatherRecord, StockLevel, OrderPrediction


class ProductSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Product
        fields = ["id", "name", "category", "expire_date", "shelf_life", "unit_cost", "selling_price"]
        read_only_fields = ["id", "shelf_life"]

class SalesSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Sales
        fields = ["id", "date", "product", "quantity_sold", "total_revenue"]
        read_only_fields = ["id", "total_revenue"]

class WeatherRecordSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = WeatherRecord
        fields = ["id", "date", "avg_temp", "humidity", "condition"]
        read_only_fields = ["id"] # Dont make readonly! bcz weather API create the records, it needs to send a POST request to Django to save them

class StockLevelSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = StockLevel
        fields = ["id", "product", "current_stock", "max_shelf_capacity"]
        read_only_fields = ["id"]

class OrderPredictionSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = OrderPrediction
        fields = ["id", "product", "demand_prediction", "order_suggestion", "target_timing"]
        read_only_fields = ["id", "product", "demand_prediction", "order_suggestion", "target_timing"] # put all bcoz AI who inputs it, not user
