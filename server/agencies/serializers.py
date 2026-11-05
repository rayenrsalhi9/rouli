from rest_framework import serializers

from .models import Agency


class AgencySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ["slug", "name", "short_name"]  # noqa: RUF012
