from django.core.management import call_command
from rest_framework.test import APITestCase


class AgencyApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", verbosity=0)

    def test_list_returns_both_agencies_with_counts(self):
        response = self.client.get("/api/agencies/")
        self.assertEqual(response.status_code, 200)
        counts = {a["slug"]: a["vehicles_count"] for a in response.data}  # type: ignore
        self.assertEqual(counts, {"marina": 3, "ribat": 3})

    def test_detail_by_slug(self):
        response = self.client.get("/api/agencies/ribat/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["short_name"], "Ribat")  # type: ignore
