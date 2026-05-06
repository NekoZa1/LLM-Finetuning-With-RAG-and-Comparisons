from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required

from . import models

# Create your views here.
def home(request):
    return HttpResponse('Testing')

@login_required
def get_me(request):
    return JsonResponse(
        {'email': request.user.email, 'role': request.user.role},
        status=201
    )


