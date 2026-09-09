from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404, aget_object_or_404
from typing import cast
from drf_spectacular.utils import extend_schema, extend_schema_view

from adrf.views import APIView # auto-recognize when async def mentioned

from .models import Product, Shelf, Sales, OrderPrediction, SpoilageNotification
from .serializers import ProductSerializer, ShelfSerializer, SalesSerializer, OrderPredictionSerializer, SpoilageNotificationSerializer
from .services import ProductService, ShelfService, SalesService, OrderPredictionService, SpoilageNotificationService


@extend_schema_view(
    get=extend_schema(summary="List all Products", responses={200: ProductSerializer(many=True)}),
    post=extend_schema(summary="Adds a New Product", request=ProductSerializer, responses={201: ProductSerializer})
)
class ProductAPIView(APIView):

    def get(self, request):
        product = Product.objects.all() 
        serializer = ProductSerializer(product, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        # 1. REQUEST STAGE: Use serializer to READ and VALIDATE incoming JSON
        serializer = ProductSerializer(data = request.data) # JSON to Model
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint

        # Hand off validated data to service layer
        product = ProductService.save_product(
            product=None, **validated_data
        )

        # 2. RESPONSE STAGE: Use serializer to format database model back into JSON
        return Response({
            "message": "New product added",
            "product": ProductSerializer(product).data 
        }, status=status.HTTP_201_CREATED)
    
@extend_schema_view(
    get=extend_schema(summary="Returns the details of a specific Product by ID", responses={200: ProductSerializer}),
    patch=extend_schema(summary="Updates an existing Product", request=ProductSerializer, responses={200: ProductSerializer}),
    delete=extend_schema(summary="Deletes a Product by ID", responses={204: None})
)
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
        product = get_object_or_404(Product, pk=pk) # ambil spesific product based on id referring to URL yg diketik
        ProductService.delete_product(product=product)
        return Response({"message": f"{product.name} deleted"},status=status.HTTP_200_OK)



@extend_schema_view(
    get=extend_schema(summary="List all Shelves", responses={200: ShelfSerializer(many=True)}),
    post=extend_schema(summary="Adds a New Shelf", request=ShelfSerializer, responses={201: ShelfSerializer})
)
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
    
@extend_schema_view(
    get=extend_schema(summary="Returns the details of a specific Shelf by ID", responses={200: ShelfSerializer}),
    patch=extend_schema(summary="Updates an existing Shelf", request=ShelfSerializer, responses={200: ShelfSerializer}),
    delete=extend_schema(summary="Deletes a Shelf by ID",responses={204: None})
)
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



@extend_schema_view(
    get=extend_schema(summary="List all Sales", responses={200: SalesSerializer(many=True)}),
    post=extend_schema(summary="Adds a New Sale", request=SalesSerializer, responses={201: SalesSerializer})
)
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
    
@extend_schema_view(
    get=extend_schema(summary="Retrieves the details of a specific Sale by ID", responses={200: SalesSerializer}),
    delete=extend_schema(summary="Deletes a Sales by ID", responses={204: None})
)
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



@extend_schema_view(
    get=extend_schema(summary="List all Predicted Orders", responses={200: OrderPredictionSerializer(many=True)}),
)
class OrderPredictionAPIView(APIView):

    def get(self, request):
        order_prediction = OrderPrediction.objects.all() 
        serializer = OrderPredictionSerializer(order_prediction, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@extend_schema_view(
    get=extend_schema(summary="Retrieves the details of a specific Predicted Order by ID", responses={200: OrderPredictionSerializer}),
    delete=extend_schema(summary="Deletes a Predicted order by ID", responses={204: None})
)
class OrderPredictionItemAPIView(APIView):

    def get(self, request, pk):
        order_prediction = get_object_or_404(OrderPrediction, pk=pk) 
        serializer = OrderPredictionSerializer(order_prediction) 
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        order_prediction = get_object_or_404(OrderPrediction, pk=pk)
        order_prediction.delete()
        return Response({"message": f"OrderPrediction data deleted"},status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(summary="Runs a New Order Prediction for a single target Product", request=OrderPredictionSerializer, responses={201: OrderPredictionSerializer})
)
class SingleOrderPredictionView(APIView):
    """ View that triggers the AI prediction for a specific product and displays it on the dashboard """

    async def post(self, request, product_id):
        product = await aget_object_or_404(Product, id=product_id) 
        
        ai_data = await OrderPredictionService.fetch_single_prediction(product=product)
        
        if not ai_data:
            return Response({"error": "Could not contact the FastAPI AI prediction engine."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({ # Return JSON result to the dashboard
            "product_id": product.id,
            "product_name": product.name,
            "product_type": product.type,
            "predicted_demand": ai_data.get("predicted_demand"), # dont use 'aget' on ai_data because this just a regular Python dict sitting in memory
            "suggested_order": ai_data.get("suggested_order")
        }, status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(summary="Runs a New Order Predictions for all Products in a single run", request=OrderPredictionSerializer, responses={201: OrderPredictionSerializer})
)
class BatchOrderPredictionView(APIView):
    """ Optional action to manually triggers the AI prediction for all products (by default this automatically run by celery) """

    async def post(self, request):
        ai_data = await OrderPredictionService.fetch_batch_prediction()

        if not ai_data:
            return Response({"error": "Could not contact the FastAPI AI prediction engine."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
       
        return Response({
            "message": "Batch predictions successfully done",
            "total_processed": ai_data.get("total_processed"), 
        }, status=status.HTTP_200_OK)



@extend_schema_view(
    get=extend_schema(summary="List all results of Spoilage Check", responses={200: SpoilageNotificationSerializer(many=True)})
)
class SpoilageNotificationAPIView(APIView):

    def get(self, request):
        spoilage_notif = SpoilageNotification.objects.all() 
        serializer = SpoilageNotificationSerializer(spoilage_notif, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@extend_schema_view(
    get=extend_schema(summary="Retrieves a specific result of Spoilage Check by ID", responses={200: SpoilageNotificationSerializer}),
    delete=extend_schema(summary="Deletes a Spoilage Check result by ID", responses={204: None})
)
class SpoilageNotificationItemAPIView(APIView):

    def get(self, request, pk):
        spoilage_notif = get_object_or_404(SpoilageNotification, pk=pk) 
        serializer = SpoilageNotificationSerializer(spoilage_notif) 
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        spoilage_notif = get_object_or_404(SpoilageNotification, pk=pk)
        spoilage_notif.delete()
        return Response({"message": "Notification message deleted"},status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(summary="Runs the Spoilage check", request=SpoilageNotificationSerializer, responses={201: SpoilageNotificationSerializer})
)
class SpoilageCheckView(APIView):
    """ Optional action to manually triggers spoilage check (by default this automatically run by celery) """

    async def post(self, request):
        ai_data = await SpoilageNotificationService.check_spoilage()

        if not ai_data:
            return Response({"error": "Could not contact the FastAPI AI prediction engine."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
       
        return Response({
            "message": ai_data.get("notif_count"), 
            "predictions": ai_data.get("result")  # List prediction results if found the new, otherwise show text (service)
        }, status=status.HTTP_200_OK) 
