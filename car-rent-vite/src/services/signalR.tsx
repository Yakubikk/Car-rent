import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
import { approveRegistration, rejectRegistration } from "@/api/auth";

// Custom toast component for registration notifications
export const RegistrationToast = ({ data, t }: { data: any; t: any }) => {
  const date = new Date(data.date);
  const formattedDate = date.toLocaleString();

  const handleApprove = async () => {
    try {
      await approveRegistration(data.email);
      toast.success(`Регистрация пользователя ${data.email} подтверждена`);
    } catch (error) {
      toast.error("Ошибка подтверждения регистрации");
      console.error("Ошибка при подтверждении регистрации:", error);
    } finally {
      toast.dismiss(t.id);
    }
  };

  const handleReject = async () => {
    try {
      await rejectRegistration(data.email);
      toast.success(`Регистрация пользователя ${data.email} отклонена`);
    } catch (error) {
      toast.error("Ошибка отклонения регистрации");
      console.error("Ошибка при отклонении регистрации:", error);
    } finally {
      toast.dismiss(t.id);
    }
  };

  return (
    <div className="registration-notification">
      <h3 className="font-bold">Новый запрос на регистрацию</h3>
      <p>Пользователь: {data.email}</p>
      <p>Дата: {formattedDate}</p>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={handleApprove}
        >
          Подтвердить
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={handleReject}
        >
          Отклонить
        </button>
      </div>
    </div>
  );
};

// Singleton connection instance
let connection: signalR.HubConnection | null = null;

// Function to setup SignalR connection
export function setupSignalRConnection(baseUrl: string = import.meta.env.VITE_API_URL || "") {
  if (connection) return connection;

  // Create a new connection
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/registrationHub`)
    .withAutomaticReconnect()
    .build();

  // Handle new registration event
  connection.on("NewRegistration", (data) => {
    console.log("Получено уведомление о новой регистрации:", data);
    
    // Show toast notification with approval buttons
    toast.custom(
      (t) => <RegistrationToast data={data} t={t} />,
      {
        duration: 15000, // 15 seconds
        position: "top-right",
      }
    );
  });

  // Start the connection
  connection
    .start()
    .then(() => {
      console.log("Подключение к SignalR успешно установлено");
    })
    .catch((err) => {
      console.error("Ошибка подключения к SignalR:", err);
      connection = null; // Reset connection on error
    });

  return connection;
}

// Function to disconnect
export function disconnectSignalR() {
  if (connection) {
    connection.stop();
    connection = null;
    console.log("SignalR соединение закрыто");
  }
}
