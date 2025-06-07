import { useState, useEffect } from "react";
import { RentalsApi } from "@/api/rentals.ts";
import { CarsApi } from "@/api/cars.ts";
import { UsersApi } from "@/api/users.ts";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link, useSearchParams } from "react-router-dom";
import type { Rental, Car } from "@/types/car.ts";
import type { User } from "@/types/auth.ts";
import toast from "react-hot-toast";

export default function RentalsPage() {
  const [searchParams] = useSearchParams();
  const { hasPermission } = usePermissions();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [carsData, setCarsData] = useState<Record<string, Car>>({});
  const [usersData, setUsersData] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>(searchParams.get("userId") || "");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  // Загрузка всех бронирований
  useEffect(() => {
    async function loadRentals() {
      try {
        setLoading(true);

        // Загружаем все бронирования
        const rentalsData = await RentalsApi.getAll();
        setRentals(rentalsData);

        // Загружаем список пользователей для фильтра
        const usersData = await UsersApi.getAll();
        setUsers(usersData);

        // Собираем уникальные id автомобилей
        const carIds = [...new Set(rentalsData.map((rental) => rental.carId))];

        // Загружаем данные по каждому автомобилю
        const carsInfo: Record<string, Car> = {};
        for (const carId of carIds) {
          const carData = await CarsApi.getCarById(carId);
          if (carData) {
            carsInfo[carId] = carData;
          }
        }

        setCarsData(carsInfo);

        // Создаем справочник пользователей
        const usersInfo: Record<string, User> = {};
        usersData.forEach((user) => {
          usersInfo[user.id] = user;
        });

        setUsersData(usersInfo);
      } catch (err) {
        console.error("Ошибка при загрузке бронирований:", err);
        setError("Не удалось загрузить данные о бронированиях. Пожалуйста, попробуйте снова позже.");
      } finally {
        setLoading(false);
      }
    }

    loadRentals();
  }, []);

  // Фильтрация бронирований
  const filteredRentals = rentals.filter((rental) => {
    // Фильтр по статусу
    if (statusFilter && rental.status !== statusFilter) {
      return false;
    }

    // Фильтр по пользователю
    if (selectedUserId && rental.userId !== selectedUserId) {
      return false;
    }

    // Фильтр по дате
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const startDate = new Date(rental.startDateTime);
      const endDate = new Date(rental.endDateTime);

      // Проверяем, что дата фильтра входит в период бронирования
      if (filterDate < startDate || filterDate > endDate) {
        return false;
      }
    }

    // Поиск по имени пользователя или автомобиля
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const user = usersData[rental.userId];
      const car = carsData[rental.carId];

      const userFullName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : "";
      const carFullName = car ? `${car.brand} ${car.model}`.toLowerCase() : "";

      if (!userFullName.includes(query) && !carFullName.includes(query) && !rental.id.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Проверка разрешений
  if (!hasPermission(Permission.VIEW_BOOKINGS)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
          <h1 className="text-2xl font-bold text-pink-text mb-4">Доступ запрещен</h1>
          <p className="text-pink-text mb-4">У вас нет разрешения на просмотр бронирований пользователей.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  // Отображение загрузки
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Вспомогательная функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Вспомогательная функция для определения статуса бронирования
  const getStatusName = (status: string) => {
    switch (status) {
      case "Booked":
        return "Забронировано";
      case "Active":
        return "Активно";
      case "Completed":
        return "Завершено";
      case "Cancelled":
        return "Отменено";
      default:
        return status;
    }
  };

  // Вспомогательная функция для определения класса статуса
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Booked":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Функция отмены бронирования
  const handleCancelRental = async (rentalId: string) => {
    if (!window.confirm("Вы уверены, что хотите отменить бронирование?")) {
      return;
    }

    try {
      setCancellingId(rentalId);
      await RentalsApi.cancelRental(rentalId);

      // Обновляем список бронирований
      setRentals((prevRentals) =>
        prevRentals.map((rental) => (rental.id === rentalId ? { ...rental, status: "Cancelled" } : rental))
      );

      toast.success("Бронирование успешно отменено");
    } catch (err) {
      console.error("Ошибка при отмене бронирования:", err);
      toast.error("Не удалось отменить бронирование");
    } finally {
      setCancellingId(null);
    }
  };

  // Сбросить все фильтры
  const resetFilters = () => {
    setStatusFilter("");
    setSearchQuery("");
    setSelectedUserId(searchParams.get("userId") || "");
    setDateFilter("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-pink-text">Управление бронированиями</h1>
          <p className="mt-2 text-pink-text">
            {selectedUserId && usersData[selectedUserId]
              ? `Бронирования пользователя ${usersData[selectedUserId].firstName} ${usersData[selectedUserId].lastName}`
              : "Просмотр и управление бронированиями пользователей"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-text">Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
              placeholder={
                searchParams.get("userId") ? "Модель автомобиля, статус..." : "Имя пользователя, модель автомобиля..."
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text">Пользователь</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
              disabled={searchParams.get("userId") ? true : false}
            >
              <option value="">Все пользователи</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
            >
              <option value="">Все статусы</option>
              <option value="Booked">Забронировано</option>
              <option value="Active">Активно</option>
              <option value="Completed">Завершено</option>
              <option value="Cancelled">Отменено</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text">Дата</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-pink-light hover:bg-pink-secondary text-pink-text px-4 py-2 rounded-md text-sm font-medium"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-xl font-semibold text-pink-text mb-4">Бронирования не найдены</h2>
          <p className="text-pink-text mb-6">Попробуйте изменить параметры фильтрации</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-pink border border-pink-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-border">
              <thead className="bg-pink-light">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    ID бронирования
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    Пользователь
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    Автомобиль
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    Период аренды
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    Статус
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    Стоимость
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider"
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-border">
                {filteredRentals.map((rental) => {
                  const car = carsData[rental.carId];
                  const user = usersData[rental.userId];
                  return (
                    <tr key={rental.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rental.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 mr-2">
                              <div className="h-8 w-8 rounded-full bg-pink-light flex items-center justify-center">
                                {user.avatarUrl ? (
                                  <img
                                    className="h-8 w-8 rounded-full object-cover"
                                    src={user.avatarUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                  />
                                ) : (
                                  <span className="text-pink-primary text-sm font-bold">
                                    {user.firstName[0].toUpperCase()}
                                    {user.lastName[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Пользователь не найден</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {car ? (
                          <div className="flex items-center">
                            {car.imageUrl ? (
                              <div className="flex-shrink-0 h-8 w-8 mr-2">
                                <img
                                  className="h-8 w-8 rounded object-cover"
                                  src={car.imageUrl}
                                  alt={`${car.brand} ${car.model}`}
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-8 w-8 mr-2 bg-gray-200 rounded"></div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {car.brand} {car.model}
                              </div>
                              <div className="text-xs text-gray-500">
                                {car.year}, {car.color}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Автомобиль не найден</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>От: {formatDate(rental.startDateTime)}</div>
                          <div>До: {formatDate(rental.endDateTime)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(rental.status)}`}>
                          {getStatusName(rental.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.totalCost.toLocaleString("ru-RU")} BYN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.status === "Booked" && hasPermission(Permission.CANCEL_BOOKING) && (
                          <button
                            onClick={() => handleCancelRental(rental.id)}
                            disabled={cancellingId === rental.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                          >
                            {cancellingId === rental.id ? "Отмена..." : "Отменить"}
                          </button>
                        )}
                        {hasPermission(Permission.EDIT_BOOKING) && (
                          <button
                            onClick={() => console.log("Редактирование бронирования", rental.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Детали
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-pink border border-pink-border">
        <h3 className="text-lg font-medium text-pink-text mb-4">Статистика бронирований</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-pink-light rounded-lg text-center">
            <div className="text-2xl font-bold text-pink-primary">{rentals.length}</div>
            <div className="text-sm text-pink-text">Всего бронирований</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rentals.filter((rental) => rental.status === "Booked").length}
            </div>
            <div className="text-sm text-blue-800">Забронировано</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {rentals.filter((rental) => rental.status === "Active").length}
            </div>
            <div className="text-sm text-green-800">Активных</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {rentals.filter((rental) => rental.status === "Cancelled").length}
            </div>
            <div className="text-sm text-red-800">Отменено</div>
          </div>
        </div>
      </div>
    </div>
  );
}
