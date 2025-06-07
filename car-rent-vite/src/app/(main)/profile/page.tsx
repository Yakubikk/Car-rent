import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UsersApi } from "@/api/users.ts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import type { User } from "@/types/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/stores/auth";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = usePermissions();
  const { fetchUser } = useAuthStore();
  const [currentUser, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSource, setAvatarSource] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const userData = await UsersApi.getUserById(user.id);
        setUserData(userData);
        // Initialize the avatarUrl state with user data, ensuring it's always a string
        if (userData.avatarUrl) {
          setAvatarUrl(userData.avatarUrl);
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных пользователя:", err);
        setError("Не удалось загрузить данные пользователя");
        toast.error("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, navigate]);

  // Обработка выбора файла аватара
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Предпросмотр файла
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Переключаем на режим загрузки файла
      setAvatarSource("file");
    }
  };

  // Обработка ввода URL аватара
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAvatarUrl(value);

    // Если URL непустой, показываем его в предпросмотре
    if (value) {
      setAvatarPreview(value);
      // Переключаем на режим URL
      setAvatarSource("url");
    } else {
      setAvatarPreview(null);
    }
  };

  // Сброс выбора аватара
  const handleResetAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl("");
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setSubmitting(true);
      setError(null);

      let updatedUser: User | undefined;

      // Обработка в зависимости от выбранного способа обновления аватара
      if (avatarSource === "file" && avatarFile) {
        // Загрузка файла
        const formData = new FormData();
        formData.append("file", avatarFile);
        updatedUser = await UsersApi.updateAvatar(currentUser.id, formData);
      } else if (avatarSource === "url" && avatarUrl) {
        // Использование внешнего URL
        updatedUser = await UsersApi.updateAvatarUrl(currentUser.id, avatarUrl);
      }

      if (updatedUser) {
        // Обновляем пользователя в локальном состоянии
        setUserData(updatedUser);

        // Важно обновить также пользователя в глобальном состоянии приложения
        // так как это повлияет на отображение аватара в меню
        if (user) {
          await fetchUser(); // Обновляем данные пользователя
        }

        toast.success("Аватар успешно обновлен");

        // Сбрасываем состояние формы
        handleResetAvatar();

        // Устанавливаем URL аватара (для предотвращения превращения в uncontrolled)
        if (updatedUser.avatarUrl) {
          setAvatarUrl("");
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Ошибка при обновлении аватара:", error);
      setError(error.response?.data?.message || "Не удалось обновить аватар");
      toast.error("Ошибка при обновлении аватара");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
          <h1 className="text-2xl font-bold text-pink-text mb-4">Ошибка</h1>
          <p className="text-pink-text mb-4">Не удалось загрузить профиль пользователя.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-pink-primary hover:bg-pink-hover text-white rounded-md"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-pink border border-pink-border">
        <h1 className="text-2xl font-bold text-pink-text mb-6">Мой профиль</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md text-red-800">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Аватар и форма его изменения */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-40 w-40 rounded-full bg-pink-light flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Предпросмотр аватара" className="h-full w-full object-cover" />
                ) : currentUser.avatarUrl ? (
                  <img
                    src={
                      currentUser.avatarUrl.startsWith("http")
                        ? currentUser.avatarUrl
                        : `${import.meta.env.VITE_API_URL}${currentUser.avatarUrl}`
                    }
                    alt={`${currentUser.firstName[0].toUpperCase()}${currentUser.lastName[0].toUpperCase()}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Если изображение не загрузилось, показываем инициалы
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add("avatar-error");
                    }}
                  />
                ) : (
                  <span className="text-pink-primary text-4xl font-semibold">
                    {currentUser.firstName[0].toUpperCase()}
                    {currentUser.lastName[0].toUpperCase()}
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                      avatarSource === "file"
                        ? "bg-pink-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      setAvatarSource("file");
                      // Reset file preview when switching to file mode
                      if (avatarSource === "url") {
                        setAvatarPreview(null);
                      }
                    }}
                  >
                    Файл
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                      avatarSource === "url"
                        ? "bg-pink-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      setAvatarSource("url");
                      // Clear file input when switching to URL mode
                      if (avatarSource === "file" && fileInputRef.current) {
                        fileInputRef.current.value = "";
                        setAvatarFile(null);
                      }
                    }}
                  >
                    Ссылка
                  </button>
                </div>

                {avatarSource === "file" ? (
                  <div>
                    <label className="block text-sm font-medium text-pink-text mb-1">Загрузите изображение</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-pink-text mb-1">
                      URL изображения
                    </label>
                    <input
                      type="url"
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full p-2 border border-pink-border rounded-md focus:ring-pink-primary focus:border-pink-primary"
                    />
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
                  >
                    Сбросить
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || (!avatarFile && !avatarUrl)}
                    className="flex-1 py-2 px-3 bg-pink-primary hover:bg-pink-hover text-white rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {submitting ? "Сохранение..." : "Обновить аватар"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Информация о пользователе */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-pink-text mb-4">Личная информация</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Имя</label>
                  <p className="text-lg font-medium text-pink-text">{currentUser.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Фамилия</label>
                  <p className="text-lg font-medium text-pink-text">{currentUser.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg font-medium text-pink-text">{currentUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Телефон</label>
                  <p className="text-lg font-medium text-pink-text">{currentUser.phoneNumber || "Не указан"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Дата рождения</label>
                  <p className="text-lg font-medium text-pink-text">
                    {currentUser.birthDate ? new Date(currentUser.birthDate).toLocaleDateString() : "Не указана"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Дата регистрации</label>
                  <p className="text-lg font-medium text-pink-text">
                    {new Date(currentUser.registerDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-pink-text mb-4">Документы</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Номер паспорта</label>
                  <p className="text-lg font-medium text-pink-text">{currentUser.passportNumber || "Не указан"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Водительское удостоверение</label>
                  <p className="text-lg font-medium text-pink-text">{currentUser.driverLicense || "Не указано"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Дата выдачи водительского удостоверения
                  </label>
                  <p className="text-lg font-medium text-pink-text">
                    {currentUser.driverLicenseIssueDate
                      ? new Date(currentUser.driverLicenseIssueDate).toLocaleDateString()
                      : "Не указана"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-pink-text mb-4">Адрес</h2>
              <div>
                <label className="block text-sm font-medium text-gray-500">Полный адрес</label>
                <p className="text-lg font-medium text-pink-text">{currentUser.address || "Не указан"}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-pink-text mb-4">Роли в системе</h2>
              <div className="flex flex-wrap gap-2">
                {currentUser.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-light text-pink-primary"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
