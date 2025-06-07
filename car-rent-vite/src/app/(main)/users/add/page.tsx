import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersApi, type CreateUserData } from "@/api/users.ts";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, Role } from "@/types/rbac";
import toast from "react-hot-toast";

export default function AddUserPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Состояние формы
  const [userData, setUserData] = useState<CreateUserData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    roles: [Role.USER],
    isActive: true
  });

  // Проверка разрешений
  if (!hasPermission(Permission.CREATE_USER)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
          <h1 className="text-2xl font-bold text-pink-text mb-4">Доступ запрещен</h1>
          <p className="text-pink-text mb-4">У вас нет разрешения на добавление пользователей.</p>
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setUserData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Обработка изменения ролей
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === Role.ADMIN) {
      setUserData((prev) => ({
        ...prev,
        roles: [Role.ADMIN, Role.MANAGER]
      }));
    }
    else if (value === Role.MANAGER) {
      setUserData((prev) => ({
        ...prev,
        roles: [Role.MANAGER]
      }));
    }
    else if (value === Role.USER) {
      setUserData((prev) => ({
        ...prev,
        roles: [Role.USER]
      }));
    }
    else {
      setUserData((prev) => ({
        ...prev,
        roles: [Role.GUEST]
      }));
    }
  };

  // Валидация email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    // Проверка email
    if (!validateEmail(userData.email)) {
      setError("Пожалуйста, введите корректный email.");
      return;
    }

    // Проверка пароля (минимум 8 символов)
    if (userData.password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await UsersApi.createUser(userData);
      
      setSuccess(true);
      toast.success("Пользователь успешно создан!");
      
      setTimeout(() => {
        navigate("/users");
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Ошибка при создании пользователя:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Не удалось создать пользователя. Пожалуйста, попробуйте снова позже.");
      }
      toast.error(error.response?.data?.message || "Ошибка при создании пользователя");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-2xl font-bold text-pink-text mb-4">Пользователь успешно создан!</h2>
          <p className="text-pink-text mb-4">Вы будете перенаправлены на страницу пользователей.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
        <h1 className="text-2xl font-bold text-pink-text mb-6">Добавление нового пользователя</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md text-red-800">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pink-text mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pink-text mb-1">
                Пароль <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Минимум 8 символов</p>
            </div>
            
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-pink-text mb-1">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-pink-text mb-1">
                Фамилия <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-pink-text mb-1">
                Номер телефона
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-pink-text mb-1">
                Роль <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                onChange={handleRoleChange}
                required
                className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
              >
                <option value={Role.USER}>Пользователь</option>
                <option value={Role.MANAGER}>Менеджер</option>
                <option value={Role.ADMIN}>Администратор</option>
                <option value={Role.GUEST}>Гость</option>
              </select>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={userData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-pink-primary focus:ring-pink-primary border-pink-border rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-pink-text">
                Активный пользователь
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md disabled:opacity-50"
            >
              {submitting ? "Сохранение..." : "Создать пользователя"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
