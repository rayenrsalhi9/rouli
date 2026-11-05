from rest_framework import serializers

from .models import Agency


class AgencySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ["slug", "name", "short_name"]  # noqa: RUF012


class AgencySerializer(serializers.ModelSerializer):
    vehicles_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Agency
        fields = [  # noqa: RUF012
            "id",
            "slug",
            "name",
            "short_name",
            "address",
            "phone",
            "opening_hours",
            "description",
            "image",
            "vehicles_count",
        ]
