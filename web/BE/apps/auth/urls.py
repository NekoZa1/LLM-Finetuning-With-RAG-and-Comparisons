from django.urls import path
from . import views

app_name = 'auth'

urlpatterns = [
    path('login', views.google_login, name='login'),
    path('logout', views.logout_app, name='logout')
]