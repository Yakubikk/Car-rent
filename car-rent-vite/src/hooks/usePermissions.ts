import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth";
import { Permission, Role, ROLE_PERMISSIONS } from "@/types/rbac";

export const usePermissions = () => {
  const { user } = useAuthStore();

  const userPermissions = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) {
      return [];
    }

    // Собираем все разрешения из всех ролей пользователя
    const permissions = new Set<Permission>();
    
    user.roles.forEach(roleName => {
      // Приводим роль к типу Role
      const role = roleName as Role;
      if (ROLE_PERMISSIONS[role]) {
        ROLE_PERMISSIONS[role].forEach(permission => {
          permissions.add(permission);
        });
      }
    });

    return Array.from(permissions);
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasRole = (role: Role): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const getUserRoles = (): Role[] => {
    if (!user?.roles) return [];
    return user.roles.filter(role => Object.values(Role).includes(role as Role)) as Role[];
  };

  const isAdmin = (): boolean => {
    return hasRole(Role.ADMIN);
  };

  const isManager = (): boolean => {
    return hasRole(Role.MANAGER);
  };

  const isUser = (): boolean => {
    return hasRole(Role.USER);
  };

  const isGuest = (): boolean => {
    return hasRole(Role.GUEST);
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    getUserRoles,
    isAdmin,
    isManager,
    isUser,
    isGuest,
    user
  };
};
