from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import VehicleFilter
from .models import Category, Vehicle
from .serializers import CategorySerializer, VehicleDetailSerializer, VehicleSerializer


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

    def get_serializer_class(self):  # type: ignore
        if self.action == "retrieve":
            return VehicleDetailSerializer
        return VehicleSerializer

    @action(detail=True, methods=["get"])
    def related(self, request, slug=None):
        """Up to 3 other vehicles of the same type, best rated first."""
        vehicle = self.get_object()
        others = (
            self.get_queryset()
            .filter(vehicle_type=vehicle.vehicle_type)
            .exclude(pk=vehicle.pk)
            .order_by("-rating")[:3]
        )
        serializer = self.get_serializer(others, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None
