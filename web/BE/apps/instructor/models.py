from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()
# Create your models here.

class Instructor(models.Model):
    on_leave = models.BooleanField(default=False)
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='instructor'
    )

    def get_upload_history(self):
        return self.upload_history
    
    def get_subjects(self):
        return self.subjects
    
    def __str__(self):
        return self.user.email

class Subject(models.Model):
    name = models.TextField()
    instructor = models.ManyToManyField(Instructor, related_name='subjects')

    def get_uploads(self):
        return self.uploads
    
    def get_upload_history(self):
        return self.upload_history
    
    def __str__(self):
        return self.name


class Upload(models.Model):
    file_name = models.TextField()
    file = models.FileField(upload_to='files/', null=True)
    subjects = models.ManyToManyField(Subject, related_name='uploads')


class UploadHistory(models.Model):
    class UploadAction(models.TextChoices):
        UPLOAD = 'UPLOAD'
        UPDATE = 'UPDATE'
        DELETE = 'DELETE'

    action = models.TextField(choices=UploadAction, default=UploadAction.UPLOAD)
    actionAt = models.DateTimeField(default=timezone.now)


    instructor = models.ForeignKey(
        Instructor,
        null=True,
        on_delete=models.SET_NULL,
        related_name='upload_history'
    )

    upload = models.ForeignKey(
        Upload,
        null=True,
        on_delete=models.CASCADE,
        related_name='upload_history'
    )