from agencies.models import Agency
from django.core.management import call_command
from django.test import TestCase

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
