from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny 
from typing import cast
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import User
from .serializers import WriteModelSerializer, WriteNonModelSerializer, ReadUserSerializer
from .services import UserService
from .permissions import IsAccOwner, IsManager

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


@extend_schema_view(
    get=extend_schema(summary="For user to access his Profile", responses={200: ReadUserSerializer}),
    patch=extend_schema(summary="To change User's Profile", request=WriteModelSerializer, responses={201: WriteModelSerializer})
)
# allow spesific logged-in user to see 'his own' profile, also update it
class UserProfileAPIView(APIView):
    permission_classes = [IsAccOwner] 
    
    def get(self, request):
        serializer = ReadUserSerializer(request.user) #we use `request.user` bcoz they already logged-in
        return Response(serializer.data, status=status.HTTP_200_OK) # let frontend handle the message for `GET`
    
    def patch(self, request):
        # We use WriteModelSerializer for the INPUT (it has the validation rules)
        # But we use ReadUserSerializer for the OUTPUT (the response)
        serializer = WriteModelSerializer(request.user, data=request.data, partial=True) #compare
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint

        update_user = UserService.save_user(
            user=request.user, 
            **validated_data
        )

        # Why there's no access & refresh token?
        # Changing a username or phone_number doesn't change "who" the user is, the token is still valid
        return Response({
            "message": "Profile updated",
            "user": ReadUserSerializer(update_user).data 
        }, status=status.HTTP_200_OK)
        

@extend_schema_view(
    post=extend_schema(summary="To register an Account", request=WriteModelSerializer, responses={201: WriteModelSerializer})
)
class RegisterUserAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = WriteModelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint

        register_user = UserService.save_user(
            user=None,
            **validated_data
        )

        refresh = RefreshToken.for_user(register_user)

        return Response({
            "message": "Register successful",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": ReadUserSerializer(register_user).data,
            }, status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    post=extend_schema(summary="Login to a Registered Account", description="Authenticate a user with email and password to receive Bearer tokens.", request=WriteNonModelSerializer, responses={200: WriteNonModelSerializer})
)
class LoginUserAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = WriteNonModelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data) # To shut pylance complaint
        
        login_user = cast(User, UserService.authenticate_user(# cast will catch typo error like "print(login_user.is_cinema_vp)"
            **validated_data
        ))

        refresh = RefreshToken.for_user(login_user)

        return Response({
            "message": "Login successful",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": ReadUserSerializer(login_user).data,
        }, status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(summary="Log-out from an Account")
)
class LogoutUserAPIView(APIView): # This logs out the refresh_token, not access_toke
    permission_classes = [IsAccOwner]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get("refresh")) # The Frontend must send the "refresh" token in the body
            token.blacklist() # This is where the 'token_blacklist' app does its job

            return Response({"message": "Logout successful. Token is now invalid."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": "Invalid token or already logged out."}, status=status.HTTP_400_BAD_REQUEST)
