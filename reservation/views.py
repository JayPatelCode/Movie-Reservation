from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, DjangoModelPermissionsOrAnonReadOnly
from .models import Movie, Showtime, Reservation, Seat, Theater, Rating
from .serializers import MovieSerializer, ShowtimeSerializer, ReservationSerializer, UserSerializer, TheaterSerializer, SeatSerializer, RatingSerializer
from django.db import transaction
from django.db.models import Sum, Q
from datetime import timedelta

from .utils import fetch_movie_details_from_tmdb, generate_qr_code_for_reservation

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]  # Allow all read access

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        movie_title = serializer.validated_data.get('title')
        if movie_title:
            tmdb_data = fetch_movie_details_from_tmdb(movie_title)
            if tmdb_data:
                serializer.validated_data['description'] = tmdb_data.get('description', serializer.validated_data.get('description'))
                serializer.validated_data['poster_path'] = tmdb_data.get('poster_path', serializer.validated_data.get('poster_path'))
                serializer.validated_data['release_date'] = tmdb_data.get('release_date', serializer.validated_data.get('release_date'))
                serializer.validated_data['genres'] = tmdb_data.get('genres', serializer.validated_data.get('genres'))

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        movie_title = serializer.validated_data.get('title', instance.title)
        if movie_title:
            tmdb_data = fetch_movie_details_from_tmdb(movie_title)
            if tmdb_data:
                serializer.validated_data['description'] = tmdb_data.get('description', serializer.validated_data.get('description'))
                serializer.validated_data['poster_path'] = tmdb_data.get('poster_path', serializer.validated_data.get('poster_path'))
                serializer.validated_data['release_date'] = tmdb_data.get('release_date', serializer.validated_data.get('release_date'))
                serializer.validated_data['genres'] = tmdb_data.get('genres', serializer.validated_data.get('genres'))

        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def get_ratings(self, request, pk=None):
        movie = self.get_object()
        ratings = movie.ratings.all()
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def coming_soon(self, request):
        """Get movies that are coming soon"""
        from django.utils import timezone
        from datetime import timedelta
        
        # Get movies with release dates in the future or within the next 30 days
        future_date = timezone.now().date() + timedelta(days=30)
        coming_soon_movies = Movie.objects.filter(
            release_date__gte=timezone.now().date(),
            release_date__lte=future_date
        ).order_by('release_date')
        
        serializer = self.get_serializer(coming_soon_movies, many=True)
        return Response(serializer.data)

class TheaterViewSet(viewsets.ModelViewSet):
    queryset = Theater.objects.all()
    serializer_class = TheaterSerializer
    permission_classes = [AllowAny]  # Allow all read access

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [AllowAny]  # Allow all read access
    
    def get_queryset(self):
        queryset = Seat.objects.all()
        theater_id = self.request.query_params.get('theater', None)
        if theater_id is not None:
            queryset = queryset.filter(theater_id=theater_id)
        return queryset

class ShowtimeViewSet(viewsets.ModelViewSet):
    queryset = Showtime.objects.all()
    serializer_class = ShowtimeSerializer
    permission_classes = [AllowAny]  # Allow all read access
    
    def get_queryset(self):
        queryset = Showtime.objects.all()
        movie_id = self.request.query_params.get('movie_id', None)
        if movie_id is not None:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset

    def perform_create(self, serializer):
        show_time = serializer.validated_data.get('show_time')
        movie = serializer.validated_data.get('movie')
        theater = serializer.validated_data.get('theater')

        end_time = show_time + timedelta(minutes=movie.duration)

        conflicting_showtimes = Showtime.objects.filter(
            theater=theater,
            show_time__lt=end_time,
            show_time__gte=show_time - timedelta(minutes=movie.duration)
        ).exclude(pk=getattr(serializer.instance, 'pk', None))

        if conflicting_showtimes.exists():
            raise serializers.ValidationError("Showtime conflicts with an existing showtime in this theater.")

        serializer.save()

    def perform_update(self, serializer):
        show_time = serializer.validated_data.get('show_time', serializer.instance.show_time)
        movie = serializer.validated_data.get('movie', serializer.instance.movie)
        theater = serializer.validated_data.get('theater', serializer.instance.theater)

        end_time = show_time + timedelta(minutes=movie.duration)

        conflicting_showtimes = Showtime.objects.filter(
            theater=theater,
            show_time__lt=end_time,
            show_time__gte=show_time - timedelta(minutes=movie.duration)
        ).exclude(pk=getattr(serializer.instance, 'pk', None))

        if conflicting_showtimes.exists():
            raise serializers.ValidationError("Showtime conflicts with an existing showtime in this theater.")

        serializer.save()

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def reserved_seats(self, request, pk=None):
        """Get reserved seats for a showtime - accessible to everyone"""
        showtime = self.get_object()
        reserved_seat_ids = Seat.objects.filter(reservation__showtime=showtime).values_list('id', flat=True).distinct()
        return Response(list(reserved_seat_ids))

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        showtime_obj = serializer.validated_data.get('showtime_pk')
        selected_seat_ids = serializer.validated_data.get('seat_ids', [])

        if not showtime_obj or not selected_seat_ids:
            return Response({'detail': 'Showtime and selected seats are required.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            already_reserved_seats = Reservation.objects.filter(
                showtime=showtime_obj,
                selected_seats__id__in=selected_seat_ids
            ).exists()

            if already_reserved_seats:
                return Response({'detail': 'One or more selected seats are already reserved.'}, status=status.HTTP_400_BAD_REQUEST)

            seats_to_reserve = Seat.objects.filter(id__in=selected_seat_ids)
            if len(seats_to_reserve) != len(selected_seat_ids):
                return Response({'detail': 'One or more selected seat IDs are invalid.'}, status=status.HTTP_400_BAD_REQUEST)

            # Use the serializer's create method which handles QR code generation
            serializer.validated_data['user'] = request.user
            reservation = serializer.save(user=request.user)

            headers = self.get_success_headers(serializer.data)
            return Response(ReservationSerializer(reservation, context={'request': request}).data, status=status.HTTP_201_CREATED, headers=headers)

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        movie_id = request.data.get('movie')
        user_id = request.data.get('user')
        rating_value = request.data.get('rating')

        if not movie_id or not user_id or rating_value is None:
            return Response({'detail': 'Movie, user, and rating are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rating_instance = Rating.objects.get(movie_id=movie_id, user_id=user_id)
            rating_instance.rating = rating_value
            rating_instance.save()
            serializer = self.get_serializer(rating_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Rating.DoesNotExist:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([AllowAny])
def is_admin_view(request):
    if request.user.is_authenticated:
        return Response({'is_admin': request.user.is_staff})
    else:
        return Response({'is_admin': False})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def total_seats_booked_view(request):
    total_booked_seats = 0
    for reservation in Reservation.objects.all():
        total_booked_seats += reservation.selected_seats.count()
    return Response({'total_seats_booked': total_booked_seats})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def total_revenue_view(request):
    total_revenue = 0
    for reservation in Reservation.objects.all():
        if reservation.showtime and reservation.showtime.price is not None:
            total_revenue += reservation.showtime.price * reservation.selected_seats.count()
    return Response({'total_revenue': total_revenue})

