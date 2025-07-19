from django.core.management.base import BaseCommand
from reservation.models import Reservation, Showtime, Theater
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Resets all movie-related data (reservations, showtimes, theaters) and re-adds sample showtimes.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Deleting all existing Reservations...'))
        Reservation.objects.all().delete()

        self.stdout.write(self.style.WARNING('Deleting all existing Showtimes...'))
        Showtime.objects.all().delete()

        self.stdout.write(self.style.WARNING('Deleting all existing Theaters...'))
        Theater.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('All movie-related data cleared.'))

        self.stdout.write(self.style.SUCCESS('Adding sample showtimes...'))
        call_command('add_sample_showtimes')

        self.stdout.write(self.style.SUCCESS('Database reset and sample showtimes re-added successfully.'))
