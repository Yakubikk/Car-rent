import toast, { type Toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import sound from "@/assets/multyashnoe-kryakanie.mp3";
import { useEffect } from "react";
import useSound from "use-sound";
import { UserPlus, Clock, X, ArrowRight } from "lucide-react";

export const RegistrationToast = ({ data, t }: { data: { email: string; date: string }; t: Toast }) => {
  const date = new Date(data.date);
  const formattedDate = date.toLocaleString();
  const [play] = useSound(sound);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    play();
    const timer = setTimeout(play, 450);
    return () => clearTimeout(timer);
  }, [play]);

  const handleViewDetails = (email: string) => {
    navigate(`/users/new-registration/${encodeURIComponent(email)}`, {
      state: { from: location },
    });
  };

  return (
    <div
      className={`relative max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ${
        t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Декоративная полоска */}
      <div className="absolute top-0 left-0 h-full w-2 bg-indigo-500 rounded-l-lg"></div>

      <div className="flex-1 p-4 pl-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <UserPlus className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">Новый запрос на регистрацию</h3>
            <div className="mt-1 text-sm text-gray-500 space-y-1">
              <div className="flex items-center">
                <span className="truncate">Пользователь: {data.email}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                <span>Дата: {formattedDate}</span>
              </div>
            </div>
            <div className="mt-3 flex">
              <button
                onClick={() => {
                  handleViewDetails(data.email);
                  toast.dismiss(t.id);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Просмотреть <ArrowRight className="ml-1.5 h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
