import requests
from django.core.management.base import BaseCommand
from reservation.models import Movie

class Command(BaseCommand):
    help = 'Fetches popular movies and their posters from the TMDb API and populates the database.'

    def handle(self, *args, **options):
        api_key = 'c8a254596ddcb52c68b7d5ed82d49efa'  # Replace with your TMDb API key
        
        # Clear existing movies from the database
        self.stdout.write(self.style.WARNING('Clearing all existing movies from the database...'))
        Movie.objects.all().delete()

        # Fetch a list of popular movies from TMDb
        popular_movies_url = f'https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US&page=1'
        response = requests.get(popular_movies_url)
        
        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f'Failed to fetch popular movies. API Response: {response.json()}'))
            return

        popular_movies = response.json().get('results', [])

        if not popular_movies:
            self.stdout.write(self.style.WARNING('No popular movies found.'))
            return

        for movie_data in popular_movies:
            # Fetch detailed information for each movie to get the duration
            movie_id = movie_data['id']
            details_url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&language=en-US'
            details_response = requests.get(details_url)
            
            if details_response.status_code != 200:
                self.stdout.write(self.style.WARNING(f'Could not fetch details for movie ID {movie_id}'))
                continue

            movie_details = details_response.json()

            # Create a new movie entry in the database
            Movie.objects.create(
                title=movie_details['title'],
                description=movie_details.get('overview', ''),
                duration=movie_details.get('runtime', 120),  # Default to 120 mins if not available
                poster_path=f"https://image.tmdb.org/t/p/w500{movie_details.get('poster_path', '')}" if movie_details.get('poster_path') else ''
            )

            self.stdout.write(self.style.SUCCESS(f'Successfully created and fetched data for {movie_details['title']}'))
