from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from ems_api.models import Employee


class Command(BaseCommand):
    help = "Sync auth Users and tokens for all Employees. Creates missing Users, updates active state, and cleans orphans."

    def handle(self, *args, **options):
        created_users = 0
        updated_users = 0
        deactivated_users = 0
        cleaned_tokens = 0
        orphan_users_deleted = 0

        # Create or update users for employees
        for employee in Employee.objects.all():
            username = employee.employee_id
            first_name = employee.name.split(' ')[0] if employee.name else ''
            last_name = ' '.join(employee.name.split(' ')[1:]) if employee.name and len(employee.name.split(' ')) > 1 else ''

            if employee.user is None:
                # Create a user with default password = employee_id
                user = User.objects.create_user(
                    username=username,
                    email=employee.email,
                    password=employee.employee_id,
                    first_name=first_name,
                    last_name=last_name,
                )
                user.is_active = (employee.status == 'Active')
                user.save()
                employee.user = user
                employee.save(update_fields=['user'])
                created_users += 1
            else:
                # Update existing linked user fields and active status
                user = employee.user
                changed = False
                if user.email != employee.email:
                    user.email = employee.email
                    changed = True
                if user.first_name != first_name:
                    user.first_name = first_name
                    changed = True
                if user.last_name != last_name:
                    user.last_name = last_name
                    changed = True
                desired_active = (employee.status == 'Active')
                if user.is_active != desired_active:
                    user.is_active = desired_active
                    changed = True
                if changed:
                    user.save()
                    updated_users += 1
                if not desired_active:
                    # Revoke tokens for inactive users
                    cleaned_tokens += Token.objects.filter(user=user).delete()[0]
                    deactivated_users += 1

        # Clean up orphan auth users that look like employees but are not linked
        # Heuristic: username starts with 'emp' and has no Employee link
        all_users = User.objects.all()
        for user in all_users:
            if user.username.startswith('emp'):
                if not Employee.objects.filter(user=user).exists() and not Employee.objects.filter(employee_id=user.username).exists():
                    cleaned_tokens += Token.objects.filter(user=user).delete()[0]
                    user.delete()
                    orphan_users_deleted += 1

        self.stdout.write(self.style.SUCCESS(
            f"Sync complete: created={created_users}, updated={updated_users}, deactivated={deactivated_users}, "
            f"tokens_revoked={cleaned_tokens}, orphan_users_deleted={orphan_users_deleted}"
        ))


