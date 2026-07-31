from django.urls import path
from . import views

urlpatterns = [
    path("/product", views.ProductAPIView.as_view(), name="list-products"),
    path("/product/<int:pk>", views.ProductItemAPIView.as_view(), name="detail-products"),

    path("/sales", views.SalesAPIView.as_view(), name="list-sales"),
    path("/sales/<int:pk>", views.SalesItemAPIView.as_view(), name="detail-sales"),
    
    path("/shelf", views.ShelfAPIView.as_view(), name="list-shelf"),
    path("/shelf/<int:pk>", views.ShelfItemAPIView.as_view(), name="detail-shelf"),

    path("/predictions", views.OrderPredictionAPIView.as_view(), name="list-all-prediction"),
    path("/predictions/<int:pk>", views.OrderPredictionItemAPIView.as_view(), name="detail-prediction"),

    # endpoint to run the whole prediction process
    path("/predict/<int:product_id>", views.OrderPredictionView.as_view(), name="prediction-process"), 
]
