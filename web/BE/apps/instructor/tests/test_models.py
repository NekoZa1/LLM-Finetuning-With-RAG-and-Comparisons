import os

from django.test import TestCase
from django.core.files import File

from .. models import Upload, Instructor
from apps.instructor.filehandler import parsing_and_chunking

class TestInstructorFile(TestCase):
    def setUp(self):
        with open('./media/files/Session1.pdf', 'rb') as f:
            self.upload = Upload.objects.create(
                file_name = 'Upload.pdf',
                file = File(f)
            )

    def test_name_conflict(self):
        with open('./media/files/Session1.pdf', 'rb') as f:
            another_upload = Upload.objects.create(
                file_name = 'AnotherUpload.pdf',
                file = File(f)
            )

        self.assertNotEqual(self.upload.file.name, another_upload.file.name)

    # def test_file_handler(self):
    #     chunks, metadatas = parsing_and_chunking({
    #         'name': self.upload.file_name,
    #         'ext': os.path.splitext(self.upload.file.name)[1],
    #         'saved_name': self.upload.file.name.split('/')[-1]
    #     })

    #     self.assertGreater(len(chunks), 0)
    #     self.assertGreater(len(metadatas), 0)