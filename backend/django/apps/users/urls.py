from django.urls import path, include
from .views import UserProfileAPIView, LoginUserAPIView, RegisterUserAPIView, LogoutUserAPIView, GoogleLogin

urlpatterns = [
    path("register", RegisterUserAPIView.as_view(), name="register-user"),
    path("login", LoginUserAPIView.as_view(), name="login-user"),
    path("logout", LogoutUserAPIView.as_view(), name="logout-user"),
    path("google", GoogleLogin.as_view(), name="google-login"),

    path("profile", UserProfileAPIView.as_view(), name="profile-user"),

    path("forgot-password", include("dj_rest_auth.urls")), # only keep dj-rest-auth for Password Reset
]
