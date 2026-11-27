from django.db import models
from django.contrib.auth.models import AbstractUser # add custom field

# it comes up with many built-in like username, fname, lname, password. But 3 new field below are custom
class User(AbstractUser): 
    id: int 
    email = models.EmailField(unique=True) # We "Override" email to make it unique for login
    phone_number = models.CharField(max_length=15, blank=True) 

    USERNAME_FIELD = "email" #by default it uses username for login, we force to use Email 
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
