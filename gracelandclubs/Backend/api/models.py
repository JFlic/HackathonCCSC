from django.db import models
from django.contrib.auth.models import AbstractUser

# ✅ Users
class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True)  # Cannot be null
    # Removed default password for security reasons
    email = models.EmailField(unique=True, null=True, blank=True)  # Email is now properly an EmailField
    clubs = models.ForeignKey('Clubs', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username

# ✅ Clubs 
class Clubs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User
    name = models.CharField(max_length=255, default="Standard Plan")  # Plan name
    description = models.TextField(default="Enter Description Here:")  # Plan overview

    # General Information
    imageurl = models.TextField(default="na")

