import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import { useEffect, useState } from "react";
import { UsersApi } from "@/api/users.ts";
import toast from "react-hot-toast";
import type { User } from "@/types/auth.ts";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"active" | "inactive" | "all">("active");
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
    const matchesName =
      user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === "" || user.roles.includes(roleFilter);

    // Обработка трех состояний фильтра активности: "active", "inactive", "all"
    const matchesActive = activeFilter === "all" ? true : activeFilter === "active" ? user.isActive : !user.isActive;

    return matchesName && matchesRole && matchesActive;
  });

  const getRoleBadge = (roles: string[]) => {
    const role = roles[0]; // Берем первую роль
    const colors = {
      Admin: "bg-red-100 text-red-800",
      Manager: "bg-pink-light text-pink-dark",
      User: "bg-pink-light text-pink-primary",
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
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-pink-text">Управление пользователями</h1>
          <p className="mt-2 text-pink-text">Просмотр и управление пользователями системы</p>
        </div>

        <PermissionGate permissions={[Permission.CREATE_USER]}>
          <button
            className="bg-pink-primary hover:bg-pink-hover text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => navigate("/users/add")}
          >
            Добавить пользователя
          </button>
        </PermissionGate>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-text">Поиск</label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
              placeholder="Имя, фамилия или email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-text">Роль</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
            >
              <option value="">Все роли</option>
              <option value="Admin">Администратор</option>
              <option value="Manager">Менеджер</option>
              <option value="User">Пользователь</option>
              <option value="Guest">Гость</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-text">Статус</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "active" | "inactive" | "all")}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
            >
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="all">Все</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter("");
                setRoleFilter("");
                setActiveFilter("active");
              }}
              className="w-full bg-pink-light hover:bg-pink-secondary text-pink-text px-4 py-2 rounded-md text-sm font-medium"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white shadow-pink border border-pink-border overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-pink-border">
          {filteredUsers.map((user) => (
            <li key={user.email}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={
                              user.avatarUrl.startsWith("http")
                                ? user.avatarUrl
                                : `${import.meta.env.VITE_API_URL}${user.avatarUrl}`
                            }
                            alt={`${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`}
                            className="h-full w-full rounded-full object-cover"
                            onError={(e) => {
                              // Если изображение не загрузилось, показываем инициалы
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement?.classList.add("avatar-error");
                            }}
                          />
                        ) : (
                          <span className="text-pink-primary text-lg font-bold">
                            {user.firstName[0].toUpperCase()}
                            {user.lastName[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-pink-text">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.roles.length > 0 &&
                          user.roles.map((role) => (
                            <span
                              key={role}
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(
                                [role]
                              )}`}
                            >
                              {translateRole(role)}
                            </span>
                          ))}
                        {!user.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Неактивен
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-pink-text opacity-75">{user.email}</div>
                      <div className="text-sm text-pink-text opacity-75">
                        Регистрация: {new Date(user.registerDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <PermissionGate permissions={[Permission.VIEW_BOOKINGS]}>
                      <button
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm"
                        onClick={() => navigate(`/rentals?userId=${user.id}`)}
                      >
                        Бронирования
                      </button>
                    </PermissionGate>

                    <PermissionGate permissions={[Permission.EDIT_USER]}>
                      <button
                        className="bg-pink-light hover:bg-pink-secondary text-pink-primary px-3 py-1 rounded text-sm"
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                      >
                        Редактировать
                      </button>
                    </PermissionGate>

                    <PermissionGate permissions={[Permission.BAN_USER]}>
                      <button
                        className={`px-3 py-1 rounded text-sm ${
                          user.isActive
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                        onClick={async () => {
                          try {
                            if (user.isActive) {
                              await UsersApi.activate(user.email, false);
                              toast.success("Пользователь деактивирован");
                            } else {
                              await UsersApi.activate(user.email, true);
                              toast.success("Пользователь активирован");
                            }
                            setUsers((prev) =>
                              prev.map((u) => (u.email === user.email ? { ...u, isActive: !u.isActive } : u))
                            );
                          } catch (err) {
                            if ((err as AxiosError)?.isAxiosError) {
                              toast.error(
                                ((err as AxiosError).response?.data as { message?: string })?.message ||
                                  "Ошибка при изменении статуса пользователя"
                              );
                            } else {
                              toast.error("Ошибка при изменении статуса пользователя");
                            }
                            console.error(err);
                          }
                        }}
                      >
                        {user.isActive ? "Деактивировать" : "Активировать"}
                      </button>
                    </PermissionGate>

                    {/* Только админы могут удалять пользователей */}
                    <PermissionGate permissions={[Permission.DELETE_USER]}>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
                        onClick={async () => {
                          if (
                            window.confirm(
                              `Вы действительно хотите удалить пользователя ${user.firstName} ${user.lastName}?`
                            )
                          ) {
                            try {
                              await UsersApi.deleteUser(user.id);
                              toast.success("Пользователь успешно удален");
                              // Удаляем пользователя из списка
                              setUsers(users.filter((u) => u.id !== user.id));
                            } catch (err) {
                              if ((err as AxiosError)?.isAxiosError) {
                                toast.error(
                                  ((err as AxiosError).response?.data as { message?: string })?.message ||
                                    "Ошибка при удалении пользователя"
                                );
                              } else {
                                toast.error("Ошибка при удалении пользователя");
                              }
                              console.error(err);
                            }
                          }
                        }}
                      >
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

      {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500">Пользователи не найдены</div>}

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
              <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.isActive).length}</div>
              <div className="text-sm text-gray-500">Активных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter((u) => u.roles.includes("Admin")).length}
              </div>
              <div className="text-sm text-gray-500">Администраторов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {users.filter((u) => u.roles.includes("Guest")).length}
              </div>
              <div className="text-sm text-gray-500">Гостей</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
