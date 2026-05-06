import os
import json
from datetime import datetime

from django.shortcuts import render
from django.forms.models import model_to_dict
from django.db import transaction, IntegrityError
from django.http import JsonResponse, HttpRequest
from django.contrib.auth.decorators import user_passes_test, login_required

from .models import *
from vectordb import VectorDB
from apps.instructor.filehandler import parsing_and_chunking

def is_instructor(user):
    return user.role == 'instructor'

@login_required
@user_passes_test(is_instructor)
def upload_history_view(request: HttpRequest):
    instructor = Instructor.objects.get(user=request.user)
    instructor_subjects = set(instructor.subjects.values_list('id', flat=True))

    if request.method == 'GET':
        upload_history = instructor \
                        .get_upload_history() \
                        .filter(action=UploadHistory.UploadAction.UPLOAD) \
                        .values_list('upload', flat=True)
        
        subjects = Subject.objects.prefetch_related('uploads')
        subjects_uploads = {s.name: list(s.uploads.filter(id__in=upload_history).values()) for s in subjects}

        return JsonResponse(
            {'subjectsUploads': subjects_uploads},
            status=200
        )

    elif request.method == 'POST':
        files = request.FILES.getlist('files')
        metadata = request.POST['metadata']
        metadata = json.loads(metadata)
        upload_ids = []

        if (len(files) != len(metadata)):
            return JsonResponse(
                {'error': "Number of files and metadata mismatch"},
                status=400
            )

        # Check if all subjects in metadata are taught by the instructor
        for meta in metadata:
            if not all(subj_id in instructor_subjects for subj_id in meta['subjects']):
                return JsonResponse(
                    {'error': 'You can only upload files to subjects you teach.'},
                    status=403
                )

        try:
            with transaction.atomic():
                for index, f in enumerate(files):
                    upload = Upload.objects.create(
                        file = f,
                        file_name = f.name,
                    )

                    UploadHistory.objects.create(
                        action=UploadHistory.UploadAction.UPLOAD,
                        instructor = instructor,
                        upload = upload
                    )

                    upload.subjects.add(*metadata[index]['subjects'])
                    upload_ids.append(upload.id)

                    if request.POST.get('test', False): continue
                    
                    chunks, metadatas = parsing_and_chunking({
                        'name': upload.file_name,
                        'ext': os.path.splitext(upload.file.name)[1],
                        'saved_name': upload.file.name.split('/')[-1]
                    })

                    VectorDB.get_instance().add(chunks, metadatas)

            return JsonResponse(
                {'uploadIds': upload_ids},
                status=201
            )

        except IntegrityError:
            return JsonResponse(
                {'error': "Transaction failed"},
                status=500
            )
        
        except Exception as e:
            print(e)
            return JsonResponse(
                {'error': "Parsing uploaded files failed"},
                status=500
            )

@login_required
@user_passes_test(is_instructor)
def upload_view(request, file_id):
    instructor = Instructor.objects.get(user=request.user)
    upload = Upload.objects.filter(pk=file_id)

    if upload.exists():
        upload = upload.get()
        upload_dict = model_to_dict(upload)
        upload_dict['file'] = upload.file.name.split('/')[-1]
        upload_dict['subjects'] = list(upload.subjects.values_list('id', flat=True))


        if request.method == 'GET':        
            return JsonResponse(
                {'upload': upload_dict},
                status=200
            )

        elif request.method == 'PUT':
            body = json.loads(request.body)
            ext = os.path.splitext(upload.file.name)[1]
            saved_name = upload.file.name.split('/')[-1]
            new_name = body.get('file_name', upload.file_name)

            upload.file_name = new_name if new_name.endswith(ext) else new_name + ext
            upload_dict['file_name'] = upload.file_name

            if not body.get('test', False): VectorDB.get_instance().update(new_name, saved_name)
            upload.save()

            return JsonResponse(
                {'upload': upload_dict},
                status=200
            )

        elif request.method == 'DELETE':
            try:
                with transaction.atomic():
                    ext = os.path.splitext(upload.file.name)[1]
                    saved_name = upload.file.name.split('/')[-1]

                    if (not request.GET.get('test')): VectorDB.get_instance().delete(saved_name.replace(ext, '.pdf'))
                    upload.delete()

                    return JsonResponse(
                        {'upload': upload_dict},
                        status=200
                    )
                
            except IntegrityError:
                return JsonResponse(
                    {'error': "Transaction failed"},
                    status=500
                )
            
    else:
        return JsonResponse(
            {'error': "File not found"},
            status=404
        )

@login_required
@user_passes_test(is_instructor)
def instructor_subjects_view(request: HttpRequest):
    instructor = Instructor.objects.get(user=request.user)

    if request.method == 'GET':
        subjects = Subject.objects.prefetch_related('uploads').filter(instructor=instructor)
        subjects_uploads = {s.name: {'id': s.id, 'uploads': list(s.uploads.values())} for s in subjects}

        return JsonResponse(
            {'subjects': subjects_uploads},
            status = 200
        )