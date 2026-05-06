from django.urls import path
from . import views

app_name = 'instructor'

urlpatterns = [
    path('file', views.upload_history_view, name='files'),
    path('file/<int:file_id>', views.upload_view, name='file'),
    path('instructors/self/subjects', views.instructor_subjects_view)
]