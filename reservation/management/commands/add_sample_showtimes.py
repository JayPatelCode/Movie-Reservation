from django.core.management.base import BaseCommand
from reservation.models import Movie, Theater, Showtime, Seat
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Adds sample showtimes for existing movies.'

    def handle(self, *args, **options):
        # Create or get theaters
        theater1, created1 = Theater.objects.get_or_create(
            name='Grand Cinema Hall 1',
            defaults={
                'address': '123 Movie Lane, Cityville',
                'rows': 10,
                'seats_per_row': 15,
            }
        )
        if created1:
            self.stdout.write(self.style.SUCCESS(f'Created theater: {theater1.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing theater: {theater1.name}'))

        # Create seats for theater1
        for row_num in range(1, theater1.rows + 1):
            for seat_num in range(1, theater1.seats_per_row + 1):
                Seat.objects.get_or_create(theater=theater1, row_number=row_num, seat_number=seat_num)
        self.stdout.write(self.style.SUCCESS(f'Created seats for {theater1.name}'))

        theater2, created2 = Theater.objects.get_or_create(
            name='Grand Cinema Hall 2',
            defaults={
                'address': '123 Movie Lane, Cityville',
                'rows': 8,
                'seats_per_row': 12,
            }
        )
        if created2:
            self.stdout.write(self.style.SUCCESS(f'Created theater: {theater2.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing theater: {theater2.name}'))

        # Create seats for theater2
        for row_num in range(1, theater2.rows + 1):
            for seat_num in range(1, theater2.seats_per_row + 1):
                Seat.objects.get_or_create(theater=theater2, row_number=row_num, seat_number=seat_num)
        self.stdout.write(self.style.SUCCESS(f'Created seats for {theater2.name}'))

        # Get all movies
        movies = Movie.objects.all()

        if not movies.exists():
            self.stdout.write(self.style.ERROR('No movies found in the database. Please run fetch_movie_posters first.'))
            return

        # Clear all existing showtimes to avoid duplicates and ensure fresh data
        Showtime.objects.all().delete()
        self.stdout.write(self.style.WARNING('Cleared all existing showtimes.'))

        # Add sample showtimes for each movie
        now = datetime.now()
        theaters = [theater1, theater2]
        theater_index = 0

        for movie in movies:
            # Create 1 showtime for each movie, alternating between theaters
            current_theater = theaters[theater_index]
            show_time = now + timedelta(days=1, hours=10 + (movie.id % 5), minutes=30) # Vary time slightly
            
            Showtime.objects.create(
                movie=movie,
                theater=current_theater,
                show_time=show_time
            )
            self.stdout.write(self.style.SUCCESS(f'Added showtime for {movie.title} at {show_time.strftime("%Y-%m-%d %H:%M")} in {current_theater.name}'))
            
            theater_index = (theater_index + 1) % len(theaters) # Cycle through theaters

        self.stdout.write(self.style.SUCCESS('Sample showtimes added successfully for all movies.'))
