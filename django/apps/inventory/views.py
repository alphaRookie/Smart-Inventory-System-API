from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from typing import cast

from .models import Product, Shelf, Sales, OrderPrediction
from .serializers import ProductSerializer, ShelfSerializer, SalesSerializer, OrderPredictionSerializer
from .services import ProductService, ShelfService, SalesService, OrderPredictionService


class ProductAPIView(APIView):

    def get(self, request):
        product = Product.objects.all() 
        serializer = ProductSerializer(product, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = ProductSerializer(data = request.data) # JSON to Model
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint
        product = ProductService.save_product(
            product=None,
            name=validated_data.get("name"),
            shelf=validated_data.get("shelf"),
            type=validated_data.get("type"),
            expire_date=validated_data.get("expire_date"),
            quantity=validated_data.get("quantity"),
            unit_cost=validated_data.get("unit_cost"),
            selling_price=validated_data.get("selling_price"),
        )
        return Response({
            "message": "New product added",
            "product": ProductSerializer(product).data 
        }, status=status.HTTP_201_CREATED)
    
    
class ProductItemAPIView(APIView):

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk) 
        serializer = ProductSerializer(product) # no need `many=True` bcoz return single obj (Model to JSON)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product, data = request.data, partial=True) # enable PATCH (update some instead all)
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data)
        updated_product = ProductService.save_product(
            product=product,
            name=validated_data.get("name"),
            shelf=validated_data.get("shelf"),
            type=validated_data.get("type"),
            expire_date=validated_data.get("expire_date"),
            quantity=validated_data.get("quantity"),
            unit_cost=validated_data.get("unit_cost"),
            selling_price=validated_data.get("selling_price"),
        )
        return Response({
            "message": "Product updated",
            "product": ProductSerializer(updated_product).data
        }, status=status.HTTP_200_OK) 

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk) 
        shelf = get_object_or_404(Shelf, product=product) 
        ProductService.delete_product(product=product, shelf=shelf)
        return Response({"message": f"{product.name} deleted"},status=status.HTTP_200_OK)



class ShelfAPIView(APIView):

    def get(self, request):
        shelf = Shelf.objects.all() 
        serializer = ShelfSerializer(shelf, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = ShelfSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint
        shelf = ShelfService.save_shelf(
            shelf=None,
            category=validated_data.get("category"),
            max_shelf_capacity=validated_data.get("max_shelf_capacity"),
            current_stock=validated_data.get("current_stock"),
        )
        return Response({
            "message": "New shelf added",
            "stock level": ShelfSerializer(shelf).data 
        }, status=status.HTTP_201_CREATED)
    
    
class ShelfItemAPIView(APIView):

    def get(self, request, pk):
        shelf = get_object_or_404(Shelf, pk=pk) 
        serializer = ShelfSerializer(shelf) 
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        shelf = get_object_or_404(Shelf, pk=pk)
        serializer = ShelfSerializer(shelf, data = request.data, partial=True) 
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data)
        updated_shelf = ShelfService.save_shelf(
            shelf=shelf,
            category=validated_data.get("category"),
            max_shelf_capacity=validated_data.get("max_shelf_capacity"),
            current_stock=validated_data.get("current_stock"),
        )
        return Response({
            "message": "Shelf updated",
            "shelf": ShelfSerializer(updated_shelf).data
        }, status=status.HTTP_200_OK) 

    def delete(self, request, pk):
        shelf = get_object_or_404(Shelf, pk=pk)
        shelf_id = shelf.id
        shelf.delete()
        return Response({"message": f"Shelf id: {shelf_id} deleted"},status=status.HTTP_200_OK)  



class SalesAPIView(APIView):

    def get(self, request):
        sales = Sales.objects.all() 
        serializer = SalesSerializer(sales, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = SalesSerializer(data = request.data) # JSON to Model
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint
        sales = SalesService.save_sales( # no need to include "created_at" in views bcoz it's auto add
            product=validated_data["product"],# STRICT TYPE --because we dont allow patch
            quantity_sold=validated_data["quantity_sold"],
            shelf=validated_data.get("shelf"), #type:ignore --returns None instead of throwing a KeyError
        )
        return Response({
            "message": "New sales added",
            "sales": SalesSerializer(sales).data 
        }, status=status.HTTP_201_CREATED)
    
    
class SalesItemAPIView(APIView):

    def get(self, request, pk):
        sales = get_object_or_404(Sales, pk=pk) 
        serializer = SalesSerializer(sales) # no need `many=True` bcoz return single obj (Model to JSON)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        sales = get_object_or_404(Sales, pk=pk)
        sales_id = sales.id
        sales.delete()
        return Response({"message": f"Sales id: {sales_id} deleted"},status=status.HTTP_200_OK)
