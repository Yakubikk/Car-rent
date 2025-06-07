export const Role = {
  ADMIN: "Admin",
  MANAGER: "Manager", 
  USER: "User",
  GUEST: "Guest"
} as const;

export type Role = typeof Role[keyof typeof Role];

export const Permission = {
  // Пользователи
  VIEW_USERS: "view_users",
  CREATE_USER: "create_user",
  EDIT_USER: "edit_user",
  BAN_USER: "ban_user",
  DELETE_USER: "delete_user",
  
  // Регистрации
  VIEW_REGISTRATIONS: "view_registrations",
  APPROVE_REGISTRATION: "approve_registration",
  REJECT_REGISTRATION: "reject_registration",
  
  // Автомобили
  VIEW_CARS: "view_cars",
  CREATE_CAR: "create_car",
  EDIT_CAR: "edit_car",
  DELETE_CAR: "delete_car",
  
  // Бронирования
  VIEW_BOOKINGS: "view_bookings",
  CREATE_BOOKING: "create_booking",
  CANCEL_BOOKING: "cancel_booking",
  EDIT_BOOKING: "edit_booking",
  DELETE_BOOKING: "delete_booking",
  VIEW_OWN_BOOKINGS: "view_own_bookings",
  
  // Административные функции
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_SYSTEM: "manage_system"
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

// Определяем какие разрешения имеет каждая роль
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Админ имеет все разрешения
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.BAN_USER,
    Permission.VIEW_REGISTRATIONS,
    Permission.APPROVE_REGISTRATION,
    Permission.REJECT_REGISTRATION,
    Permission.VIEW_CARS,
    Permission.CREATE_CAR,
    Permission.EDIT_CAR,
    Permission.DELETE_CAR,
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKING,
    Permission.CANCEL_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.DELETE_BOOKING,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM
  ],
  
  [Role.MANAGER]: [
    // Менеджер может управлять пользователями и регистрациями
    Permission.VIEW_USERS,
    Permission.EDIT_USER,
    Permission.BAN_USER,
    Permission.VIEW_REGISTRATIONS,
    Permission.APPROVE_REGISTRATION,
    Permission.REJECT_REGISTRATION,
    Permission.VIEW_CARS,
    Permission.CREATE_CAR,
    Permission.EDIT_CAR,
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.CREATE_BOOKING,
    Permission.CANCEL_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS
  ],
  
  [Role.USER]: [
    // Обычный пользователь может только бронировать автомобили
    Permission.VIEW_CARS,
    Permission.CREATE_BOOKING,
    Permission.CANCEL_BOOKING,
    Permission.VIEW_OWN_BOOKINGS
  ],
  
  [Role.GUEST]: [
    // Гость может только просматривать каталог
    Permission.VIEW_CARS
  ]
};

export interface RoleBasedRoute {
  path: string;
  requiredPermissions?: Permission[];
  requiredRoles?: Role[];
  fallbackPath?: string;
}
