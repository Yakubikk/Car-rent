import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useAuthStore } from "./stores/auth";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Toaster } from "react-hot-toast";
import {
  setupSignalRConnection,
  disconnectSignalR,
} from "@/services/signalR.tsx";

const NotFound = () => <div>Page Not Found</div>;
const Dashboard = () => <div>Dashboard</div>;

function App() {
  const { fetchUser, user } = useAuthStore();

  useEffect(() => {
    // При загрузке приложения пытаемся получить пользователя
    fetchUser().catch(() => {});
  }, [fetchUser]);

  // Connect to SignalR if user is authenticated and has appropriate role
  useEffect(() => {
    if (
      user &&
      user.roles &&
      (user.roles.includes("Manager") || user.roles.includes("Admin"))
    ) {
      setupSignalRConnection();

      // Disconnect when component unmounts
      return () => {
        disconnectSignalR();
      };
    }
  }, [user]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
