import { useEffect, useState } from "react";
import { UsersApi } from "@/api/users";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { connection } from "@/services/signalR";

interface GuestUser {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  registerDate: string;
}

const GuestUsersTable = () => {
  const [users, setUsers] = useState<GuestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuestUsers = async () => {
      try {
        setLoading(true);
        const response = await UsersApi.getGuestUsers();
        setUsers(response.data);
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить список пользователей");
        toast.error("Ошибка при загрузке гостевых пользователей");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestUsers();

    // Обработчик для новых регистраций
    const handleNewRegistration = async (data: { email: string; date: string }) => {
      try {
        const user = await UsersApi.getUserByEmail(data.email);
        if (!user) {
          console.error(`Пользователь с email ${data.email} не найден`);
          return;
        }
        
        setUsers(prevUsers => {
          // Проверяем, нет ли уже такого пользователя в списке
          if (prevUsers.some(u => u.email === data.email)) {
            return prevUsers;
          }
          return [
            ...prevUsers,
            {
              email: data.email,
              firstName: user.firstName || "Не указано",
              lastName: user.lastName || "Не указано",
              phoneNumber: user.phoneNumber || "Не указано",
              registerDate: data.date,
            },
          ];
        });
      } catch (err) {
        console.error("Ошибка при обработке новой регистрации:", err);
      }
    };

    const handleApprovedRegistration = (data: { email: string; date: string }) => {
      setUsers(prevUsers => prevUsers.filter(user => user.email !== data.email));
      toast.success(`Регистрация пользователя ${data.email} подтверждена`);
      console.log(`Регистрация пользователя ${data.email} подтверждена`);
    };

    const handleRejectedRegistration = (data: { email: string; date: string }) => {
      setUsers(prevUsers => prevUsers.filter(user => user.email !== data.email));
      toast.error(`Регистрация пользователя ${data.email} отклонена`);
      console.log(`Регистрация пользователя ${data.email} отклонена`);
    };

    // Добавляем обработчик
    connection.on("NewRegistration", handleNewRegistration);
    connection.on("RegistrationApproved", handleApprovedRegistration);
    connection.on("RegistrationRejected", handleRejectedRegistration);

    // Очистка при размонтировании
    return () => {
      connection.off("NewRegistration", handleNewRegistration);
      connection.off("RegistrationApproved", handleApprovedRegistration);
      connection.off("RegistrationRejected", handleRejectedRegistration);
    };
  }, []);

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (users.length === 0) {
    return <div className="text-center py-8">Нет пользователей, ожидающих подтверждения</div>;
  }

  const handleViewDetails = (email: string) => {
    navigate(`/users/new-registration/${encodeURIComponent(email)}`, {
      state: { from: "/users/guests" },
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 border-b text-left">Дата</th>
            <th className="py-3 px-4 border-b text-left">Email</th>
            <th className="py-3 px-4 border-b text-left">Имя</th>
            <th className="py-3 px-4 border-b text-left">Фамилия</th>
            <th className="py-3 px-4 border-b text-left">Телефон</th>
            <th className="py-3 px-4 border-b text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">{new Date(user.registerDate).toLocaleString()}</td>
              <td className="py-3 px-4 border-b">{user.email}</td>
              <td className="py-3 px-4 border-b">{user.firstName}</td>
              <td className="py-3 px-4 border-b">{user.lastName}</td>
              <td className="py-3 px-4 border-b">{user.phoneNumber}</td>
              <td className="py-3 px-4 border-b">
                <button
                  className="text-blue-500 hover:text-blue-700 mr-3"
                  onClick={() => handleViewDetails(user.email)}
                >
                  Подробнее
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuestUsersTable;
