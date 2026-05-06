from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import logout
from django.http import JsonResponse
from django.views.decorators.http import require_POST


def google_login(request):
    """
    Chuyển hướng đến trang Google OAuth2 của allauth.
    URL name chính xác trong allauth >= 0.45: 'google_login'
    nằm trong allauth.socialaccount.providers.google.views
    """
    # Trong allauth mới, URL được include qua 'allauth.socialaccount.urls'
    # nên sử dụng tên đầy đủ với namespace
    try:
        url = reverse('google_login')
    except Exception as e:
        print(f'login: {e}')
        url = '/allauth/google/login/'
    return HttpResponseRedirect(f'{url}?process=login')

@require_POST
def logout_app(request):
    try:
        logout(request)
        
        response = JsonResponse({
            'message': 'Logout successfully, redirect to login page',
            'success': True
        }, status=200)
        
        # Delete cookies to ensure complete session cleanup
        response.delete_cookie('csrftoken')
        response.delete_cookie('sessionid')
        
        
        print(f'[LOGOUT] User logged out successfully')
        return response
        
    except Exception as e:
        print(f'[LOGOUT ERROR] {str(e)}')
        return JsonResponse({
            'message': 'Logout failed',
            'success': False,
            'error': str(e)
        }, status=500)