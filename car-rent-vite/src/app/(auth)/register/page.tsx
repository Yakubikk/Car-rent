import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import type { RegisterData } from "@/types/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    userName: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    passportNumber: "",
    driverLicense: "",
    driverLicenseIssueDate: "",
    birthDate: "",
    phoneNumber: "",
    address: "",
  });
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/catalog");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-bg py-12">
      <div className="bg-white p-8 rounded-lg shadow-pink w-full max-w-md border border-pink-border">
        <h1 className="text-2xl font-bold mb-6 text-center text-pink-text">Регистрация</h1>

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
              onChange={(e) => setFormData({ ...formData, email: e.target.value, userName: e.target.value })}
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

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-pink-text">
              Имя
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-pink-text">
              Фамилия
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="passportNumber" className="block text-sm font-medium text-pink-text">
              Номер паспорта
            </label>
            <input
              id="passportNumber"
              type="text"
              value={formData.passportNumber}
              onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="driverLicense" className="block text-sm font-medium text-pink-text">
              Водительское удостоверение
            </label>
            <input
              id="driverLicense"
              type="text"
              value={formData.driverLicense}
              onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="driverLicenseIssueDate" className="block text-sm font-medium text-pink-text">
              Дата выдачи водительского удостоверения
            </label>
            <input
              id="driverLicenseIssueDate"
              type="date"
              value={formData.driverLicenseIssueDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driverLicenseIssueDate: e.target.value,
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-pink-text">
              Дата рождения
            </label>
            <input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-pink-text">
              Номер телефона
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-pink-text">
              Адрес
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-pink-border rounded-md shadow-sm focus:outline-none focus:ring-pink-primary focus:border-pink-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-primary hover:bg-pink-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-primary disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
