import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, Role } from "@/types/rbac";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: Role[];
  fallbackPath?: string;
  requireAuth?: boolean;
  requireActive?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = "/login",
  requireAuth = true,
  requireActive = false,
}) => {
  const { user, hasAnyPermission, hasAnyRole, isActive } = usePermissions();
  const location = useLocation();

  // Если требуется аутентификация, но пользователь не залогинен
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Если пользователь есть, но загружается
  if (requireAuth && !user) {
    return <LoadingSpinner fullScreen />;
  }

  // Если пользователь неактивен, перенаправляем на страницу неактивного аккаунта
  if (requireActive && !isActive) {
    return <Navigate to="/account-inactive" replace />;
  }

  // Проверяем разрешения
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Проверяем роли
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
