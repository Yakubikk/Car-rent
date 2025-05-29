import { approveRegistration, rejectRegistration } from "@/api/auth";
import { UsersApi } from "@/api/users";
import type { User } from "@/types/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function NewRegistrationPage() {
  const { email } = useParams();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) {
          console.error("Email is required to fetch user");
          setErrorMessage("Email не указан в URL");
          setIsLoading(false);
          return;
        }

        // Decode the email from URL format
        const decodedEmail = decodeURIComponent(email);
        console.log("Fetching user with email:", decodedEmail);

        const fetchedUser = await UsersApi.getUserByEmail(decodedEmail);
        if (fetchedUser) {
          setUser(fetchedUser);
          setErrorMessage(null);
        } else {
          setErrorMessage("API вернул undefined или null");
          setUser(undefined);
        }
        setIsLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Ошибка при получении пользователя:", error);
        let message = "Неизвестная ошибка";
        if (error.response) {
          message = `Ошибка API: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else if (error.message) {
          message = `Ошибка: ${error.message}`;
        }
        setErrorMessage(message);
        setUser(undefined);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [email]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Пользователь не найден</h2>
          <p className="mb-4 text-red-500">{errorMessage || "Возможно проблема с передачей email или API-запросом."}</p>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p>
              <strong>Email из URL:</strong> {email}
            </p>
            <p>
              <strong>Декодированный email:</strong> {email ? decodeURIComponent(email) : "нет"}
            </p>
            <p>
              <strong>API URL:</strong> {import.meta.env.VITE_API_URL}/api/users/by-email?email=
              {email ? decodeURIComponent(email) : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      await approveRegistration(user.email);
      toast.success(`Регистрация пользователя ${user.email} подтверждена`);
      navigate(-1);
    } catch (error) {
      toast.error("Ошибка подтверждения регистрации");
      console.error("Ошибка при подтверждении регистрации:", error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectRegistration(user.email);
      toast.success(`Регистрация пользователя ${user.email} отклонена`);
      navigate(-1);
    } catch (error) {
      toast.error("Ошибка отклонения регистрации");
      console.error("Ошибка при отклонении регистрации:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Регистрация пользователя</h2>
        <p className="mb-2">Email: {user.email}</p>
        <p className="mb-2">Имя: {user.firstName}</p>
        <p className="mb-2">Фамилия: {user.lastName}</p>
        <p className="mb-2">Номер паспорта: {user.passportNumber}</p>
        <p className="mb-2">Телефон: {user.phoneNumber}</p>
        <p className="mb-2">Адрес: {user.address}</p>
        <p className="mb-2">Дата рождения: {new Date(user.birthDate).toLocaleDateString()}</p>
        <p className="mb-2">Номер водительских прав: {user.driverLicense}</p>
        <p className="mb-2">
          Дата выдачи водительских прав: {new Date(user.driverLicenseIssueDate).toLocaleDateString()}
        </p>
        <div className="flex gap-2 mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
            onClick={async () => {
              await handleApprove();
            }}
          >
            Подтвердить
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
            onClick={async () => {
              await handleReject();
            }}
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
};
