from django.core.management.base import BaseCommand
from django.db import connection, OperationalError


class Command(BaseCommand):
    help = 'Checks database connectivity'

    def handle(self, *args, **kwargs):
        self.stdout.write("Checking database connection...")
        try:
            connection.ensure_connection()
            self.stdout.write(
                self.style.SUCCESS("Database connection successful"))
        except OperationalError as e:
            self.stdout.write(
                self.style.ERROR(f"Database connection failed: {e}"))