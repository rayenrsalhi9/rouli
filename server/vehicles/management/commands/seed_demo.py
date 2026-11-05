from decimal import Decimal

from agencies.models import Agency
from django.core.management.base import BaseCommand
from django.db import transaction

from vehicles.models import Category, Vehicle

HOURS = "Lun - Dim : 08h00 - 20h00"

AGENCIES = [
    {
        "slug": "marina",
        "name": "Agence Marina (Port de Plaisance)",
        "short_name": "Marina",
        "address": "Quai Nord du Port de Plaisance, Marina",
        "phone": "+216 73 500 101",
        "opening_hours": HOURS,
        "description": (
            "Notre agence phare, au cœur de la Marina de Monastir, à deux pas des "
            "terrasses et du port de plaisance. Idéale pour combiner balade en bord "
            "de mer et trajets en ville."
        ),
        "image": "/agencies/agence-marina.webp",
    },
    {
        "slug": "ribat",
        "name": "Agence Ribat & Médina",
        "short_name": "Ribat",
        "address": "Esplanade du Ribat, Centre Historique",
        "phone": "+216 73 500 102",
        "opening_hours": HOURS,
        "description": (
            "Au pied du Ribat, en plein centre historique : le point de départ idéal "
            "pour visiter la médina et ses ruelles."
        ),
        "image": "/agencies/agence-ribat.webp",
    },
]

CATEGORIES = [
    {"slug": "urbain", "label": "Urbain & Ville"},
    {"slug": "vtc", "label": "VTC & Balade"},
    {"slug": "trottinette", "label": "Trottinette Urbaine"},
]

VEHICLES = [
    {
        "slug": "cowboy-4-st",
        "name": "Cowboy 4 ST",
        "vehicle_type": "bike",
        "category": "urbain",
        "agency": "ribat",
        "price_per_day_dt": Decimal(24),
        "total_units": 6,
        "range_km": 70,
        "max_speed_kmh": 25,
        "tag": "Bestseller",
        "image": "/bikes/cowboy-4-st.webp",
        "rating": Decimal("4.90"),
        "reviews_count": 124,
        "description": (
            "Vélo électrique urbain connecté au design minimaliste, parfait pour les "
            "trajets quotidiens à Monastir : assistance automatique, cadre bas et "
            "application intégrée."
        ),
    },
    {
        "slug": "michael-blast-soda",
        "name": "Michael Blast Soda",
        "vehicle_type": "bike",
        "category": "urbain",
        "agency": "marina",
        "price_per_day_dt": Decimal(29),
        "total_units": 3,
        "range_km": 80,
        "max_speed_kmh": 25,
        "tag": "Élégance",
        "image": "/bikes/michael-blast-soda.webp",
        "rating": Decimal("4.93"),
        "reviews_count": 61,
        "description": (
            "Café racer électrique au style rétro très photogénique : selle large, "
            "guidon large et finitions vintage, parfait pour une balade élégante "
            "autour de la Marina."
        ),
    },
    {
        "slug": "trek-verve-plus-3-lowstep",
        "name": "Trek Verve+ 3 Lowstep",
        "vehicle_type": "bike",
        "category": "vtc",
        "agency": "marina",
        "price_per_day_dt": Decimal(27),
        "total_units": 4,
        "range_km": 95,
        "max_speed_kmh": 25,
        "tag": "Idéal Corniche",
        "image": "/bikes/trek-verve+-3-lowstep.webp",
        "rating": Decimal("4.95"),
        "reviews_count": 88,
        "description": (
            "Vélo électrique confortable à cadre bas, pensé pour les longues balades "
            "en bord de mer et les trajets du quotidien."
        ),
    },
    {
        "slug": "cube-touring-hybrid-one-625",
        "name": "Cube Touring Hybrid ONE 625",
        "vehicle_type": "bike",
        "category": "vtc",
        "agency": "ribat",
        "price_per_day_dt": Decimal(32),
        "total_units": 5,
        "range_km": 120,
        "max_speed_kmh": 25,
        "tag": "Longue Autonomie",
        "image": "/bikes/cube-touring-hybrid-one-625.webp",
        "rating": Decimal("4.88"),
        "reviews_count": 96,
        "description": (
            "Vélo de randonnée électrique à grande autonomie, idéal pour explorer "
            "Monastir et ses environs sans se soucier de la batterie."
        ),
    },
    {
        "slug": "segway-ninebot-max-g2",
        "name": "Segway Ninebot KickScooter Max G2",
        "vehicle_type": "scooter",
        "category": "trottinette",
        "agency": "marina",
        "price_per_day_dt": Decimal(18),
        "total_units": 5,
        "range_km": 70,
        "max_speed_kmh": 25,
        "tag": "Best-Seller Trot",
        "image": "/scooters/segway-ninebot-max-g2.webp",
        "rating": Decimal("4.80"),
        "reviews_count": 97,
        "description": (
            "Trottinette robuste à grande autonomie, avec suspension double et pneus "
            "tubeless auto-réparants : idéale pour la corniche, la Marina et les "
            "trajets urbains quotidiens."
        ),
    },
    {
        "slug": "segway-ninebot-e3-pro-e",
        "name": "Segway Ninebot E3 Pro E",
        "vehicle_type": "scooter",
        "category": "trottinette",
        "agency": "ribat",
        "price_per_day_dt": Decimal(24),
        "total_units": 3,
        "range_km": 55,
        "max_speed_kmh": 25,
        "tag": "Confort Premium",
        "image": "/scooters/segway-ninebot-e3-pro-e.webp",
        "rating": Decimal("4.90"),
        "reviews_count": 46,
        "description": (
            "Trottinette confortable et facile à prendre en main, idéale pour les "
            "trajets en ville."
        ),
    },
]


class Command(BaseCommand):
    help = "Load the Rouli Lite demo data (safe to run several times)."

    @transaction.atomic
    def handle(self, *args, **options):
        agencies = {}
        for data in AGENCIES:
            defaults = {k: v for k, v in data.items() if k != "slug"}
            agencies[data["slug"]], _ = Agency.objects.update_or_create(
                slug=data["slug"], defaults=defaults
            )

        categories = {}
        for data in CATEGORIES:
            categories[data["slug"]], _ = Category.objects.update_or_create(
                slug=data["slug"], defaults={"label": data["label"]}
            )

        for data in VEHICLES:
            defaults = {k: v for k, v in data.items() if k != "slug"}
            defaults["agency"] = agencies[data["agency"]]
            defaults["category"] = categories[data["category"]]
            Vehicle.objects.update_or_create(slug=data["slug"], defaults=defaults)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed done: {Agency.objects.count()} agencies, "
                f"{Category.objects.count()} categories, "
                f"{Vehicle.objects.count()} vehicles."
            )
        )
