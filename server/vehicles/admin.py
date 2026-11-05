from django.contrib import admin

from .models import Category, Vehicle


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("label", "slug")
    prepopulated_fields = {"slug": ("label",)}  # noqa: RUF012


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "vehicle_type",
        "category",
        "agency",
        "price_per_day_dt",
        "total_units",
        "is_active",
    )
    list_filter = ("vehicle_type", "category", "agency", "is_active")
    search_fields = ("name", "tag")
    prepopulated_fields = {"slug": ("name",)}  # noqa: RUF012
