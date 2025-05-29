import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/stores/auth";
import { Permission, Role } from "@/types/rbac";
import { PermissionGate } from "../rbac/PermissionGate";

interface MenuItem {
  path: string;
  label: string;
  permissions?: Permission[];
  roles?: Role[];
  icon?: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    path: "/",
    label: "Главная",
  },
  {
    path: "/catalog",
    label: "Каталог",
    permissions: [Permission.VIEW_CARS],
  },
  {
    path: "/dashboard",
    label: "Панель управления",
    permissions: [Permission.VIEW_DASHBOARD],
  },
  {
    path: "/users",
    label: "Пользователи",
    permissions: [Permission.VIEW_USERS],
  },
  {
    path: "/users/guests",
    label: "Заявки на регистрацию",
    permissions: [Permission.VIEW_REGISTRATIONS],
  },
];

export const RoleBasedMenu: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, isManager, isUser } = usePermissions();
  const { logout } = useAuthStore();

  if (!user) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-lg md:text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Hello</span> Car Sharing
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Вход
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-lg md:text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Hello</span> Car Sharing
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <PermissionGate key={item.path} permissions={item.permissions} roles={item.roles}>
                <Link
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              </PermissionGate>
            ))}

            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-600">Привет, {user.firstName}</span>
              <div className="flex items-center space-x-1">
                {isAdmin() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Админ
                  </span>
                )}
                {isManager() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Менеджер
                  </span>
                )}
                {isUser() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Пользователь
                  </span>
                )}
              </div>
              <button
                onClick={() => logout()}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
