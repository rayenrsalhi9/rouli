from agencies.models import Agency
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APITestCase

from .models import Category, Vehicle


class SeedDemoTests(TestCase):
    def test_seed_creates_expected_rows(self):
        call_command("seed_demo", verbosity=0)
        self.assertEqual(Agency.objects.count(), 2)
        self.assertEqual(Category.objects.count(), 3)
        self.assertEqual(Vehicle.objects.count(), 6)

    def test_seed_can_run_twice_without_duplicates(self):
        call_command("seed_demo", verbosity=0)
        call_command("seed_demo", verbosity=0)
        self.assertEqual(Vehicle.objects.count(), 6)


class VehicleApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", verbosity=0)

    def test_list_is_paginated(self):
        response = self.client.get("/api/vehicles/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 6)  # type: ignore
        self.assertEqual(len(response.data["results"]), 4)  # type: ignore

    def test_filter_by_type(self):
        response = self.client.get("/api/vehicles/", {"type": "scooter"})
        self.assertEqual(response.data["count"], 2)  # type: ignore

    def test_filter_by_agency_and_max_price(self):
        response = self.client.get(
            "/api/vehicles/", {"agency": "marina", "max_price": 27}
        )
        names = [v["name"] for v in response.data["results"]]  # type: ignore
        self.assertCountEqual(
            names, ["Trek Verve+ 3 Lowstep", "Segway Ninebot KickScooter Max G2"]
        )

    def test_search_matches_name(self):
        response = self.client.get("/api/vehicles/", {"search": "cowboy"})
        self.assertEqual(response.data["count"], 1)  # type: ignore

    def test_ordering_by_price_descending(self):
        response = self.client.get("/api/vehicles/", {"ordering": "-price_per_day_dt"})
        self.assertEqual(
            response.data["results"][0]["name"],  # type: ignore
            "Cube Touring Hybrid ONE 625",  # type: ignore
        )

    def test_detail_by_slug(self):
        response = self.client.get("/api/vehicles/cowboy-4-st/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Cowboy 4 ST")  # type: ignore

    def test_inactive_vehicle_is_hidden(self):
        Vehicle.objects.filter(slug="cowboy-4-st").update(is_active=False)
        response = self.client.get("/api/vehicles/cowboy-4-st/")
        self.assertEqual(response.status_code, 404)

    def test_list_uses_two_queries(self):
        with self.assertNumQueries(2):  # one for the count, one for the page
            self.client.get("/api/vehicles/")

    def test_anonymous_user_cannot_write(self):
        response = self.client.post("/api/vehicles/", {})
        self.assertIn(response.status_code, (401, 403))

    def test_detail_includes_specs(self):
        response = self.client.get("/api/vehicles/cowboy-4-st/")
        self.assertEqual(response.data["battery_capacity"], "360 Wh amovible")  # type: ignore
        self.assertEqual(len(response.data["features"]), 4)  # type: ignore

    def test_list_does_not_include_specs(self):
        response = self.client.get("/api/vehicles/")
        self.assertNotIn("features", response.data["results"][0])  # type: ignore

    def test_related_returns_same_type_without_self(self):
        response = self.client.get("/api/vehicles/cowboy-4-st/related/")
        self.assertEqual(response.status_code, 200)
        slugs = [v["slug"] for v in response.data]  # type: ignore
        self.assertEqual(len(slugs), 3)
        self.assertNotIn("cowboy-4-st", slugs)
        self.assertTrue(all(v["vehicle_type"] == "bike" for v in response.data))  # type: ignore

    def test_related_unknown_slug_is_404(self):
        response = self.client.get("/api/vehicles/nope/related/")
        self.assertEqual(response.status_code, 404)
