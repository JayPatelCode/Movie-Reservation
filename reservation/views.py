from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, DjangoModelPermissionsOrAnonReadOnly
from .models import Movie, Showtime, Reservation, Seat, Theater
from .serializers import MovieSerializer, ShowtimeSerializer, ReservationSerializer, UserSerializer, TheaterSerializer, SeatSerializer
from django.db import transaction
from django.db.models import Sum

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]  # Allow all read access

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
        # This queryset is for listing user's own reservations
        return Reservation.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Correctly extract showtime object and seat_ids from validated_data
        showtime = serializer.validated_data.get('showtime_pk') # Get the Showtime object from the writable field
        selected_seat_ids = serializer.validated_data.get('seat_ids', [])

        if not showtime or not selected_seat_ids:
            return Response({'detail': 'Showtime and selected seats are required.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Check if seats are already reserved for this showtime
            already_reserved_seats = Reservation.objects.filter(
                showtime=showtime,
                selected_seats__id__in=selected_seat_ids
            ).exists()

            if already_reserved_seats:
                return Response({'detail': 'One or more selected seats are already reserved.'}, status=status.HTTP_400_BAD_REQUEST)

            # Get the actual Seat objects
            seats_to_reserve = Seat.objects.filter(id__in=selected_seat_ids)
            if len(seats_to_reserve) != len(selected_seat_ids):
                return Response({'detail': 'One or more selected seat IDs are invalid.'}, status=status.HTTP_400_BAD_REQUEST)

            # Create the reservation
            reservation = Reservation.objects.create(user=request.user, showtime=showtime)
            reservation.selected_seats.set(seats_to_reserve)

            headers = self.get_success_headers(serializer.data)
            return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED, headers=headers)

@api_view(['POST'])
@permission_classes([AllowAny])
def registration_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        # Ensure showtime and price exist before calculating
        if reservation.showtime and reservation.showtime.price is not None:
            total_revenue += reservation.showtime.price * reservation.selected_seats.count()
    return Response({'total_revenue': total_revenue})
