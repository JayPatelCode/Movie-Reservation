import requests
import qrcode
import os
from django.conf import settings

TMDB_API_KEY = 'c8a254596ddcb52c68b7d5ed82d49efa'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

def fetch_movie_details_from_tmdb(movie_title):
    search_url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        'api_key': TMDB_API_KEY,
        'query': movie_title
    }
    
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        data = response.json()
        
        if data['results']:
            # Take the first result as the most relevant
            movie_data = data['results'][0]
            
            # Fetch genres (TMDB returns genre IDs, need to map them to names)
            genres = []
            if 'genre_ids' in movie_data:
                genre_names = []
                for genre_id in movie_data['genre_ids']:
                    # In a real app, you'd fetch genre list once and cache it
                    # For simplicity, we'll just add the ID for now or leave it empty
                    genre_names.append(str(genre_id)) # Placeholder: just add ID
                genres = ', '.join(genre_names)

            return {
                'title': movie_data.get('title'),
                'description': movie_data.get('overview'),
                'release_date': movie_data.get('release_date'),
                'poster_path': f"{TMDB_IMAGE_BASE_URL}{movie_data.get('poster_path')}" if movie_data.get('poster_path') else None,
                'vote_average': movie_data.get('vote_average'),
                'genres': genres # This will be a comma-separated string of genre IDs for now
            }
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from TMDB: {e}")
        return None

def generate_qr_code_for_reservation(reservation_id, reservation_details_text):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(reservation_details_text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Define the path to save the QR code
    # Assuming MEDIA_ROOT is configured in your Django settings
    # and MEDIA_URL is '/media/'
    qr_code_dir = os.path.join(settings.MEDIA_ROOT, 'qrcodes')
    os.makedirs(qr_code_dir, exist_ok=True)
    
    file_name = f"reservation_{reservation_id}_qr.png"
    file_path = os.path.join(qr_code_dir, file_name)
    
    img.save(file_path)
    
    # Return the URL path relative to MEDIA_URL
    return os.path.join(settings.MEDIA_URL, 'qrcodes', file_name)