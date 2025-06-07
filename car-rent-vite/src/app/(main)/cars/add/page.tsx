import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarsApi } from "@/api/cars.ts";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import type { Car } from "@/types/car.ts";

export default function AddCarPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Состояние формы
  const [car, setCar] = useState<Partial<Car>>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    color: "",
    pricePerHour: 0,
    pricePerDay: 0,
    isAvailable: true,
    imageUrl: "",
    description: "",
    fuelType: "Petrol",
    transmission: "Manual"
  });

  // Проверка разрешений
  if (!hasPermission(Permission.CREATE_CAR)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
          <h1 className="text-2xl font-bold text-pink-text mb-4">Доступ запрещен</h1>
          <p className="text-pink-text mb-4">У вас нет разрешения на добавление автомобилей.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Обработка числовых полей
    if (type === "number") {
      setCar((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
    } 
    // Обработка чекбоксов
    else if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setCar((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } 
    // Обработка текстовых полей
    else {
      setCar((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    if (!car.brand || !car.model || !car.licensePlate) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Добавляем id, так как API ожидает полный объект Car
      const newCar = {
        ...car,
        id: crypto.randomUUID(), // Временный ID для отправки, сервер заменит его
      } as Car;
      
      await CarsApi.postCar(newCar);
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/catalog");
      }, 2000);
    } catch (error) {
      console.error("Ошибка при добавлении автомобиля:", error);
      setError("Не удалось добавить автомобиль. Пожалуйста, попробуйте снова позже.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-2xl font-bold text-pink-text mb-4">Автомобиль успешно добавлен!</h2>
          <p className="mb-4 text-pink-text">Вы будете перенаправлены на страницу каталога через несколько секунд.</p>
          <div className="animate-pulse">
            <div className="h-6 w-24 mx-auto bg-pink-light rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-text">Добавление нового автомобиля</h1>
        <p className="text-sm text-pink-text mt-1">Заполните форму для добавления нового автомобиля в каталог</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div>
            <h2 className="text-lg font-medium text-pink-text mb-4">Основная информация</h2>
            
            <div className="mb-4">
              <label htmlFor="brand" className="block text-sm font-medium text-pink-text mb-1">
                Марка *
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.brand}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="model" className="block text-sm font-medium text-pink-text mb-1">
                Модель *
              </label>
              <input
                type="text"
                id="model"
                name="model"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="year" className="block text-sm font-medium text-pink-text mb-1">
                Год выпуска
              </label>
              <input
                type="number"
                id="year"
                name="year"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.year}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="licensePlate" className="block text-sm font-medium text-pink-text mb-1">
                Номерной знак *
              </label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.licensePlate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="color" className="block text-sm font-medium text-pink-text mb-1">
                Цвет
              </label>
              <input
                type="text"
                id="color"
                name="color"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.color}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Техническая информация */}
          <div>
            <h2 className="text-lg font-medium text-pink-text mb-4">Техническая информация</h2>
            
            <div className="mb-4">
              <label htmlFor="fuelType" className="block text-sm font-medium text-pink-text mb-1">
                Тип топлива
              </label>
              <select
                id="fuelType"
                name="fuelType"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.fuelType}
                onChange={handleChange}
              >
                <option value="Petrol">Бензин</option>
                <option value="Diesel">Дизель</option>
                <option value="Gas">Газ</option>
                <option value="Hybrid">Гибрид</option>
                <option value="Electric">Электро</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="transmission" className="block text-sm font-medium text-pink-text mb-1">
                Коробка передач
              </label>
              <select
                id="transmission"
                name="transmission"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.transmission}
                onChange={handleChange}
              >
                <option value="Manual">Механика</option>
                <option value="Automatic">Автомат</option>
                <option value="SemiAutomatic">Полуавтомат</option>
                <option value="CVT">Вариатор</option>
                <option value="Robot">Робот</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-pink-text mb-1">
                Стоимость в час (BYN)
              </label>
              <input
                type="number"
                id="pricePerHour"
                name="pricePerHour"
                min="0"
                step="0.01"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.pricePerHour}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="pricePerDay" className="block text-sm font-medium text-pink-text mb-1">
                Стоимость в день (BYN)
              </label>
              <input
                type="number"
                id="pricePerDay"
                name="pricePerDay"
                min="0"
                step="0.01"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={car.pricePerDay}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={car.isAvailable}
                  onChange={handleChange}
                  className="rounded text-pink-primary focus:ring-pink-primary"
                />
                <span className="ml-2 text-sm text-pink-text">Доступен для бронирования</span>
              </label>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-pink-text mb-4">Дополнительная информация</h2>
          
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-pink-text mb-1">
              URL изображения
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
              value={car.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/car-image.jpg"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-pink-text mb-1">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
              value={car.description}
              onChange={handleChange}
              placeholder="Подробное описание автомобиля"
            ></textarea>
          </div>
        </div>

        {/* Предпросмотр изображения */}
        {car.imageUrl && (
          <div className="mt-4 mb-6">
            <h3 className="text-sm font-medium text-pink-text mb-2">Предпросмотр изображения</h3>
            <div className="border border-pink-border rounded-md overflow-hidden h-48 bg-gray-100">
              <img
                src={car.imageUrl}
                alt={`${car.brand} ${car.model}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Ошибка+загрузки+изображения";
                }}
              />
            </div>
          </div>
        )}

        {/* Кнопки формы */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-pink-border text-pink-text rounded-md hover:bg-pink-light"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md disabled:opacity-50"
          >
            {submitting ? "Добавление..." : "Добавить автомобиль"}
          </button>
        </div>
      </form>
    </div>
  );
}
