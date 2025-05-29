import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
const baseUrl = import.meta.env.VITE_API_URL || "";
import { RegistrationToast } from "@/components/RegistrationToast";
import { useAuthStore } from "@/stores/auth";

// Создаем соединение
export const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${baseUrl}/registrationHub`, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

// Хранилище для обработчиков, чтобы избежать дублирования
const handlersSetup = new Set<string>();

// Создаем функцию для настройки обработчиков событий
export const setupSignalRHandlers = () => {
  // Проверяем, не был ли уже добавлен обработчик
  if (!handlersSetup.has("NewRegistration")) {
    handlersSetup.add("NewRegistration");

    connection.on("NewRegistration", (data: { email: string; date: string }) => {
      const authStore = useAuthStore.getState();
      const user = authStore.user;

      // Проверяем, что пользователь не является гостем и имеет права просматривать регистрации
      if (user && user.roles.includes("Guest")) {
        toast.success(`Регистрация успешна. Ждите ответа на Ваш email: ${data.email}`);
        return;
      }

      // Проверяем права пользователя для просмотра уведомлений о регистрации
      const hasViewRegistrationPermission = user?.roles.some((role) => role === "Admin" || role === "Manager");

      if (!hasViewRegistrationPermission) {
        return; // Не показываем уведомление пользователям без прав
      }

      console.log("New registration received:", data);

      // Если пользователь имеет права, используем кастомный компонент
      toast.custom((t) => <RegistrationToast data={data} t={t} />, { position: "top-right", duration: 10000 });
    });
  }
};
