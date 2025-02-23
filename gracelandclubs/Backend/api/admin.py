from django.contrib import admin
from .models import  User, Clubs, Event # Fix import

# Register models in Django Admin
admin.site.register(User)
admin.site.register(Clubs)
admin.site.register(Event)
