from django.contrib import admin

from .models import Agency


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = ("short_name", "name", "phone")
    search_fields = ("name", "short_name")
    prepopulated_fields = {"slug": ("short_name",)}  # noqa: RUF012
