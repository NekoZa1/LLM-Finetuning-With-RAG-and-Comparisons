from django.contrib import admin
from .models import *

from import_export import resources, fields
from import_export.widgets import ManyToManyWidget
from import_export.admin import ImportExportModelAdmin

class UploadHistoryAdmin(admin.ModelAdmin):
    list_display = ['instructor__user__email', 'action', 'upload__file', 'actionAt']

class InstructorAdmin(admin.ModelAdmin):
    list_display = ['user__email', 'on_leave']

class UploadAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'get_subjects']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('subjects')
    
    def get_subjects(self, obj):
        return ', '.join([s.name for s in obj.subjects.all()])

admin.site.register(UploadHistory, UploadHistoryAdmin)
admin.site.register(Instructor, InstructorAdmin)
admin.site.register(Upload, UploadAdmin)

class InstructorEmailWidget(ManyToManyWidget):
    def clean(self, value, row=None, **kwargs):
        emails = [v.strip() for v in value.split(',') if v.strip()]
        return Instructor.objects.filter(user__email__in=emails)

class SubjectInstructorResource(resources.ModelResource):
    instructors = fields.Field(
        column_name='instructor',
        attribute='instructor',
        widget=InstructorEmailWidget(Instructor)
    )

    class Meta:
        model=Subject
        import_id_fields = []
        exclude = ('id', 'instructor')

class SubjectResource(resources.ModelResource):
    class Meta:
        model=Subject
        import_id_fields = []
        fields = ('name')

@admin.register(Subject)
class CustomUserAdmin(ImportExportModelAdmin):
    resource_classes = [SubjectResource, SubjectInstructorResource]
    list_display = ['name']



