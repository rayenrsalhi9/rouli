from django.db import IntegrityError, transaction
from django.test import TestCase

from .models import User


class UserModelTests(TestCase):
    def test_email_is_the_login_identifier_and_password_is_hashed(self):
        user = User.objects.create_user(
            username="rayen", email="rayen@example.com", password="secret123"
        )
        self.assertEqual(User.USERNAME_FIELD, "email")
        self.assertTrue(user.check_password("secret123"))
        self.assertNotEqual(user.password, "secret123")

    def test_username_is_unique_ignoring_case(self):
        User.objects.create_user(
            username="Rayen", email="a@example.com", password="secret123"
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            User.objects.create_user(
                username="rayen", email="b@example.com", password="secret123"
            )
