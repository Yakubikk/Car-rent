import { Permission, Role } from "@/types/rbac";

export interface RouteConfig {
  path: string;
  requiredPermissions?: Permission[];
  requiredRoles?: Role[];
  isPublic?: boolean;
  requireActive?: boolean;
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  // Публичные маршруты
  { path: "/", isPublic: true },
  { path: "/login", isPublic: true },
  { path: "/register", isPublic: true },
  { path: "/catalog", requiredPermissions: [Permission.VIEW_CARS] },
  
  // Административные маршруты
  { 
    path: "/dashboard", 
    requiredPermissions: [Permission.VIEW_DASHBOARD] 
  },
  { 
    path: "/users",
    requiredPermissions: [Permission.VIEW_USERS]
  },
  { 
    path: "/users/guests", 
    requiredPermissions: [Permission.VIEW_REGISTRATIONS] 
  },
  { 
    path: "/new-registration/*", 
    requiredPermissions: [Permission.APPROVE_REGISTRATION, Permission.REJECT_REGISTRATION] 
  },
];

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return ROUTE_CONFIGS.find(config => {
    if (config.path.endsWith("/*")) {
      const basePath = config.path.slice(0, -2);
      return path.startsWith(basePath);
    }
    return config.path === path;
  });
};
