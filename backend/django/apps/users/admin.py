from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_superuser', 'is_staff', 'get_groups', 'is_active', 'date_joined', 'last_login')
    search_fields = ('email',)
    ordering = ('email',)

    def get_groups(self, obj):
        # Joins all group names into a comma-separated string (e.g., "Manager, Worker")
        return ", ".join([group.name for group in obj.groups.all()])
    
    get_groups.short_description = 'Assigned Groups' # Column header title
