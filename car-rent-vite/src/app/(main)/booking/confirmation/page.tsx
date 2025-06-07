import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RentalsApi } from "@/api/rentals.ts";
import { CarsApi } from "@/api/cars.ts";
import type { Rental, Car } from "@/types/car.ts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rentalId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState<Rental | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRentalDetails = async () => {
      if (!rentalId) {
        setError("Не указан идентификатор бронирования");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const rentalData = await RentalsApi.getRentalById(rentalId);
        setRental(rentalData);

        // Получаем информацию об автомобиле
        const carData = await CarsApi.getCarById(rentalData.carId);
        if (carData) {
          setCar(carData);
        }

        setLoading(false);
      } catch {
        setError("Не удалось загрузить данные о бронировании");
        setLoading(false);
      }
    };

    fetchRentalDetails();
  }, [rentalId]);

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy 'в' HH:mm", { locale: ru });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-pink-text">Загрузка информации о бронировании...</p>
        </div>
      </div>
    );
  }

  if (error || !rental || !car) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-2xl font-bold text-pink-text mb-4">Ошибка</h2>
          <p className="mb-4 text-pink-text">{error || "Не удалось найти информацию о бронировании"}</p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-pink-primary hover:bg-pink-hover text-white px-4 py-2 rounded-md"
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-text">Бронирование подтверждено</h1>
        <p className="text-sm text-pink-text mt-1">Спасибо за бронирование! Ваша заявка принята и обрабатывается.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-pink-text">Номер бронирования</h2>
          <span className="text-pink-primary font-bold">{rental.id}</span>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium text-pink-text mb-2">Статус</h3>
          <div className="inline-flex items-center px-3 py-1 bg-pink-light text-pink-dark rounded-full">
            {rental.status === "Booked" && "Забронировано"}
            {rental.status === "Active" && "Активно"}
            {rental.status === "Completed" && "Завершено"}
            {rental.status === "Cancelled" && "Отменено"}
          </div>
        </div>

        <div className="border-t border-pink-border pt-4 mb-4">
          <h3 className="text-md font-medium text-pink-text mb-2">Информация об автомобиле</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3">
              {car.imageUrl && (
                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-auto rounded-md" />
              )}
            </div>
            <div className="sm:w-2/3">
              <h4 className="text-lg font-semibold text-pink-text">
                {car.brand} {car.model} ({car.year})
              </h4>
              <div className="grid grid-cols-2 gap-y-2 mt-2">
                <div>
                  <p className="text-sm text-pink-text">Цвет:</p>
                  <p className="font-medium">{car.color}</p>
                </div>
                <div>
                  <p className="text-sm text-pink-text">Номер:</p>
                  <p className="font-medium">{car.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-pink-text">Трансмиссия:</p>
                  <p className="font-medium">
                    {
                      {
                        Manual: "Механика",
                        Automatic: "Автомат",
                        SemiAutomatic: "Полуавтомат",
                        CVT: "Вариатор",
                        Robot: "Робот",
                      }[car.transmission]
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-pink-text">Топливо:</p>
                  <p className="font-medium">
                    {
                      {
                        Petrol: "Бензин",
                        Diesel: "Дизель",
                        Gas: "Газ",
                        Hybrid: "Гибрид",
                        Electric: "Электро",
                      }[car.fuelType]
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-border pt-4 mb-4">
          <h3 className="text-md font-medium text-pink-text mb-2">Детали бронирования</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-pink-text">Начало аренды:</p>
              <p className="font-medium">{formatDateTime(rental.startDateTime)}</p>
            </div>
            <div>
              <p className="text-sm text-pink-text">Конец аренды:</p>
              <p className="font-medium">{formatDateTime(rental.endDateTime)}</p>
            </div>
            <div>
              <p className="text-sm text-pink-text">Общая стоимость:</p>
              <p className="font-medium text-lg text-pink-primary">{rental.totalCost} BYN</p>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-border pt-4">
          <h3 className="text-md font-medium text-pink-text mb-2">Что дальше?</h3>
          <ul className="list-disc list-inside space-y-1 text-pink-text">
            <li>Приезжайте в указанное время для получения автомобиля</li>
            <li>Не забудьте взять с собой водительское удостоверение и паспорт</li>
            <li>В случае возникновения вопросов, обратитесь к менеджеру</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate("/catalog")}
          className="px-4 py-2 border border-pink-border text-pink-text rounded-md hover:bg-pink-light"
        >
          Вернуться в каталог
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-pink-light text-pink-text rounded-md hover:bg-pink-secondary"
        >
          Распечатать
        </button>
      </div>
    </div>
  );
}
