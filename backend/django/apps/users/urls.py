from django.urls import path, include
from .views import UserProfileAPIView, LoginUserAPIView, RegisterUserAPIView, LogoutUserAPIView, GoogleLogin, PasswordChangeAPIView

urlpatterns = [
    path("register", RegisterUserAPIView.as_view(), name="register-user"),
    path("login", LoginUserAPIView.as_view(), name="login-user"),
    path("google", GoogleLogin.as_view(), name="google-login"),
    path("logout", LogoutUserAPIView.as_view(), name="logout-user"),

    path("profile", UserProfileAPIView.as_view(), name="profile-user"),
    path("change-password", PasswordChangeAPIView.as_view(), name="change-password"),

    path("forgot-password", include("dj_rest_auth.urls")), # only keep dj-rest-auth for Password Reset
]
