import { usePermissions } from "@/hooks/usePermissions";
import { Permission, Role } from "@/types/rbac";

interface PermissionGateProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: Role[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = требуются ВСЕ разрешения, false = любое из них
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  requireAll = false
}) => {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();

  let hasPermissionAccess = true;
  let hasRoleAccess = true;

  // Проверяем разрешения
  if (permissions.length > 0) {
    hasPermissionAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Проверяем роли
  if (roles.length > 0) {
    hasRoleAccess = hasAnyRole(roles);
  }

  const hasAccess = hasPermissionAccess && hasRoleAccess;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
