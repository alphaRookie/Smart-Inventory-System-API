from rest_framework import permissions

class IsManagerOrReadOnly(permissions.BasePermission):
    """
    - Anyone logged in can read (GET) product and shelf data.
    - Only Managers can create, update, or delete products and shelves.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Safe methods (GET) allowed for all authenticated staff
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write methods require Manager role or Django staff status
        return request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name='Manager').exists()


class IsManagerOrWorker(permissions.BasePermission):
    """ Allows inventory workers or managers to log stock changes, spoilage checks, or shelf updates. """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__in=['Manager', 'Worker']).exists())
        )


class IsManager(permissions.BasePermission):
    """ Allows inventory managers to log stock changes, spoilage checks, or shelf updates. """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__in=['Manager']).exists())
        )
