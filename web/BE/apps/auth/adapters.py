from allauth.account.adapter import DefaultAccountAdapter

class AccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        user = request.user
        
        if (user.role == 'instructor'): return 'http://localhost:5173/teacher'
        elif (user.role == 'student'): return 'http://localhost:5173/dashboard'
        else: return 'http://localhost:8000/admin'
            
            
    def get_signup_redirect_url(self, request):
        return 'http://localhost:5173/dashboard'

