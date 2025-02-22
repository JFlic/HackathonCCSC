import pandas as pd
from django.core.management.base import BaseCommand
from api.models import NutritionData

class Command(BaseCommand):
    help = "Load nutrition data from an Excel file into the database"

    def handle(self, *args, **kwargs):
        file_path = "/mnt/data/sssss.xlsx"

        try:
            df = pd.read_excel(file_path)

            for _, row in df.iterrows():
                NutritionData.objects.create(
                    food_name=row.get("Food Name", ""),
                    calories=row.get("Calories", 0),
                    fat=row.get("Fat", 0),
                    protein=row.get("Protein", 0),
                    carbohydrates=row.get("Carbohydrates", 0),
                    sodium=row.get("Sodium", 0),
                    sugar=row.get("Sugar", 0),
                    fiber=row.get("Fiber", 0),
                    iron=row.get("Iron", 0),
                    calcium=row.get("Calcium", 0),
                    vitamin_a=row.get("Vitamin A", 0),
                    vitamin_c=row.get("Vitamin C", 0),
                )

            self.stdout.write(self.style.SUCCESS("Successfully loaded nutrition data!"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error loading data: {str(e)}"))
