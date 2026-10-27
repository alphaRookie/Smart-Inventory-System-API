from .models import User
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.contrib.auth import authenticate

# here is about protection rule layer, while in `admin.py` is about blocking visual
class UserService:

    @staticmethod
    def save_user(*, user: User | None=None, **kwargs):
        
        # update / create object in RAM
        if user:
            for key, value in kwargs.items():      
                setattr(user, key, value)         
        else:
            user = User(**kwargs)

        # 1. Search for any user that matches any of the unique fields (single database hit instead of three separated actions)
        duplicate = User.objects.filter(
            Q (email=user.email) |
            Q (phone_number=user.phone_number) |
            Q (username=user.username) 
        )  
        
        # exclude current user, so we dont collide with ourself
        if user:
            duplicate = duplicate.exclude(pk=user.pk)

        # 2. If we found someone, identify the specific field
        existing_user = duplicate.first() # return the single actual object
        if existing_user:
            if existing_user.email == user.email:
                raise ValidationError({"email": "A user with this email already exists"})
            if existing_user.username == user.username:
                raise ValidationError({"Username": "This username is already taken"})

            # Only check phone duplicate if the user actually typed a phone number
            if user.phone_number and existing_user.phone_number == user.phone_number:
                raise ValidationError({"Phone number": "This phone number is already registered"})
        
        # 3. Hash the password if a new one was provided
        if 'password' in kwargs and kwargs['password']:
            user.set_password(kwargs['password'])
            
        # 4. Save ONCE at the very end
        user.save()
        return user

    
    @staticmethod
    def authenticate_user(
        email: str | None=None,
        password: str | None=None,
    ):
        if not email or not password:
            raise ValidationError("Email and Password are required")

        # use django built-in to verify hashed password
        user = authenticate(email=email, password=password)

        if not user:
            raise ValidationError("Invalid email or password")
        return user
    