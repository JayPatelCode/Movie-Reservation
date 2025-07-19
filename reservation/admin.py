from django.contrib import admin
from .models import Movie, Showtime, Reservation, Theater, Seat

admin.site.register(Movie)
admin.site.register(Showtime)
admin.site.register(Reservation)
admin.site.register(Theater)
admin.site.register(Seat)
