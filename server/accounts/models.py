import uuid

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.functions import Lower

USERNAME_VALIDATOR = RegexValidator(
    r"^[A-Za-z0-9]{3,30}$",
    "Le nom d'utilisateur doit contenir entre 3 et 30 lettres ou chiffres, sans espaces.",
)


class User(AbstractUser):
    """Customer or staff account. Email logs in; username is the display name."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(
        max_length=30, unique=True, validators=[USERNAME_VALIDATOR]
    )
    first_name = None
    last_name = None
    phone = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=80, blank=True)
    address = models.CharField(max_length=255, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]  # noqa: RUF012

    class Meta(AbstractUser.Meta):
        ordering = ["username"]  # noqa: RUF012
        constraints = [  # noqa: RUF012
            models.UniqueConstraint(Lower("username"), name="unique_username_ci"),
        ]

    def __str__(self) -> str:
        return self.username

    def get_full_name(self) -> str:
        return self.username

    def get_short_name(self) -> str:
        return self.username
