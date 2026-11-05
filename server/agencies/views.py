from django.db.models import Count, Q
from rest_framework import viewsets

from .models import Agency
from .serializers import AgencySerializer


class AgencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Agency.objects.annotate(
        vehicles_count=Count("vehicles", filter=Q(vehicles__is_active=True))
    )
    serializer_class = AgencySerializer
    lookup_field = "slug"
    pagination_class = None
