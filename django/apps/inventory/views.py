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
            product=None, **validated_data
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
            product=product, **validated_data
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
            shelf=None, **validated_data
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
            shelf=shelf, **validated_data
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
        validated_data = cast(dict, serializer.validated_data) 
        sales = SalesService.save_sales( 
            **validated_data
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



class OrderPredictionAPIView(APIView):

    def get(self, request):
        order_prediction = OrderPrediction.objects.all() 
        serializer = OrderPredictionSerializer(order_prediction, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class OrderPredictionItemAPIView(APIView):

    def get(self, request, pk):
        order_prediction = get_object_or_404(OrderPrediction, pk=pk) 
        serializer = OrderPredictionSerializer(order_prediction) 
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        order_prediction = get_object_or_404(OrderPrediction, pk=pk)
        order_prediction.delete()
        return Response({"message": f"OrderPrediction data deleted"},status=status.HTTP_200_OK)


@api_view(['POST'])
def get_prediction_dashboard(request, product_id):
    """
    View that triggers the AI prediction for a specific product and displays it on the dashboard.
    """
    product = get_object_or_404(Product, id=product_id) # ambil spesific product based on id referring to URL yg diketik
    shelf = get_object_or_404(Shelf, product=product) # once we found that product, find which spesific shelf that carry this product
    
    ai_data = OrderPredictionService.fetch_ai_prediction(
        product=product,
        shelf=shelf
    )
    
    if not ai_data:
        return Response({"error": "Could not contact the FastAPI AI prediction engine."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response({ # Return JSON result to the dashboard
        "product_id": product.id,
        "product_name": product.name,
        "product_type": product.type,
        "predicted_demand": ai_data.get("predicted_demand"),
        "suggested_order": ai_data.get("suggested_order")
    }, status=status.HTTP_200_OK)

