from .models import User
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.contrib.auth import authenticate

import random
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from pathlib import Path
from django.template import Context, Template

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
        # use django built-in to verify hashed password
        user = authenticate(email=email, password=password)

        if not user:
            raise ValidationError("Invalid email or password")
        return user


    @staticmethod
    def request_password_reset(email):
        try:
            user = User.objects.get(email=email)
            code = f"{random.randint(100000, 999999)}"
            
            # Save the code in Redis/Cache for 900 seconds (15 minutes)
            cache.set(f"reset_code_{user.email}", code, timeout=900)

            plain_message = (
                f"{code} is your password reset code. "
                f"It expires in 15 minutes."
            )

            # where email template located
            template_path = ( 
                Path(__file__).resolve().parents[4]
                / "frontend/src/components/layout/EmailPassReset.html"
            )
            html_template = Template(template_path.read_text(encoding="utf-8"))
            html_message = html_template.render(Context({"code": code}))

            send_mail(
                subject=f"{code} is your password reset code",
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
            )
        except User.DoesNotExist:
            pass 


    @staticmethod
    def verify_password_reset_code(email, code):
        # Retrieve the code from memory
        saved_code = cache.get(f"reset_code_{email}")
        
        if not saved_code:
            raise ValueError("Verification code has expired or does not exist.")
            
        if saved_code != code:
            raise ValueError("Invalid verification code.")
            
        return True


    @staticmethod
    def confirm_password_reset(email, code, new_password):
        UserService.verify_password_reset_code(email, code)
        
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Delete the code from cache so it cannot be reused
        cache.delete(f"reset_code_{email}")
        return user
