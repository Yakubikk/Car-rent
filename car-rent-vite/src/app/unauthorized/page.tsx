import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, getUserRoles } = usePermissions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Доступ запрещён</h3>
          <p className="mt-1 text-sm text-gray-500">У вас недостаточно прав для просмотра этой страницы</p>

          {user && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">
                Ваш статус: <span className="font-medium">{getUserRoles().join(", ")}</span>
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Назад
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
