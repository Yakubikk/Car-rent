import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/rbac";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import { Link } from "react-router-dom";

export default function CatalogPage() {
  const { isAdmin, isManager, isUser, isGuest } = usePermissions();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Каталог автомобилей</h1>
          <p className="mt-2 text-gray-600">
            Выберите автомобиль для аренды
          </p>
        </div>
        
        {/* Кнопка добавления автомобиля только для админов и менеджеров */}
        <PermissionGate permissions={[Permission.CREATE_CAR]}>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Добавить автомобиль
          </button>
        </PermissionGate>
      </div>

      {/* Информация для гостей */}
      {isGuest() && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Хотите забронировать автомобиль?
          </h3>
          <p className="text-blue-700 mb-4">
            Войдите в систему, чтобы получить возможность бронирования автомобилей.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            Войти
          </Link>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Тип</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Все типы</option>
              <option>Седан</option>
              <option>Внедорожник</option>
              <option>Хэтчбек</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Цена до</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Коробка передач</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Любая</option>
              <option>Автомат</option>
              <option>Механика</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Топливо</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Любое</option>
              <option>Бензин</option>
              <option>Дизель</option>
              <option>Электро</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список автомобилей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Примеры автомобилей */}
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div key={id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Фото автомобиля {id}</span>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Toyota Camry 2023</h3>
              <p className="text-gray-600 mt-1">Седан • Автомат • Бензин</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">2500₽/день</span>
                
                {/* Разные кнопки в зависимости от роли */}
                {isGuest() && (
                  <span className="text-sm text-gray-500">
                    Войдите для бронирования
                  </span>
                )}
                
                {(isUser() || isManager() || isAdmin()) && (
                  <PermissionGate permissions={[Permission.CREATE_BOOKING]}>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">
                      Забронировать
                    </button>
                  </PermissionGate>
                )}
              </div>
              
              {/* Кнопки управления для админов и менеджеров */}
              <PermissionGate permissions={[Permission.EDIT_CAR]}>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm">
                    Редактировать
                  </button>
                  <PermissionGate permissions={[Permission.DELETE_CAR]}>
                    <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm">
                      Удалить
                    </button>
                  </PermissionGate>
                </div>
              </PermissionGate>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}