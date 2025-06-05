import "./style.css";
import okak from "@/assets/okak-8-removebg-preview (1)-Photoroom.png";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 transition-all duration-1000 animate-darken-bg overflow-hidden">
      <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between min-h-screen">
        <div className="w-full md:w-[40%] mb-10 md:mb-0 opacity-0 animate-slideInLeft">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
          <h2 className="text-4xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Страница не найдена</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Кажется, вы заблудились в цифровом пространстве. Давайте вернём вас домой.
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            На главную
          </button>
        </div>

        <div className="w-full md:w-1/2 opacity-0 animate-slideInRight">
          <img src={okak} alt="404 illustration" className="w-full h-auto max-w-md mx-auto" />
        </div>
      </div>
    </div>
  );
};

export { NotFoundPage };
export default NotFoundPage;
