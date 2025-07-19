from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg
import uuid

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField()  # in minutes
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.title

class Theater(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    rows = models.IntegerField()
    seats_per_row = models.IntegerField()

    def __str__(self):
        return self.name

class Seat(models.Model):
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE)
    row_number = models.IntegerField()
    seat_number = models.IntegerField()

    class Meta:
        unique_together = ('theater', 'row_number', 'seat_number')
        ordering = ['row_number', 'seat_number']

    def __str__(self):
        return f"{self.theater.name} - Row {self.row_number}, Seat {self.seat_number}"

class Showtime(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, default=1) # Set default back
    show_time = models.DateTimeField()
    price = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)

    def __str__(self):
        return f"{self.movie.title} at {self.show_time} in {self.theater.name}"

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE)
    selected_seats = models.ManyToManyField(Seat)

    def __str__(self):
        return f"{self.user.username}'s reservation for {self.showtime}"
