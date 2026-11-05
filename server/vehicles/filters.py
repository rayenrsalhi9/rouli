import django_filters

from .models import Vehicle


class VehicleFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(
        field_name="vehicle_type", choices=Vehicle.VehicleType.choices
    )
    agency = django_filters.CharFilter(field_name="agency__slug")
    category = django_filters.CharFilter(field_name="category__slug")
    max_price = django_filters.NumberFilter(
        field_name="price_per_day_dt", lookup_expr="lte"
    )

    class Meta:
        model = Vehicle
        fields = []  # noqa: RUF012
