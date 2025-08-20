from django.core.management.base import BaseCommand
from Authentication.models import UserDetails, Student, Batch, Curriculum, Progress

class Command(BaseCommand):
    help = 'Backfill Progress objects for all students and all quizzes in their batch.'

    def handle(self, *args, **options):
        students = Student.objects.all()
        created = 0
        for student in students:
            user = student.user
            batch = student.batch
            if not batch:
                continue
            for level in range(1, batch.latestLevelId + 1):
                for class_id in range(1, batch.latestClassId + 1):
                    quizzes = Curriculum.objects.filter(levelId=level, classId=class_id)
                    for quiz in quizzes:
                        if not Progress.objects.filter(user=user, quiz=quiz).exists():
                            Progress.objects.create(user=user, quiz=quiz)
                            created += 1
        self.stdout.write(self.style.SUCCESS(f'Created {created} Progress objects.'))
