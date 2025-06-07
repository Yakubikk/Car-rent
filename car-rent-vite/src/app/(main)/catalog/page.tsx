import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CarsApi } from "@/api/cars.ts";
import type { Car } from "@/types/car.ts";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

// Типы для фильтров
type TransmissionType = "Любая" | "Механика" | "Автомат" | "Робот" | "Вариатор" | "Полуавтомат";
type FuelType = "Любое" | "Бензин" | "Дизель" | "Газ" | "Гибрид" | "Электро";
type Availability = "Все" | "Доступен";
type SortOrder = "default" | "price-asc" | "price-desc" | "year-asc" | "year-desc" | "name-asc" | "name-desc";

export default function CatalogPage() {
  const { isGuest } = usePermissions();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState({
    transmission: "Любая" as TransmissionType,
    fuelType: "Любое" as FuelType,
    availability: "Все" as Availability,
    maxPricePerDay: "",
    searchQuery: "",
    sortOrder: "default" as SortOrder,
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await CarsApi.getAll();
        setCars(response);
        setFilteredCars(response);
      } catch (error) {
        console.error("Ошибка при загрузке автомобилей:", error);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    let result = [...cars];

    // Применяем фильтры
    if (filters.transmission !== "Любая") {
      const transmissionMap: Record<TransmissionType, string> = {
        Любая: "",
        Механика: "Manual",
        Автомат: "Automatic",
        Робот: "Robot",
        Вариатор: "CVT",
        Полуавтомат: "SemiAutomatic",
      };
      result = result.filter((car) => car.transmission === transmissionMap[filters.transmission]);
    }

    if (filters.fuelType !== "Любое") {
      const fuelTypeMap: Record<FuelType, string> = {
        Любое: "",
        Бензин: "Petrol",
        Дизель: "Diesel",
        Газ: "Gas",
        Гибрид: "Hybrid",
        Электро: "Electric",
      };
      result = result.filter((car) => car.fuelType === fuelTypeMap[filters.fuelType]);
    }

    if (filters.maxPricePerDay) {
      result = result.filter((car) => car.pricePerDay <= Number(filters.maxPricePerDay));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (car) => car.brand.toLowerCase().includes(query) || car.model.toLowerCase().includes(query)
      );
    }

    if (filters.availability === "Доступен") {
      result = result.filter((car) => car.isAvailable);
    }

    // Применяем сортировку
    result = sortCars(result, filters.sortOrder);

    setFilteredCars(result);
  }, [filters, cars]);

  const sortCars = (cars: Car[], sortOrder: SortOrder): Car[] => {
    const sorted = [...cars];

    switch (sortOrder) {
      case "price-asc":
        return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
      case "price-desc":
        return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
      case "year-asc":
        return sorted.sort((a, b) => a.year - b.year);
      case "year-desc":
        return sorted.sort((a, b) => b.year - a.year);
      case "name-asc":
        return sorted.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
      case "name-desc":
        return sorted.sort((a, b) => `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`));
      default:
        return sorted;
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteCar = async (carId: string, carName: string) => {
    const confirmDelete = () =>
      new Promise((resolve) => {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">Удаление автомобиля</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Вы уверены, что хотите удалить {carName}? Это действие нельзя отменить.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(false);
                  }}
                  className="cursor-pointer w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    try {
                      await CarsApi.deleteCar(carId);
                      setCars((prev) => prev.filter((c) => c.id !== carId));
                      setFilteredCars((prev) => prev.filter((c) => c.id !== carId));
                      toast.success(`Автомобиль ${carName} удален`);
                      toast.dismiss(t.id);
                      resolve(true);
                    } catch (error) {
                      toast.error(((error as AxiosError).response?.data as string) || "Ошибка при удалении автомобиля");
                      toast.dismiss(t.id);
                      resolve(false);
                    }
                  }}
                  className="cursor-pointer w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Удалить
                </button>
              </div>
            </div>
          ),
          {
            duration: Infinity,
          }
        );
      });

    await confirmDelete();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-text">Каталог автомобилей</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-pink-text">Выберите автомобиль для аренды</p>
        </div>

        <PermissionGate permissions={[Permission.CREATE_CAR]}>
          <Link
            to="/cars/add"
            className="bg-pink-primary hover:bg-pink-hover px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
          >
            <span className="text-white">Добавить автомобиль</span>
          </Link>
        </PermissionGate>
      </div>

      {isGuest() && (
        <div className="mt-4 sm:mt-6 bg-pink-light border border-pink-border rounded-lg p-4 sm:p-6 mb-2">
          <h3 className="text-base sm:text-lg font-medium text-pink-text mb-2">Хотите забронировать автомобиль?</h3>
          <p className="text-sm sm:text-base text-pink-dark mb-3 sm:mb-4">
            Дожтитесь, пока менеджер подтвердит вашу регистрацию, или войдите в систему, если у вас уже есть
            подтверждённый аккаунт.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 border text-xs sm:text-sm font-medium rounded-md hover:border-pink-primary text-pink-text bg-pink-light hover:bg-pink-dark transition-colors"
          >
            Войти
          </Link>
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-pink border border-pink-border mb-4 sm:mb-6">
        <h3 className="text-lg font-medium text-pink-text mb-3 sm:mb-4">Фильтры</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-text mb-1">Поиск</label>
            <input
              type="text"
              name="searchQuery"
              placeholder="Марка или модель"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary text-sm"
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text mb-1">Коробка передач</label>
            <select
              name="transmission"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary text-sm"
              onChange={handleFilterChange}
              value={filters.transmission}
            >
              <option>Любая</option>
              <option>Механика</option>
              <option>Автомат</option>
              <option>Робот</option>
              <option>Вариатор</option>
              <option>Полуавтомат</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text mb-1">Тип топлива</label>
            <select
              name="fuelType"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary text-sm"
              onChange={handleFilterChange}
              value={filters.fuelType}
            >
              <option>Любое</option>
              <option>Бензин</option>
              <option>Дизель</option>
              <option>Газ</option>
              <option>Гибрид</option>
              <option>Электро</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text mb-1">Макс. цена в день (BYN)</label>
            <input
              type="number"
              name="maxPricePerDay"
              placeholder="Введите цену"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary text-sm"
              onChange={handleFilterChange}
              value={filters.maxPricePerDay}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-text mb-1">Сортировка</label>
            <select
              name="sortOrder"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring-pink-primary text-sm"
              onChange={handleFilterChange}
              value={filters.sortOrder}
            >
              <option value="default">По умолчанию</option>
              <option value="price-asc">Цена (по возрастанию)</option>
              <option value="price-desc">Цена (по убыванию)</option>
              <option value="year-asc">Год выпуска (старые)</option>
              <option value="year-desc">Год выпуска (новые)</option>
              <option value="name-asc">Название (А-Я)</option>
              <option value="name-desc">Название (Я-А)</option>
            </select>
          </div>

          <button
            onClick={() =>
              setFilters({
                transmission: "Любая",
                fuelType: "Любое",
                availability: "Все",
                maxPricePerDay: "",
                searchQuery: "",
                sortOrder: "default",
              })
            }
            className="w-full bg-pink-light hover:bg-pink-secondary text-pink-text px-3 py-2 rounded text-sm cursor-pointer"
          >
            Сбросить фильтры
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, availability: filters.availability === "Все" ? "Доступен" : "Все" }))
            }
            className="w-full bg-pink-primary hover:bg-pink-hover text-white px-3 py-2 rounded text-sm cursor-pointer"
          >
            {filters.availability === "Все" ? "Показать доступные" : "Показать все"}
          </button>
        </div>
      </div>

      {filteredCars.length === 0 && cars.length > 0 ? (
        <div className="bg-white rounded-lg shadow-pink border border-pink-border p-6 text-center">
          <p className="text-pink-text">По вашему запросу автомобилей не найдено</p>
          <button
            onClick={() =>
              setFilters({
                transmission: "Любая",
                fuelType: "Любое",
                availability: "Все",
                maxPricePerDay: "",
                searchQuery: "",
                sortOrder: "default",
              })
            }
            className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Показать все автомобили
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center">
                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" />
              </div>
              <div className="py-4 px-2 sm:py-6 sm:px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{car.year} год</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      car.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {car.isAvailable ? "Доступен" : "Занят"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-pink-text">Коробка</p>
                    <p className="font-medium">
                      {car.transmission === "Manual" && "Механика"}
                      {car.transmission === "Automatic" && "Автомат"}
                      {car.transmission === "SemiAutomatic" && "Полуавтомат"}
                      {car.transmission === "CVT" && "Вариатор"}
                      {car.transmission === "Robot" && "Робот"}
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-text">Топливо</p>
                    <p className="font-medium">
                      {car.fuelType === "Petrol" && "Бензин"}
                      {car.fuelType === "Diesel" && "Дизель"}
                      {car.fuelType === "Gas" && "Газ"}
                      {car.fuelType === "Hybrid" && "Гибрид"}
                      {car.fuelType === "Electric" && "Электро"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-pink-text">Сутки / Час</p>
                    <p className="font-bold text-pink-primary">
                      {car.pricePerDay.toLocaleString("ru-RU")} / {car.pricePerHour.toLocaleString("ru-RU")} BYN
                    </p>
                  </div>

                  {isGuest() ? (
                    <span className="text-xs text-pink-text">Войдите для брони</span>
                  ) : (
                    <PermissionGate permissions={[Permission.CREATE_BOOKING]}>
                      {car.isAvailable ? (
                        <Link
                          to={`/booking/new?carId=${car.id}`}
                          className="bg-pink-primary hover:bg-pink-hover px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm"
                        >
                          <span className="text-white">Забронировать</span>
                        </Link>
                      ) : (
                        <span className="bg-gray-400 text-white px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm cursor-not-allowed">
                          Недоступен
                        </span>
                      )}
                    </PermissionGate>
                  )}
                </div>

                <PermissionGate permissions={[Permission.EDIT_CAR]}>
                  <div className="mt-3 flex space-x-2 border-t border-pink-border pt-3">
                    <Link
                      to={`/cars/edit/${car.id}`}
                      className="flex-1 bg-pink-light hover:bg-pink-secondary text-pink-text px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm text-center"
                    >
                      Редактировать
                    </Link>
                    <PermissionGate permissions={[Permission.DELETE_CAR]}>
                      <button
                        onClick={async () => await handleDeleteCar(car.id, `${car.brand} ${car.model}`)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm"
                      >
                        Удалить
                      </button>
                    </PermissionGate>
                  </div>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
