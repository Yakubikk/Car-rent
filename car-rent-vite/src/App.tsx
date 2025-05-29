import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import * as signalR from "@microsoft/signalr";
import { useRef, useEffect } from "react";
import { connection, setupSignalRHandlers } from "./services/signalR";

function App() {
  const connectionStarted = useRef(false); // Флаг для отслеживания состояния подключения

  useEffect(() => {
    // Проверяем, не было ли уже начато подключение
    if (!connectionStarted.current) {
      connectionStarted.current = true;

      const startConnection = async () => {
        try {
          // Проверяем текущее состояние соединения
          if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
            console.log("SignalR Connected");
            setupSignalRHandlers();
          }
        } catch (err) {
          console.error("SignalR Connection Error: ", err);
        }
      };

      startConnection();
    }

    // Очистка при размонтировании компонента
    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, []);
  
  return <RouterProvider router={router} />;
}

export default App;
