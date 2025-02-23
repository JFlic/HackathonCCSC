from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)  # ✅ Make email required
    
    # ✅ Define a ManyToManyField for clubs the user is a member of
    clubs = models.ManyToManyField(
        'Clubs', 
        related_name="club_members",  # ✅ Avoids conflict with `Clubs.members`
        blank=True
    )

    def __str__(self):
        return self.username


class Clubs(models.Model):
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="owned_clubs",  # ✅ Clubs that the user owns
    )
    name = models.CharField(max_length=255, unique=True)  # ✅ Ensure unique club names
    description = models.TextField(default="Enter Description Here:")
    image_url = models.TextField(default="")  # ✅ Consistent naming and avoids "na"

    # ✅ Many-to-many relationship with users who are members
    members = models.ManyToManyField(
        User, 
        related_name="club_list",  # ✅ Avoids conflict with `User.clubs`
        blank=True
    )

    def __str__(self):
        return self.name


class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField(null=True, blank=True)  # ✅ Allows flexibility in event scheduling
    image_url = models.URLField(blank=True, null=True)
    club = models.ForeignKey(Clubs, on_delete=models.CASCADE, related_name="events")

    def __str__(self):
        return f"{self.name} - {self.club.name}"
