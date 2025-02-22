from django.contrib import admin
from .models import NutritionPlan, User  # Fix import

# Register models in Django Admin
admin.site.register(User)
admin.site.register(NutritionPlan)