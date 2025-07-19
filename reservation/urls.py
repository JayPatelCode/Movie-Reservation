from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, ShowtimeViewSet, ReservationViewSet, registration_view, TheaterViewSet, SeatViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'showtimes', ShowtimeViewSet)
router.register(r'reservations', ReservationViewSet)
router.register(r'theaters', TheaterViewSet)
router.register(r'seats', SeatViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', registration_view, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
