# Generated by Django 5.1.6 on 2025-02-10 02:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_nutritionplan_weight'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nutritionplan',
            name='age',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='arsenic_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='boron_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='calcium_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='carbohydrates_g',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='chloride_g',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='chromium_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='copper_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='daily_calories',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='fats_g',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='fluoride_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='hydration',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='iodine_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='iron_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='magnesium_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='manganese_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='molybdenum_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='nickel_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='phosphorus_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='proteins_g',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='selenium_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='silicon_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='sodium_mg',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='source',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='vanadium_ug',
            field=models.CharField(default='na', max_length=255),
        ),
        migrations.AlterField(
            model_name='nutritionplan',
            name='zinc_mg',
            field=models.CharField(default='na', max_length=255),
        ),
    ]
