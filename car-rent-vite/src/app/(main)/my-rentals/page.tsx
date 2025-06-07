import { useState, useEffect } from "react";
import { RentalsApi } from "@/api/rentals.ts";
import { CarsApi } from "@/api/cars.ts";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import type { Rental, Car } from "@/types/car.ts";

export default function MyRentalsPage() {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [carsData, setCarsData] = useState<Record<string, Car>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Загрузка бронирований пользователя
  useEffect(() => {
    async function loadRentals() {
      try {
        setLoading(true);
        const rentalsData = await RentalsApi.getMy();
        setRentals(rentalsData);

        // Собираем уникальные id автомобилей
        const carIds = [...new Set(rentalsData.map(rental => rental.carId))];
        
        // Загружаем данные по каждому автомобилю
        const carsInfo: Record<string, Car> = {};
        for (const carId of carIds) {
          const carData = await CarsApi.getCarById(carId);
          if (carData) {
            carsInfo[carId] = carData;
          }
        }
        
        setCarsData(carsInfo);
      } catch (err) {
        console.error("Ошибка при загрузке бронирований:", err);
        setError("Не удалось загрузить данные о бронированиях. Пожалуйста, попробуйте снова позже.");
      } finally {
        setLoading(false);
      }
    }

    loadRentals();
  }, []);

  // Проверка разрешений
  if (!hasPermission(Permission.VIEW_OWN_BOOKINGS)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
          <h1 className="text-2xl font-bold text-pink-text mb-4">Доступ запрещен</h1>
          <p className="text-pink-text mb-4">У вас нет разрешения на просмотр своих бронирований.</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  // Отображение загрузки
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Вспомогательная функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Вспомогательная функция для определения статуса бронирования
  const getStatusName = (status: string) => {
    switch (status) {
      case 'Booked':
        return 'Забронировано';
      case 'Active':
        return 'Активно';
      case 'Completed':
        return 'Завершено';
      case 'Cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  // Вспомогательная функция для определения класса статуса
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Расчет оставшегося времени до начала бронирования
  const getTimeRemaining = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Уже началось';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} дн. ${hours} ч.`;
    if (hours > 0) return `${hours} ч. ${minutes} мин.`;
    return `${minutes} мин.`;
  };

  // Функция отмены бронирования
  const handleCancelRental = async (rentalId: string) => {
    if (!window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      return;
    }

    try {
      setCancellingId(rentalId);
      await RentalsApi.cancelRental(rentalId);
      
      // Обновляем список бронирований
      setRentals(prevRentals => 
        prevRentals.map(rental => 
          rental.id === rentalId 
            ? { ...rental, status: 'Cancelled' } 
            : rental
        )
      );
    } catch (err) {
      console.error("Ошибка при отмене бронирования:", err);
      setError("Не удалось отменить бронирование. Пожалуйста, попробуйте снова позже.");
    } finally {
      setCancellingId(null);
    }
  };

  // Функция для повторного бронирования
  const handleRebookCar = (carId: string) => {
    navigate(`/booking/new?carId=${carId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-text">Мои бронирования</h1>
        <p className="text-sm text-pink-text mt-1">Просмотр истории ваших бронирований</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
        </div>
      )}

      {rentals.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-xl font-semibold text-pink-text mb-4">У вас пока нет бронирований</h2>
          <p className="text-pink-text mb-6">Вы можете забронировать автомобиль в нашем каталоге</p>
          <Link
            to="/catalog"
            className="px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md inline-block"
          >
            <span className="text-white">Перейти в каталог</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-pink border border-pink-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-border">
              <thead className="bg-pink-light">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider">
                    Автомобиль
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider">
                    Период аренды
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider">
                    Стоимость
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-text uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-border">
                {rentals.map((rental) => {
                  const car = carsData[rental.carId];
                  return (
                    <tr key={rental.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {car ? (
                          <div className="flex items-center">
                            {car.imageUrl ? (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img className="h-10 w-10 rounded-full object-cover" src={car.imageUrl} alt={`${car.brand} ${car.model}`} />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-200 rounded-full"></div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {car.brand} {car.model}
                              </div>
                              <div className="text-sm text-gray-500">
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
                        {rental.status === 'Booked' && (
                          <div className="text-xs text-pink-text mt-1">
                            Осталось: {getTimeRemaining(rental.startDateTime)}
                          </div>
                        )}
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
                        {rental.status === 'Booked' && hasPermission(Permission.CANCEL_BOOKING) && (
                          <button
                            onClick={() => handleCancelRental(rental.id)}
                            disabled={cancellingId === rental.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === rental.id ? 'Отмена...' : 'Отменить'}
                          </button>
                        )}
                        {(rental.status === 'Completed' || rental.status === 'Cancelled') && (
                          <button
                            onClick={() => handleRebookCar(rental.carId)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Забронировать снова
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
    </div>
  );
}
