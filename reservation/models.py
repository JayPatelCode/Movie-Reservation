from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg
from django.utils import timezone
from django.core.files import File
from io import BytesIO
import uuid
import qrcode
from PIL import Image
import os

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField()  # in minutes
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    release_date = models.DateField(null=True, blank=True)
    genres = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.title

    @property
    def average_rating(self):
        avg_rating = self.ratings.aggregate(Avg('rating')).get('rating__avg')
        return avg_rating if avg_rating is not None else 0

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
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    booking_reference = models.CharField(max_length=12, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    is_cancelled = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = self.generate_booking_reference()
        super().save(*args, **kwargs)
        # Generate QR code after the reservation is fully saved with seats
        if not self.qr_code and self.pk:
            try:
                self.generate_qr_code()
            except Exception as e:
                print(f"Error generating QR code: {e}")
    
    def generate_booking_reference(self):
        """Generate a unique booking reference"""
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    def generate_qr_code(self):
        """Generate QR code for the reservation"""
        qr_data = {
            'booking_ref': self.booking_reference,
            'movie': self.showtime.movie.title,
            'theater': self.showtime.theater.name,
            'showtime': self.showtime.show_time.isoformat(),
            'user': self.user.username
        }
        
        qr_text = f"Booking: {self.booking_reference}\nMovie: {self.showtime.movie.title}\nTheater: {self.showtime.theater.name}\nShow: {self.showtime.show_time.strftime('%Y-%m-%d %H:%M')}\nUser: {self.user.username}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_text)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        blob = BytesIO()
        img.save(blob, 'PNG')
        blob.seek(0)
        
        # Save to model
        filename = f'qr_{self.booking_reference}.png'
        self.qr_code.save(filename, File(blob), save=False)
        super().save(update_fields=['qr_code'])
    
    @property
    def total_seats(self):
        return self.selected_seats.count()
    
    @property
    def total_price(self):
        return self.showtime.price * self.total_seats
    
    @property
    def seat_numbers(self):
        seats = self.selected_seats.all().order_by('row_number', 'seat_number')
        return [f"{chr(64 + seat.row_number)}{seat.seat_number}" for seat in seats]

    def __str__(self):
        return f"{self.booking_reference} - {self.user.username}'s reservation for {self.showtime}"

class Rating(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        unique_together = ('movie', 'user')
