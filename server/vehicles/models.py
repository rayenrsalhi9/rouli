import uuid

from agencies.models import Agency
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    label = models.CharField(max_length=80)

    class Meta:
        ordering = ["label"]  # noqa: RUF012
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.label


class Vehicle(models.Model):
    class VehicleType(models.TextChoices):
        BIKE = "bike", "Vélo"
        SCOOTER = "scooter", "Trottinette"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    vehicle_type = models.CharField(max_length=10, choices=VehicleType.choices)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="vehicles"
    )
    agency = models.ForeignKey(
        Agency, on_delete=models.PROTECT, related_name="vehicles"
    )
    price_per_day_dt = models.DecimalField(
        max_digits=6, decimal_places=2, validators=[MinValueValidator(0)]
    )
    total_units = models.PositiveSmallIntegerField(default=1)
    range_km = models.PositiveSmallIntegerField()
    max_speed_kmh = models.PositiveSmallIntegerField()
    tag = models.CharField(max_length=60, blank=True)
    image = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,  # type: ignore
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    reviews_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # --- technical specs
    battery_capacity = models.CharField(max_length=60, blank=True)
    weight_kg = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True
    )
    motor = models.CharField(max_length=120, blank=True)
    brakes = models.CharField(max_length=120, blank=True)
    charge_time_h = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )
    features = models.JSONField(default=list, blank=True)
    included_accessories = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["name"]  # noqa: RUF012

    def __str__(self) -> str:
        return self.name
