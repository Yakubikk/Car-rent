import { Role, Permission, ROLE_PERMISSIONS } from "@/types/rbac";
import type { User } from "@/types/auth";

/**
 * Проверяет, имеет ли пользователь определенную роль
 */
export function hasRole(user: User | null, role: Role): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Проверяет, имеет ли пользователь любую из указанных ролей
 */
export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user || !user.roles || roles.length === 0) return false;
  return roles.some(role => user.roles.includes(role));
}

/**
 * Проверяет, имеет ли пользователь все указанные роли
 */
export function hasAllRoles(user: User | null, roles: Role[]): boolean {
  if (!user || !user.roles || roles.length === 0) return false;
  return roles.every(role => user.roles.includes(role));
}

/**
 * Получает все разрешения для ролей пользователя
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user || !user.roles) return [];
  
  const permissions = new Set<Permission>();
  
  user.roles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role as Role] || [];
    rolePermissions.forEach(permission => permissions.add(permission));
  });
  
  return Array.from(permissions);
}

/**
 * Проверяет, имеет ли пользователь определенное разрешение
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
}

/**
 * Проверяет, имеет ли пользователь любое из указанных разрешений
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (permissions.length === 0) return true;
  const userPermissions = getUserPermissions(user);
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Проверяет, имеет ли пользователь все указанные разрешения
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (permissions.length === 0) return true;
  const userPermissions = getUserPermissions(user);
  return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Проверяет, является ли пользователь администратором
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, Role.ADMIN);
}

/**
 * Проверяет, является ли пользователь менеджером или администратором
 */
export function isManagerOrAdmin(user: User | null): boolean {
  return hasAnyRole(user, [Role.ADMIN, Role.MANAGER]);
}

/**
 * Проверяет, является ли пользователь обычным пользователем (не гостем)
 */
export function isRegisteredUser(user: User | null): boolean {
  return hasAnyRole(user, [Role.ADMIN, Role.MANAGER, Role.USER]);
}

/**
 * Проверяет, может ли пользователь управлять другим пользователем
 */
export function canManageUser(currentUser: User | null, targetUser: User | null): boolean {
  if (!currentUser || !targetUser) return false;
  
  // Администратор может управлять всеми
  if (isAdmin(currentUser)) return true;
  
  // Менеджер может управлять пользователями и гостями
  if (hasRole(currentUser, Role.MANAGER)) {
    return hasAnyRole(targetUser, [Role.USER, Role.GUEST]);
  }
  
  return false;
}

/**
 * Проверяет, может ли пользователь видеть данные другого пользователя
 */
export function canViewUser(currentUser: User | null, targetUser: User | null): boolean {
  if (!currentUser || !targetUser) return false;
  
  // Пользователь может видеть свои данные
  if (currentUser.id === targetUser.id) return true;
  
  // Администраторы и менеджеры могут видеть всех
  return isManagerOrAdmin(currentUser);
}

/**
 * Получает максимальную роль пользователя (по приоритету)
 */
export function getHighestRole(user: User | null): Role | null {
  if (!user || !user.roles) return null;
  
  const rolePriority = {
    [Role.ADMIN]: 4,
    [Role.MANAGER]: 3,
    [Role.USER]: 2,
    [Role.GUEST]: 1
  };
  
  return user.roles.reduce((highest, role) => {
    if (!highest) return role as Role;
    return rolePriority[role as Role] > rolePriority[highest] ? role as Role : highest;
  }, null as Role | null);
}

/**
 * Фильтрует маршруты на основе разрешений пользователя
 */
export function filterRoutesByPermissions<T extends { requiredPermissions?: Permission[]; requiredRoles?: Role[] }>(
  routes: T[],
  user: User | null
): T[] {
  return routes.filter(route => {
    // Если не требуются разрешения, маршрут доступен всем
    if (!route.requiredPermissions && !route.requiredRoles) return true;
    
    // Проверяем разрешения
    const hasRequiredPermissions = !route.requiredPermissions || 
      hasAnyPermission(user, route.requiredPermissions);
    
    // Проверяем роли
    const hasRequiredRoles = !route.requiredRoles || 
      hasAnyRole(user, route.requiredRoles);
    
    return hasRequiredPermissions && hasRequiredRoles;
  });
}

