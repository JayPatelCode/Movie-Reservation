"""
URL configuration for MovieReservation project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from reservation.views import is_admin_view, total_seats_booked_view, total_revenue_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('reservation.urls')),
    path('is_admin/', is_admin_view, name='is_admin'),
    path('total_seats_booked/', total_seats_booked_view, name='total_seats_booked'),
    path('total_revenue/', total_revenue_view, name='total_revenue'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
