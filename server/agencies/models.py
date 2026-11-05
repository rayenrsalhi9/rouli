import uuid

from django.db import models


class Agency(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    short_name = models.CharField(max_length=60)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True)
    opening_hours = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]  # noqa: RUF012
        verbose_name_plural = "agencies"

    def __str__(self) -> str:
        return self.short_name
