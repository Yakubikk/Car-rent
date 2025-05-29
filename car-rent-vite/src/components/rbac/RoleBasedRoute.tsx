import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, Role } from "@/types/rbac";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  allowedPermissions?: Permission[];
  redirectTo?: string;
  showLoading?: boolean;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles = [],
  allowedPermissions = [],
  redirectTo = "/unauthorized",
  showLoading = true
}) => {
  const { user, hasAnyRole, hasAnyPermission } = usePermissions();

  // Показываем загрузку, пока пользователь не загружен
  if (!user && showLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем роли
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Проверяем разрешения
  if (allowedPermissions.length > 0 && !hasAnyPermission(allowedPermissions)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
