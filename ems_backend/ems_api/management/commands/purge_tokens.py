from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = "Purge all DRF auth tokens to invalidate existing logins."

    def handle(self, *args, **options):
        deleted, _ = Token.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Purged {deleted} tokens."))


