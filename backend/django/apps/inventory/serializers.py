
from rest_framework import serializers
from .models import Product, Sales, Shelf, OrderPrediction, SpoilageNotification, ProductShelf
from django_celery_beat.models import PeriodicTask

class ProductShelfSerializer(serializers.ModelSerializer):
    # "number passed here is referring to shelf.id as actual Shelf object (not just plain number)"
    shelf = serializers.PrimaryKeyRelatedField(queryset=Shelf.objects.all()) 
    class Meta:
        model = ProductShelf
        fields = ["shelf", "quantity"] # no need "id" for post/pacth payload

class ProductSerializer(serializers.ModelSerializer): 
    # Why did i create shelf_allocations?
    # To allow the user to split 1 product across multiple shelves (e.g., 50 units on Shelf 1, 30 units on Shelf 2)
    shelf_allocations = ProductShelfSerializer(many=True)
    class Meta: 
        model = Product
        fields = ["id", "name", "type", "expire_date", "shelf_life", "quantity", "shelf_allocations", "unit_cost", "selling_price", "is_deleted", "is_expired"] # replace 'shelves' field with 'shelf_allocations'
        read_only_fields = ["id", "shelf_life", "is_expired"]


# a serializer reverse version of shelf_allocation
# Note: bcoz "shelf_allocations" already handle WRITE, so "product_allocations" can access reverse relation of it without need WRITE anymore
class ShelfProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductShelf
        fields = ["product", "quantity"]
        depth = 1 # so "product" can be access as obj, not just id 

class ShelfSerializer(serializers.ModelSerializer): 
    product_allocations = ShelfProductSerializer(many=True, read_only=True)
    class Meta: 
        model = Shelf
        fields = ["id", "category", "current_stock", "max_shelf_capacity", "product_allocations"]
        read_only_fields = ["id", "current_stock", "product_allocations"] # the reverse MUST BE read_only !


class SalesSerializer(serializers.ModelSerializer): 
    # Asks Django to send the full product object, not just the ID 
    product_obj = ProductSerializer(source='product', read_only=True)
    class Meta: 
        model = Sales
        fields = ["id", "created_at", "product", "quantity_sold", "total_revenue", "product_obj"]
        read_only_fields = ["id", "total_revenue"]

class OrderPredictionSerializer(serializers.ModelSerializer): 
    product_obj = ProductSerializer(source='product', read_only=True)
    class Meta: 
        model = OrderPrediction
        fields = ["id", "product", "demand_prediction", "order_suggestion", "target_timing", "product_obj"]
        read_only_fields = ["id", "product", "demand_prediction", "order_suggestion", "target_timing"] # put all bcoz AI who inputs it, not user

class SpoilageNotificationSerializer(serializers.ModelSerializer):
    product_obj = ProductSerializer(source='product', read_only=True)
    class Meta:
        model = SpoilageNotification
        fields = ["id", "product", "message", "level", "is_read", "created_at", "product_obj"]
        read_only_fields = ["id", "created_at"]


# Serializer for Task scheduler PATCH and GET
class TaskUpdateSerializer(serializers.Serializer):
    hour = serializers.IntegerField(min_value=0, max_value=23, required=False)
    minute = serializers.IntegerField(min_value=0, max_value=59, required=False)
    every_n_days = serializers.IntegerField(min_value=1, max_value=31, required=False)
    enabled = serializers.BooleanField(required=False)

class TaskListSerializer(serializers.ModelSerializer):
    hour = serializers.CharField(source='crontab.hour')
    minute = serializers.CharField(source='crontab.minute')
    day_of_month = serializers.CharField(source='crontab.day_of_month')

    class Meta:
        model = PeriodicTask
        fields = ['id', 'name', 'task', 'enabled', 'hour', 'minute', 'day_of_month']
