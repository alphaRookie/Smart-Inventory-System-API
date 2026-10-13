from django.urls import path
from . import views

urlpatterns = [
    path("product", views.ProductAPIView.as_view(), name="list-products"),
    path("product/<int:pk>", views.ProductItemAPIView.as_view(), name="detail-products"),

    path("sales", views.SalesAPIView.as_view(), name="list-sales"),
    path("sales/<int:pk>", views.SalesItemAPIView.as_view(), name="detail-sales"),
    
    path("shelf", views.ShelfAPIView.as_view(), name="list-shelf"),
    path("shelf/<int:pk>", views.ShelfItemAPIView.as_view(), name="detail-shelf"),

    path("predictions", views.OrderPredictionAPIView.as_view(), name="list-prediction"),
    path("predictions/<int:pk>", views.OrderPredictionItemAPIView.as_view(), name="detail-prediction"),

    # endpoint to run the whole prediction process
    path("predict/<int:product_id>", views.SingleOrderPredictionView.as_view(), name="single-prediction-process"), 
    path("predict-batch", views.BatchOrderPredictionView.as_view(), name="batch-prediction-process"), 

    path("spoilage-check", views.SpoilageCheckView.as_view(), name="spoilage-check"),
    path("spoilage-notif", views.SpoilageCheckAPIView.as_view(), name="spoilage-notif"),
    path("spoilage-notif/<int:pk>", views.SpoilageCheckItemAPIView.as_view(), name="spoilage-notif-detail"),

    path('task-scheduler', views.TaskSchedulerView.as_view(), name='task-scheduler-list'),
    path('task-scheduler/<int:pk>', views.TaskSchedulerView.as_view(), name='task-scheduler-detail'),

    path('notification', views.NotificationView.as_view(), name='notif-list'),
    path('notification/<int:pk>', views.NotificationItemAPIView.as_view(), name='notif-detail'),
]
