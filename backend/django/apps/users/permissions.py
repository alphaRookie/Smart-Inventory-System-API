from rest_framework import permissions

class IsAccOwner(permissions.BasePermission):
    """ Checks if the person asking is the owner of the specific Account """
    # Runs after the view has fetched a specific database object (like a specific user account or a specific product)
    def has_object_permission(self, request, view, obj): # ORDER MATTERS HERE, `obj` must be the last
        return bool(
            request.user and 
            request.user.is_authenticated and 
            obj == request.user # if the obj(our profile) == person who logged in
        )
        
class IsManager(permissions.BasePermission):
    """ Allows access only to users in the 'Manager' group. """
    # Runs before the view even looks at what object you are trying to touch. ("Can this user visit this endpoint at all?")
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__in=['Manager']).exists())
        )

