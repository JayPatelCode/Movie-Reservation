from rest_framework import serializers
from .models import Movie, Showtime, Reservation, Theater, Seat, Rating
from django.contrib.auth.models import User
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.db.models import Sum, Count, Avg

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'duration', 'poster_path', 'average_rating', 'release_date', 'genres']

    def get_average_rating(self, obj):
        return obj.average_rating

class TheaterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theater
        fields = '__all__'

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'

class ShowtimeSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    theater = TheaterSerializer(read_only=True)
    total_theater_seats = serializers.SerializerMethodField()
    reserved_seat_count = serializers.SerializerMethodField()

    class Meta:
        model = Showtime
        fields = '__all__'
        read_only_fields = ('total_theater_seats', 'reserved_seat_count')

    def get_total_theater_seats(self, obj):
        return obj.theater.rows * obj.theater.seats_per_row

    def get_reserved_seat_count(self, obj):
        # Count distinct seats reserved for this showtime across all reservations
        return Seat.objects.filter(reservation__showtime=obj).distinct().count()

class ReservationSerializer(serializers.ModelSerializer):
    # For reading, we want the full Showtime object
    showtime = ShowtimeSerializer(read_only=True)
    # For writing, we need to accept the showtime ID directly
    showtime_pk = serializers.PrimaryKeyRelatedField(queryset=Showtime.objects.all(), write_only=True)

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    selected_seats = SeatSerializer(many=True, read_only=True) # For reading
    seat_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True) # For writing
    seat_numbers = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    total_seats = serializers.ReadOnlyField()
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ('id', 'user', 'showtime', 'selected_seats', 'showtime_pk', 'seat_ids', 
                 'booking_reference', 'created_at', 'is_cancelled', 'qr_code_url',
                 'seat_numbers', 'total_price', 'total_seats')
    
    def get_qr_code_url(self, obj):
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
        return None

    def create(self, validated_data):
        showtime_obj = validated_data.pop('showtime_pk') # Get the Showtime object from the writable field
        seat_ids = validated_data.pop('seat_ids')
        
        reservation = Reservation.objects.create(showtime=showtime_obj, **validated_data)
        seats = Seat.objects.filter(id__in=seat_ids)
        reservation.selected_seats.set(seats)
        
        # Generate QR code after seats are set
        try:
            reservation.generate_qr_code()
        except Exception as e:
            print(f"Error generating QR code: {e}")
        
        return reservation

class UserSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password')