/**
 * Создает контекст безопасности для операций
 */
export interface SecurityContext {
  user: User | null;
  permissions: Permission[];
  roles: Role[];
  isAdmin: boolean;
  isManager: boolean;
  isRegistered: boolean;
}

export function createSecurityContext(user: User | null): SecurityContext {
  return {
    user,
    permissions: getUserPermissions(user),
    roles: user?.roles as Role[] || [],
    isAdmin: isAdmin(user),
    isManager: hasRole(user, Role.MANAGER),
    isRegistered: isRegisteredUser(user)
  };
}

/**
 * Логирование действий пользователей для аудита
 */
export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export function createAuditLog(
  user: User,
  action: string,
  resource: string,
  metadata?: Partial<AuditLog>
): AuditLog {
  return {
    userId: user.id,
    action,
    resource,
    timestamp: new Date(),
    ...metadata
  };
}

/**
 * Валидация ролей и разрешений
 */
export function validateRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

export function validatePermission(permission: string): permission is Permission {
  return Object.values(Permission).includes(permission as Permission);
}

/**
 * Утилита для проверки истечения сессии
 */
export function isSessionExpired(user: User | null): boolean {
  // Примечание: в текущем типе User нет поля sessionExpiry
  // Можно добавить логику проверки по времени последней активности
  if (!user) return true;
  return false; // Временная заглушка
}

/**
 * Получает человекочитаемое название роли
 */
export function getRoleDisplayName(role: Role): string {
  const roleNames = {
    [Role.ADMIN]: 'Администратор',
    [Role.MANAGER]: 'Менеджер',
    [Role.USER]: 'Пользователь',
    [Role.GUEST]: 'Гость'
  };
  return roleNames[role] || role;
}

/**
 * Получает человекочитаемое название разрешения
 */
export function getPermissionDisplayName(permission: Permission): string {
  const permissionNames: Record<Permission, string> = {
    [Permission.VIEW_CARS]: 'Просмотр автомобилей',
    [Permission.CREATE_CAR]: 'Добавление автомобиля',
    [Permission.EDIT_CAR]: 'Редактирование автомобиля',
    [Permission.DELETE_CAR]: 'Удаление автомобиля',
    [Permission.VIEW_USERS]: 'Просмотр пользователей',
    [Permission.CREATE_USER]: 'Создание пользователей',
    [Permission.EDIT_USER]: 'Редактирование пользователей',
    [Permission.DELETE_USER]: 'Удаление пользователей',
    [Permission.VIEW_REGISTRATIONS]: 'Просмотр регистраций',
    [Permission.APPROVE_REGISTRATION]: 'Подтверждение регистрации',
    [Permission.REJECT_REGISTRATION]: 'Отклонение регистрации',
    [Permission.VIEW_BOOKINGS]: 'Просмотр бронирований',
    [Permission.CREATE_BOOKING]: 'Создание бронирования',
    [Permission.EDIT_BOOKING]: 'Редактирование бронирования',
    [Permission.DELETE_BOOKING]: 'Удаление бронирования',
    [Permission.VIEW_OWN_BOOKINGS]: 'Просмотр своих бронирований',
    [Permission.VIEW_DASHBOARD]: 'Просмотр панели управления',
    [Permission.VIEW_ANALYTICS]: 'Просмотр аналитики',
    [Permission.MANAGE_SYSTEM]: 'Управление системой'
  };
  return permissionNames[permission] || permission;
}

/**
 * Проверяет, может ли пользователь получить доступ к маршруту
 */
export function canAccessRoute(
  user: User | null,
  requiredPermissions?: Permission[],
  requiredRoles?: Role[]
): boolean {
  if (!requiredPermissions && !requiredRoles) {
    return true; // Публичный маршрут
  }

  let hasPermissionAccess = true;
  let hasRoleAccess = true;

  if (requiredPermissions && requiredPermissions.length > 0) {
    hasPermissionAccess = hasAnyPermission(user, requiredPermissions);
  }

  if (requiredRoles && requiredRoles.length > 0) {
    hasRoleAccess = hasAnyRole(user, requiredRoles);
  }

  return hasPermissionAccess && hasRoleAccess;
}
