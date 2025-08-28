from django.core.management.base import BaseCommand
from Authentication.models import UserDetails, Student, Batch, OrganizationTag
import random
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Populate leaderboard with random student data and XP values'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=50,
            help='Number of random students to create (default: 50)'
        )
        parser.add_argument(
            '--min-xp',
            type=int,
            default=100,
            help='Minimum XP value (default: 100)'
        )
        parser.add_argument(
            '--max-xp',
            type=int,
            default=5000,
            help='Maximum XP value (default: 5000)'
        )

    def handle(self, *args, **options):
        count = options['count']
        min_xp = options['min_xp']
        max_xp = options['max_xp']
        
        # Get or create a default organization tag
        org_tag, created = OrganizationTag.objects.get_or_create(
            tagId=1,
            defaults={
                'organizationName': 'BoltAbacus Demo',
                'tagName': 'BoltAbacus',
                'isIndividualTeacher': False,
                'numberOfTeachers': 5,
                'numberOfStudents': count,
                'expirationDate': date.today() + timedelta(days=365),
                'totalNumberOfStudents': count,
                'maxLevel': 10,
                'maxClass': 5
            }
        )
        
        # Get or create a default batch
        batch, created = Batch.objects.get_or_create(
            batchId=1,
            defaults={
                'timeDay': 'Monday',
                'timeSchedule': '10:00 AM - 11:00 AM',
                'numberOfStudents': count,
                'active': True,
                'batchName': 'Demo Batch',
                'latestLevelId': 5,
                'latestClassId': 3,
                'latestLink': 'https://demo.batch.link',
                'tag': org_tag
            }
        )
        
        # Sample first names and last names for variety
        first_names = [
            'Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Maria',
            'James', 'Anna', 'Robert', 'Sophie', 'Michael', 'Olivia', 'William',
            'Ava', 'Richard', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte',
            'Christopher', 'Amelia', 'Charles', 'Harper', 'Daniel', 'Evelyn',
            'Matthew', 'Abigail', 'Anthony', 'Emily', 'Mark', 'Elizabeth',
            'Donald', 'Sofia', 'Steven', 'Avery', 'Paul', 'Ella', 'Andrew',
            'Madison', 'Joshua', 'Scarlett', 'Kenneth', 'Victoria', 'Kevin',
            'Luna', 'Brian', 'Grace', 'George', 'Chloe', 'Timothy', 'Penelope'
        ]
        
        last_names = [
            'Johnson', 'Chen', 'Davis', 'Wilson', 'Brown', 'Taylor', 'Anderson',
            'Martinez', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez',
            'Torres', 'Flores', 'Rivera', 'Morales', 'Cruz', 'Ortiz', 'Reyes',
            'Moreno', 'Jimenez', 'Alvarez', 'Ruiz', 'Romero', 'Navarro',
            'Diaz', 'Serrano', 'Molina', 'Suarez', 'Castro', 'Ortega',
            'Delgado', 'Vargas', 'Cortez', 'Mendoza', 'Guerrero', 'Rojas',
            'Acosta', 'Figueroa', 'Luna', 'Ramos', 'Reyes', 'Herrera'
        ]
        
        created_count = 0
        existing_count = 0
        
        for i in range(count):
            # Generate random name
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            # Generate random XP
            xp = random.randint(min_xp, max_xp)
            
            # Generate random streak (0-30 days)
            current_streak = random.randint(0, 30)
            longest_streak = max(current_streak, random.randint(0, 45))
            
            # Generate random creation date (within last 6 months)
            days_ago = random.randint(0, 180)
            created_date = date.today() - timedelta(days=days_ago)
            
            # Generate random last login (within last 30 days)
            login_days_ago = random.randint(0, 30)
            last_login = date.today() - timedelta(days=login_days_ago) if login_days_ago > 0 else None
            
            # Create unique email
            email = f"{first_name.lower()}.{last_name.lower()}{i+1}@demo.boltabacus.com"
            
            # Check if user already exists
            if UserDetails.objects.filter(email=email).exists():
                existing_count += 1
                continue
            
            # Create user
            user = UserDetails.objects.create(
                firstName=first_name,
                lastName=last_name,
                phoneNumber=f"+1{random.randint(1000000000, 9999999999)}",
                email=email,
                role='student',
                encryptedPassword='demo_password_hash',  # This is just for demo
                created_date=created_date,
                blocked=False,
                blockedTimestamp=date.today(),
                last_login_date=last_login,
                current_streak=current_streak,
                longest_streak=longest_streak,
                xp=xp,
                tag=org_tag
            )
            
            # Create student profile
            Student.objects.create(
                user=user,
                batch=batch,
                latestLevelId=random.randint(1, 5),
                latestClassId=random.randint(1, 3)
            )
            
            created_count += 1
            
            if created_count % 10 == 0:
                self.stdout.write(f'Created {created_count} students...')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} new students with random XP values!\n'
                f'Skipped {existing_count} existing students.\n'
                f'Total students in database: {UserDetails.objects.filter(role="student").count()}'
            )
        )
        
        # Show top 10 leaderboard
        top_students = UserDetails.objects.filter(role='student').order_by('-xp')[:10]
        self.stdout.write('\nTop 10 Leaderboard:')
        self.stdout.write('Rank | Name | XP | Streak')
        self.stdout.write('-' * 40)
        for i, student in enumerate(top_students, 1):
            self.stdout.write(f'{i:4} | {student.firstName} {student.lastName} | {student.xp:4} | {student.current_streak:2}')
