from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

User = get_user_model()

class NoSignupAccountAdapter(DefaultAccountAdapter):
   def is_open_for_signup(self, request):
       """
       Not open for signup.
       """
       return False
