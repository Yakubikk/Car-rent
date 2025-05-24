import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <h1 className="text-5xl font-bold mb-6">404</h1>
      <h2 className="text-2xl mb-6">Страница не найдена</h2>
      <p className="mb-8 text-gray-600 text-center max-w-md">
        Извините, запрашиваемая вами страница не существует или была перемещена.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export { NotFoundPage };
export default NotFoundPage;
