from django.urls import path
from . import views

urlpatterns = [
    path("/product", views.ProductAPIView.as_view(), name="list-products"),
    path("/product/<int:pk>", views.ProductItemAPIView.as_view(), name="detail-products"),

    path("/sales", views.SalesAPIView.as_view(), name="list-sales"),
    path("/sales/<int:pk>", views.SalesItemAPIView.as_view(), name="detail-sales"),
    
    path("/shelf", views.ShelfAPIView.as_view(), name="list-shelf"),
    path("/shelf/<int:pk>", views.ShelfItemAPIView.as_view(), name="detail-shelf"),
]
