from rest_framework import viewsets

from .filters import VehicleFilter
from .models import Category, Vehicle
from .serializers import CategorySerializer, VehicleSerializer


class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vehicle.objects.filter(is_active=True).select_related(
        "category", "agency"
    )
    serializer_class = VehicleSerializer
    lookup_field = "slug"
    filterset_class = VehicleFilter
    search_fields = [  # noqa: RUF012
        "name",
        "tag",
        "description",
        "category__label",
        "agency__short_name",
    ]
    ordering_fields = ["price_per_day_dt", "rating", "range_km", "name"]  # noqa: RUF012
    ordering = ["name"]  # noqa: RUF012


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None
