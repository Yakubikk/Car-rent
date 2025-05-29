import { Link } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { PermissionGate } from "@/components/rbac/PermissionGate";

export default function DashboardPage() {
  const { user, isAdmin, isManager, getUserRoles, userPermissions } = usePermissions();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="mt-2 text-gray-600">
          Добро пожаловать, {user.firstName} {user.lastName}
        </p>
        <div className="mt-4">
          <span className="text-sm text-gray-500">Ваши роли: </span>
          {getUserRoles().map((role) => (
            <span
              key={role}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ml-1"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Карточка управления пользователями */}
        <PermissionGate permissions={[Permission.VIEW_USERS]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Пользователи</dt>
                    <dd className="text-lg font-medium text-gray-900">Управление пользователями</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/users" className="font-medium text-indigo-700 hover:text-indigo-900">
                  Просмотреть всех пользователей
                </Link>
              </div>
            </div>
          </div>
        </PermissionGate>

        {/* Карточка заявок на регистрацию */}
        <PermissionGate permissions={[Permission.VIEW_REGISTRATIONS]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Заявки</dt>
                    <dd className="text-lg font-medium text-gray-900">Запросы на регистрацию</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/users/guests" className="font-medium text-indigo-700 hover:text-indigo-900">
                  Обработать заявки
                </Link>
              </div>
            </div>
          </div>
        </PermissionGate>

        {/* Карточка каталога автомобилей */}
        <PermissionGate permissions={[Permission.VIEW_CARS]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Каталог</dt>
                    <dd className="text-lg font-medium text-gray-900">Автомобили</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/catalog" className="font-medium text-indigo-700 hover:text-indigo-900">
                  Просмотреть каталог
                </Link>
              </div>
            </div>
          </div>
        </PermissionGate>

        {/* Карточка аналитики для админов */}
        <PermissionGate permissions={[Permission.VIEW_ANALYTICS]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Аналитика</dt>
                    <dd className="text-lg font-medium text-gray-900">Статистика и отчёты</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">Скоро доступно</span>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>

      {/* Информация о разрешениях для отладки (только для админов) */}
      {isAdmin() && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о разрешениях (debug)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700">Ваши разрешения:</h4>
              <ul className="mt-2 space-y-1">
                {userPermissions.map((permission) => (
                  <li key={permission} className="text-gray-600">
                    • {permission}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Статус ролей:</h4>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Админ: {isAdmin() ? "✅" : "❌"}</li>
                <li>• Менеджер: {isManager() ? "✅" : "❌"}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}