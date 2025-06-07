import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/stores/auth";
import { Permission, Role } from "@/types/rbac";
import { PermissionGate } from "../rbac/PermissionGate";
import React, { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";

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
    path: "/my-rentals",
    label: "Мои бронирования",
    permissions: [Permission.VIEW_OWN_BOOKINGS],
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
  const { user } = usePermissions();
  const { logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-lg md:text-2xl font-bold text-pink-text">
                <img
                  src="https://hello.by/_next/image?url=%2Fassets%2Flogo.png&w=1080&q=75"
                  alt="Hello Car Sharing Logo"
                  className="h-8 w-auto inline-block mr-2"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-pink-text hover:text-pink-primary px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-100"
              >
                Вход
              </Link>
              <Link
                to="/register"
                className="bg-pink-primary hover:bg-pink-hover text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <span className="text-white">Регистрация</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-lg md:text-2xl font-bold text-pink-text">
              <img
                src="https://hello.by/_next/image?url=%2Fassets%2Flogo.png&w=1080&q=75"
                alt="Hello Car Sharing Logo"
                className="h-8 w-auto inline-block mr-2"
              />
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <PermissionGate key={item.path} permissions={item.permissions} roles={item.roles}>
                <Link
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? "bg-pink-light text-pink-primary"
                      : "text-pink-text hover:text-pink-primary hover:bg-pink-light"
                  }`}
                >
                  {item.label}
                </Link>
              </PermissionGate>
            ))}

            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-pink-border">
              <div className="flex-shrink-0 h-10 w-10">
                <Link to="/profile">
                  <div className="h-10 w-10 rounded-full bg-pink-light flex items-center justify-center cursor-pointer">
                    {user.avatarUrl ? (
                      <img
                        src={
                          user.avatarUrl.startsWith("http")
                            ? user.avatarUrl
                            : `${import.meta.env.VITE_API_URL}${user.avatarUrl}`
                        }
                        alt={`${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-pink-primary text-lg font-semibold">
                        {user.firstName[0].toUpperCase()}
                        {user.lastName[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
              <button
                onClick={() => logout()}
                className="text-pink-text hover:text-pink-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Выход
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-pink-primary hover:text-pink-hover hover:bg-pink-light focus:outline-none"
            >
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <PermissionGate key={item.path} permissions={item.permissions} roles={item.roles}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? "bg-pink-light text-pink-primary"
                      : "text-pink-text hover:text-pink-primary hover:bg-pink-light"
                  }`}
                >
                  {item.label}
                </Link>
              </PermissionGate>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-pink-border">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={
                          user.avatarUrl.startsWith("http")
                            ? user.avatarUrl
                            : `${import.meta.env.VITE_API_URL}${user.avatarUrl}`
                        }
                        alt={`${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          // В случае ошибки загрузки изображения показываем инициалы
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const span = document.createElement("span");
                            span.className = "text-pink-primary text-lg font-semibold";
                            span.textContent = `${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`;
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-pink-primary text-lg font-semibold">
                        {user.firstName[0].toUpperCase()}
                        {user.lastName[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-pink-text">
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-pink-text hover:text-pink-primary hover:bg-pink-light"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
