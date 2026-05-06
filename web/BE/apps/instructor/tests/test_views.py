import os
import json

from django.test import TestCase
from django.core.files import File
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from ..models import Upload, Instructor

User = get_user_model()

class TestViewInstructorFile(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email='tester@instructor.tdtu.edu.vn',
            role='instructor'
        )

        self.instructor = Instructor.objects.create(
            on_leave=False,
            user=self.user
        )

        with open('./media/files/Session1.pdf', 'rb') as f:
            self.upload = Upload.objects.create(
                file_name = 'Upload.pdf',
                file = File(f)
            )

    def test_file_upload(self):
        self.client.force_login(self.user)

        file  = SimpleUploadedFile(
            self.upload.file.name,
            self.upload.file.read(),
            content_type='application/pdf'
        )

        response = self.client.post('/api/file', {
            'test': True,
            'files': [file],
            'metadata': '[{"subjects": [1]}]'
        }
)

        data = response.json()
        self.assertEqual(response.status_code, 201)
        self.assertNotEqual(len(data.get('uploadIds')), 0)

    def test_file_rename(self):
        self.client.force_login(self.user)
        
        self.client.put(
            f'/api/file/{self.upload.id}', 
            content_type='application/json',
            data=json.dumps({ 'test': True, 'file_name': 'Session2.pdf' })
        )

        self.upload.refresh_from_db()
        self.assertEqual(self.upload.file_name, 'Session2.pdf')

    def test_file_delete(self):
        self.client.force_login(self.user)
        self.client.delete(f'/api/file/{self.upload.id}?test=True')
        self.assertEqual(Upload.objects.count(), 0)
    
            
