import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import {useEffect, useState} from "react";
import {UsersApi} from "@/api/users.ts";
import toast from "react-hot-toast";
import type {User} from "@/types/auth.ts";

export default function UsersPage() {
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestUsers = async () => {
      try {
        setLoading(true);
        const users = await UsersApi.getAll();
        setUsers(users);
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить список пользователей");
        toast.error("Ошибка при загрузке пользователей");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesName = user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
                       user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
                       user.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === "" || user.roles.includes(roleFilter);
    return matchesName && matchesRole;
  });

  const getRoleBadge = (roles: string[]) => {
    const role = roles[0]; // Берем первую роль
    const colors = {
      Admin: "bg-red-100 text-red-800",
      Manager: "bg-blue-100 text-blue-800",
      User: "bg-green-100 text-green-800",
      Guest: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const translateRole = (role: string) => {
    const translations: Record<string, string> = {
      Admin: "Администратор",
      Manager: "Менеджер",
      User: "Пользователь",
      Guest: "Гость",
    };
    return translations[role] || role;
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="mt-2 text-gray-600">
            Просмотр и управление пользователями системы
          </p>
        </div>
        
        <PermissionGate permissions={[Permission.CREATE_USER]}>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Добавить пользователя
          </button>
        </PermissionGate>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Поиск</label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Имя, фамилия или email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Роль</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Все роли</option>
              <option value="Admin">Администратор</option>
              <option value="Manager">Менеджер</option>
              <option value="User">Пользователь</option>
              <option value="Guest">Гость</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter("");
                setRoleFilter("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user.email}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl} alt={`${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg font-bold">
                            {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.roles.length > 0 && (
                          user.roles.map((role) => (
                            <span key={role} className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge([role])}`}>
                              {translateRole(role)}
                            </span>
                          ))
                        )}
                        {!user.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Неактивен
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        Регистрация: {new Date(user.registerDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PermissionGate permissions={[Permission.EDIT_USER]}>
                      <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded text-sm">
                        Редактировать
                      </button>
                    </PermissionGate>
                    
                    {/* Только админы могут удалять пользователей */}
                    <PermissionGate permissions={[Permission.DELETE_USER]}>
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm">
                        Удалить
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Пользователи не найдены
        </div>
      )}

      {/* Статистика для админов */}
      {isAdmin() && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика пользователей</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-500">Всего пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
              <div className="text-sm text-gray-500">Активных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{users.filter(u => u.roles.includes("Admin")).length}</div>
              <div className="text-sm text-gray-500">Администраторов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{users.filter(u => u.roles.includes("Guest")).length}</div>
              <div className="text-sm text-gray-500">Гостей</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}