import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginData } from "@/types/auth";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/catalog", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-bg">
      <div className="bg-white p-8 rounded-lg shadow-pink w-full max-w-md border border-pink-border">
        <h1 className="text-2xl font-bold mb-6 text-center text-pink-text">Вход</h1>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-pink-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-pink-text">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-primary hover:bg-pink-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-primary disabled:opacity-50"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
