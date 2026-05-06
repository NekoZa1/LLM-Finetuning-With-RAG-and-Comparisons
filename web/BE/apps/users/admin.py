from django.contrib import admin
from django.contrib.auth import get_user_model

from import_export import resources
from import_export.admin import ImportExportModelAdmin

from apps.instructor.models import Instructor

CustomUser = get_user_model()

class CustomUserResource(resources.ModelResource):
    class Meta:
        model=CustomUser
        import_id_fields = []
        fields = ('first_name', 'last_name', 'email', 'username', 'role')
        
    def after_save_instance(self, instance, row, **kwargs):
        if (instance.role == CustomUser.Role.INSTRUCTOR):
           Instructor(on_leave=False, user=instance).save()
        

@admin.register(CustomUser)
class CustomUserAdmin(ImportExportModelAdmin):
    resource_classes = [CustomUserResource]
    list_display = ('email', 'role')
