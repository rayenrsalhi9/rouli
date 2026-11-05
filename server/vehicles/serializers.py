from agencies.serializers import AgencySummarySerializer
from rest_framework import serializers

from .models import Category, Vehicle


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["slug", "label"]  # noqa: RUF012


class VehicleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    agency = AgencySummarySerializer(read_only=True)

    class Meta:
        model = Vehicle
        fields = [  # noqa: RUF012
            "id",
            "slug",
            "name",
            "vehicle_type",
            "category",
            "agency",
            "price_per_day_dt",
            "total_units",
            "range_km",
            "max_speed_kmh",
            "tag",
            "image",
            "description",
            "rating",
            "reviews_count",
        ]


class VehicleDetailSerializer(VehicleSerializer):
    class Meta(VehicleSerializer.Meta):
        fields = VehicleSerializer.Meta.fields + [
            "battery_capacity",
            "weight_kg",
            "motor",
            "brakes",
            "charge_time_h",
            "features",
            "included_accessories",
        ]
