# Generated by Django 5.1.6 on 2025-02-09 23:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nutritiondata',
            name='calcium',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='calories',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='carbohydrates',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='fat',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='fiber',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='iron',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='protein',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='sodium',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='sugar',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='vitamin_a',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='nutritiondata',
            name='vitamin_c',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
