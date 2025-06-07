import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UsersApi, type UpdateUserData } from "@/api/users.ts";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, Role } from "@/types/rbac";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Состояние формы
  const [userData, setUserData] = useState<UpdateUserData>({
    id: id || "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    roles: [Role.USER],
    isActive: true
  });

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    async function loadUser() {
      if (!id) return;
      
      try {
        setLoading(true);
        const user = await UsersApi.getUserById(id);
        
        if (user) {
          setUserData({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber || "",
            roles: user.roles,
            isActive: user.isActive
          });
        } else {
          setError("Пользователь не найден");
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных пользователя:", err);
        setError("Не удалось загрузить данные пользователя. Пожалуйста, попробуйте снова позже.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id]);

  // Проверка разрешений
  if (!hasPermission(Permission.EDIT_USER)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
          <h1 className="text-2xl font-bold text-pink-text mb-4">Доступ запрещен</h1>
          <p className="text-pink-text mb-4">У вас нет разрешения на редактирование пользователей.</p>
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

  // Отображение загрузки
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center">
        <LoadingSpinner />
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

  // Получение текущей основной роли пользователя
  const getCurrentRole = (roles: string[]): string => {
    if (roles.includes(Role.ADMIN)) return Role.ADMIN;
    if (roles.includes(Role.MANAGER)) return Role.MANAGER;
    if (roles.includes(Role.USER)) return Role.USER;
    return Role.GUEST;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    if (!userData.firstName || !userData.lastName) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await UsersApi.updateUser(userData);
      
      setSuccess(true);
      toast.success("Данные пользователя успешно обновлены!");
      
      setTimeout(() => {
        navigate("/users");
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Ошибка при обновлении пользователя:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Не удалось обновить данные пользователя. Пожалуйста, попробуйте снова позже.");
      }
      toast.error(error.response?.data?.message || "Ошибка при обновлении пользователя");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border text-center">
          <h2 className="text-2xl font-bold text-pink-text mb-4">Данные пользователя успешно обновлены!</h2>
          <p className="text-pink-text mb-4">Вы будете перенаправлены на страницу пользователей.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
        <h1 className="text-2xl font-bold text-pink-text mb-6">Редактирование пользователя</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md text-red-800">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                value={getCurrentRole(userData.roles)}
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
              {submitting ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
