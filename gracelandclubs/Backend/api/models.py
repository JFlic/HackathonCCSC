from django.db import models
from django.contrib.auth.models import AbstractUser

# ✅ Activity Level Choices (Structured & Validated)
ACTIVITY_LEVELS = [
    ("Sedentary", "Little or no exercise (BMR × 1.2)"),
    ("Lightly Active", "Light exercise 1-3 days/week (BMR × 1.375)"),
    ("Moderately Active", "Moderate exercise 3-5 days/week (BMR × 1.55)"),
    ("Very Active", "Hard exercise 6-7 days/week (BMR × 1.725)"),
    ("Super Active", "Very hard exercise/physical job (BMR × 1.9)"),
]

# ✅ Nutrition Plan Model
class NutritionPlan(models.Model):
    name = models.CharField(max_length=255, default="Standard Plan")  # Plan name
    description = models.TextField(default="Default nutrition plan description")  # Plan overview

    # General Information
    age = models.CharField(max_length=255, default="na")
    sex = models.CharField(max_length=10, default="Unspecified")
    height = models.CharField(max_length=255, default="All")
    weight = models.CharField(max_length=255, default="Metabolism Factor")
    formula_written = models.TextField(default="Standard formula")
    factor_name = models.CharField(max_length=255, default="Metabolism Factor")
    factor_value = models.CharField(max_length=255, default="NA")

    # Macronutrients
    daily_calories = models.CharField(max_length=255, default="na")
    carbohydrates_g = models.CharField(max_length=255, default="na")
    proteins_g = models.CharField(max_length=255, default="na")
    fats_g = models.CharField(max_length=255, default="na")
    hydration = models.CharField(max_length=255, default="na")

    # Micronutrients
    boron_mg = models.CharField(max_length=255, default="na")
    calcium_mg = models.CharField(max_length=255, default="na")
    iron_mg = models.CharField(max_length=255, default="na")
    selenium_ug = models.CharField(max_length=255, default="na")
    zinc_mg = models.CharField(max_length=255, default="na")
    sodium_mg = models.CharField(max_length=255, default="na")

    def __str__(self):
        return self.name

# ✅ Custom User Model
class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True)  # Cannot be null
    password = models.CharField(max_length=128, default="temporarypassword")  # ✅ Set a temporary default

    email = models.EmailField(unique=True, null=True, blank=True)  # Email is now properly an EmailField
    age = models.IntegerField(null=True, blank=True)
    weight = models.CharField(max_length=255, null=True, blank=True)  # Keep as string if it's stored as text
    height = models.CharField(max_length=255, null=True, blank=True)
    activity_level = models.CharField(max_length=50, choices=ACTIVITY_LEVELS, null=True, blank=True)
    vegan = models.BooleanField(default=False)
    vegetarian = models.BooleanField(default=False)
    nutrition_plan = models.ForeignKey(NutritionPlan, on_delete=models.SET_NULL, null=True, blank=True)

    # Macronutrients
    daily_calories = models.CharField(max_length=255, null=True, blank=True)
    carbohydrates_g = models.CharField(max_length=255, null=True, blank=True)
    proteins_g = models.CharField(max_length=255, null=True, blank=True)
    fats_g = models.CharField(max_length=255, null=True, blank=True)

    # Micronutrients
    boron_mg = models.CharField(max_length=255, null=True, blank=True)
    calcium_mg = models.CharField(max_length=255, null=True, blank=True)
    iron_mg = models.CharField(max_length=255, null=True, blank=True)
    selenium_ug = models.CharField(max_length=255, null=True, blank=True)
    zinc_mg = models.CharField(max_length=255, null=True, blank=True)
    sodium_mg = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.username

# ✅ Meals Linked to a User & Nutrition Plan
class UserMeals(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User
    nutrition_plan = models.ForeignKey(NutritionPlan, on_delete=models.CASCADE, null=True, blank=True)  # Now linked properly
    date = models.DateField()
    mealofDay = models.JSONField(default=list)  # List of meals

    # Macronutrients
    daily_calories = models.CharField(max_length=255, default="na")
    carbohydrates_g = models.CharField(max_length=255, default="na")
    proteins_g = models.CharField(max_length=255, default="na")
    fats_g = models.CharField(max_length=255, default="na")
    hydration = models.CharField(max_length=255, default="na")

    # Micronutrients
    boron_mg = models.CharField(max_length=255, default="na")
    calcium_mg = models.CharField(max_length=255, default="na")
    iron_mg = models.CharField(max_length=255, default="na")
    selenium_ug = models.CharField(max_length=255, default="na")
    zinc_mg = models.CharField(max_length=255, default="na")
    sodium_mg = models.CharField(max_length=255, default="na")

    def __str__(self):
        return f"Meals for {self.user.username} on {self.date}"
