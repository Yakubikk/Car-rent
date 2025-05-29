import type { ComponentType } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, Role } from "@/types/rbac";

interface WithRoleProps {
  requiredPermissions?: Permission[];
  requiredRoles?: Role[];
  fallback?: ComponentType;
  requireAll?: boolean;
}

export function withRole<T extends object>(
  WrappedComponent: ComponentType<T>,
  options: WithRoleProps
) {
  const {
    requiredPermissions = [],
    requiredRoles = [],
    fallback: FallbackComponent,
    requireAll = false
  } = options;

  return function WithRoleComponent(props: T) {
    const { 
      hasAnyPermission, 
      hasAllPermissions, 
      hasAnyRole, 
      user 
    } = usePermissions();

    // Если пользователь не авторизован
    if (!user && (requiredPermissions.length > 0 || requiredRoles.length > 0)) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    // Проверяем разрешения
    let hasPermissionAccess = true;
    if (requiredPermissions.length > 0) {
      hasPermissionAccess = requireAll 
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }

    // Проверяем роли
    let hasRoleAccess = true;
    if (requiredRoles.length > 0) {
      hasRoleAccess = hasAnyRole(requiredRoles);
    }

    const hasAccess = hasPermissionAccess && hasRoleAccess;

    if (!hasAccess) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Примеры использования HOC
export const withAdminOnly = <T extends object>(Component: ComponentType<T>) =>
  withRole(Component, { requiredRoles: [Role.ADMIN] });

export const withManagerOrAdmin = <T extends object>(Component: ComponentType<T>) =>
  withRole(Component, { requiredRoles: [Role.ADMIN, Role.MANAGER] });

export const withUserPermissions = <T extends object>(Component: ComponentType<T>) =>
  withRole(Component, { requiredPermissions: [Permission.VIEW_CARS] });
