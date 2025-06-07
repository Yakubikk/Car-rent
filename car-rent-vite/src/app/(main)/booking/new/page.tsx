import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CarsApi } from "@/api/cars.ts";
import { RentalsApi } from "@/api/rentals.ts";
import type { Car } from "@/types/car.ts";
import { format, addHours, addDays, differenceInMinutes, addMinutes } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";

type RentalType = "hourly" | "daily";
type PaymentMethod = "card" | "cash";

// Вспомогательная функция для склонения единиц времени
const getTimeUnit = (value: number, units: [string, string, string]) => {
  const lastDigit = value % 10;
  const lastTwoDigits = value % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return units[2];
  }

  return lastDigit === 1 ? units[0] : lastDigit >= 2 && lastDigit <= 4 ? units[1] : units[2];
};

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const carId = searchParams.get("carId");
  const { user } = usePermissions();

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [rentalType, setRentalType] = useState<RentalType>("hourly");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [minutesReminder, setMinutesReminder] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Мемоизированная функция для загрузки автомобилей
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const availableCars = await CarsApi.getAvailableCars();
      setCars(availableCars);

      if (carId) {
        const car = availableCars.find((c) => c.id === carId);
        setSelectedCar(car || null);
      }

      setLoading(false);
    } catch {
      setError("Не удалось загрузить список автомобилей");
      setLoading(false);
    }
  }, [carId]);

  // Инициализация даты и времени
  const initDateTime = useCallback(() => {
    const now = new Date();
    const formattedDate = format(now, "yyyy-MM-dd");
    const formattedTime = format(addMinutes(now, 1), "HH:mm");

    setStartDate(formattedDate);
    setStartTime(formattedTime);

    if (rentalType === "hourly") {
      setEndDate(formattedDate);
      setEndTime(format(addMinutes(addHours(now, 3), 1), "HH:mm"));
    } else {
      setEndDate(format(addDays(now, 1), "yyyy-MM-dd"));
      setStartTime("12:00");
      setEndTime("12:00");
    }
  }, [rentalType]);

  // Расчет продолжительности и стоимости
  const calculateDurationAndPrice = useCallback(() => {
    if (!startDate || !endDate || !selectedCar) return;

    try {
      setError(null);

      if (rentalType === "hourly") {
        if (!startTime || !endTime) return;

        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        if (start < new Date()) {
          setError("Время начала бронирования должно быть позже текущего времени");
          setDuration(0);
          setTotalPrice(0);
          return;
        }

        if (end <= start) {
          setError("Время окончания должно быть позже времени начала");
          setDuration(0);
          setTotalPrice(0);
          return;
        }

        const minutesDiff = differenceInMinutes(end, start);
        const exactHours = Math.max(1, minutesDiff / 60);
        setDuration(Math.floor(exactHours));
        setMinutesReminder(minutesDiff % 60);
        setTotalPrice(exactHours * selectedCar.pricePerHour);
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
          setError("Дата окончания должна быть позже даты начала");
          setDuration(0);
          setTotalPrice(0);
          return;
        }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const days = Math.max(1, diffDays);

        setDuration(days);
        setMinutesReminder(0);
        setTotalPrice(days * selectedCar.pricePerDay);
      }
    } catch {
      setError("Ошибка при расчете стоимости");
    }
  }, [startDate, startTime, endDate, endTime, selectedCar, rentalType]);

  // Эффект для загрузки автомобилей
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Эффект для инициализации даты/времени
  useEffect(() => {
    initDateTime();
  }, [initDateTime]);

  // Эффект для расчета продолжительности
  useEffect(() => {
    calculateDurationAndPrice();
  }, [calculateDurationAndPrice]);

  const handleCarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const carId = e.target.value;
    const car = cars.find((c) => c.id === carId) || null;
    setSelectedCar(car);
  };

  const handleRentalTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRentalType(e.target.value as RentalType);
  };

  // Мемоизированная информация о бронировании
  const bookingInfo = useMemo(() => {
    if (!selectedCar || duration <= 0) return null;

    const timeUnits: [string, string, string] =
      rentalType === "hourly" ? ["час", "часа", "часов"] : ["день", "дня", "дней"];

    const durationText =
      rentalType === "hourly"
        ? `${Math.floor(duration)} ${getTimeUnit(Math.floor(duration), timeUnits)}${
            minutesReminder > 0 ? ` ${minutesReminder} мин.` : ""
          }`
        : `${duration} ${getTimeUnit(duration, timeUnits)}`;

    return {
      type: rentalType === "hourly" ? "Почасовая" : "Дневная",
      duration: durationText,
      price: totalPrice.toFixed(2),
    };
  }, [selectedCar, duration, minutesReminder, rentalType, totalPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Для бронирования необходимо войти в систему");
      return;
    }

    if (!user.isActive) {
      setError("Ваша учетная запись неактивна. Пожалуйста, свяжитесь с администратором.");
      return;
    }

    if (!selectedCar) {
      setError("Выберите автомобиль для бронирования");
      return;
    }

    if (!startDate || !endDate || (rentalType === "hourly" && (!startTime || !endTime))) {
      setError("Заполните все обязательные поля");
      return;
    }

    const startDateTime = rentalType === "hourly" ? `${startDate}T${startTime}:00` : `${startDate}T12:00:00`;

    const endDateTime = rentalType === "hourly" ? `${endDate}T${endTime}:00` : `${endDate}T12:00:00`;

    try {
      setSubmitting(true);
      setError(null);

      const response = await RentalsApi.postRental({
        carId: selectedCar.id,
        startDateTime,
        endDateTime,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/booking/confirmation?id=${response.id}`);
      }, 2000);
    } catch {
      setError("Не удалось создать бронирование. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-pink-text">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-2xl font-bold text-pink-text mb-4">Бронирование успешно создано!</h2>
          <p className="mb-4 text-pink-text">
            Вы будете перенаправлены на страницу подтверждения через несколько секунд.
          </p>
          <div className="animate-pulse">
            <div className="h-6 w-24 mx-auto bg-pink-light rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-text">Новое бронирование</h1>
        <p className="text-sm text-pink-text mt-1">Заполните форму для создания бронирования</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
        {/* Выбор автомобиля */}
        <div className="mb-6">
          <label htmlFor="car" className="block text-sm font-medium text-pink-text mb-2">
            Автомобиль
          </label>
          <select
            id="car"
            className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
            value={selectedCar?.id || ""}
            onChange={handleCarSelect}
            disabled={!!carId || cars.length === 0}
            required
          >
            <option value="">Выберите автомобиль</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.brand} {car.model} ({car.year}) - {car.pricePerHour} BYN/час | {car.pricePerDay} BYN/день
              </option>
            ))}
          </select>
        </div>

        {/* Информация о выбранном автомобиле */}
        {selectedCar && (
          <div className="mb-6 p-4 bg-pink-light rounded-md">
            <h3 className="text-lg font-medium text-pink-text mb-2">
              {selectedCar.brand} {selectedCar.model}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-pink-text">Год выпуска: {selectedCar.year}</p>
                <p className="text-sm text-pink-text">Цвет: {selectedCar.color}</p>
                <p className="text-sm text-pink-text">
                  Топливо:{" "}
                  {
                    {
                      Petrol: "Бензин",
                      Diesel: "Дизель",
                      Gas: "Газ",
                      Hybrid: "Гибрид",
                      Electric: "Электро",
                    }[selectedCar.fuelType]
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-pink-text">
                  Трансмиссия:{" "}
                  {
                    {
                      Manual: "Механика",
                      Automatic: "Автомат",
                      SemiAutomatic: "Полуавтомат",
                      CVT: "Вариатор",
                      Robot: "Робот",
                    }[selectedCar.transmission]
                  }
                </p>
                <p className="text-sm text-pink-text">Стоимость в час: {selectedCar.pricePerHour} BYN</p>
                <p className="text-sm text-pink-text">Стоимость в день: {selectedCar.pricePerDay} BYN</p>
              </div>
            </div>
          </div>
        )}

        {/* Тип аренды */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-pink-text mb-2">Тип аренды</span>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="text-pink-primary focus:ring-pink-primary"
                name="rentalType"
                value="hourly"
                checked={rentalType === "hourly"}
                onChange={handleRentalTypeChange}
              />
              <span className="ml-2 text-pink-text">Почасовая</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="text-pink-primary focus:ring-pink-primary"
                name="rentalType"
                value="daily"
                checked={rentalType === "daily"}
                onChange={handleRentalTypeChange}
              />
              <span className="ml-2 text-pink-text">Дневная</span>
            </label>
          </div>
        </div>

        {/* Дата и время начала */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-pink-text mb-2">
              Дата начала
            </label>
            <input
              type="date"
              id="startDate"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>
          {rentalType === "hourly" && (
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-pink-text mb-2">
                Время начала
              </label>
              <input
                type="time"
                id="startTime"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Дата и время окончания */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-pink-text mb-2">
              Дата окончания
            </label>
            <input
              type="date"
              id="endDate"
              className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              required
            />
          </div>
          {rentalType === "hourly" && (
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-pink-text mb-2">
                Время окончания
              </label>
              <input
                type="time"
                id="endTime"
                className="w-full rounded-md border-pink-border shadow-sm focus:border-pink-primary focus:ring focus:ring-pink-primary focus:ring-opacity-50"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Информация о стоимости */}
        {bookingInfo && (
          <div className="mb-6 p-4 bg-pink-light rounded-md">
            <h3 className="text-lg font-medium text-pink-text mb-2">Информация о бронировании</h3>
            <p className="text-sm text-pink-text">Тип аренды: {bookingInfo.type}</p>
            <p className="text-sm text-pink-text">Продолжительность: {bookingInfo.duration}</p>
            <p className="text-sm text-pink-text mb-2">Стоимость: {bookingInfo.price} BYN</p>
          </div>
        )}

        {/* Способ оплаты */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-pink-text mb-2">Способ оплаты</span>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="text-pink-primary focus:ring-pink-primary"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              />
              <span className="ml-2 text-pink-text">Карта</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="text-pink-primary focus:ring-pink-primary"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              />
              <span className="ml-2 text-pink-text">Наличные</span>
            </label>
          </div>
        </div>

        {/* Кнопки формы */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-pink-border text-pink-text rounded-md hover:bg-pink-light"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedCar || duration === 0}
            className="px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md disabled:opacity-50"
          >
            {submitting ? "Отправка..." : "Забронировать"}
          </button>
        </div>
      </form>
    </div>
  );
}
