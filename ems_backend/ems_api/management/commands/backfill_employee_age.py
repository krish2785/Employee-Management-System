from django.core.management.base import BaseCommand
from datetime import date
from ems_api.models import Employee


class Command(BaseCommand):
    help = "Backfill employee age from date_of_birth and enforce 21-60 rule"

    def handle(self, *args, **options):
        updated = 0
        skipped = 0
        for emp in Employee.objects.all():
            if emp.date_of_birth:
                today = date.today()
                age = today.year - emp.date_of_birth.year - ((today.month, today.day) < (emp.date_of_birth.month, emp.date_of_birth.day))
                # Clamp within 21-60; if out of bounds, set to None for admin review
                if 21 <= age <= 60:
                    if emp.age != age:
                        emp.age = age
                        emp.save(update_fields=['age'])
                        updated += 1
                else:
                    emp.age = None
                    emp.save(update_fields=['age'])
                    skipped += 1
        self.stdout.write(self.style.SUCCESS(f"Backfill complete. Updated ages: {updated}, out-of-range set to None: {skipped}"))


