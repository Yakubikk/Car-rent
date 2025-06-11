import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT'
    }
  });
  
  // Watch the password field for validation
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      await registerUser(data.name, data.email, data.password, data.role);
      toast.success(t('registerSuccess'));
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in the Auth context
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('register')}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative dark:bg-red-900 dark:text-red-100" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 right-0 p-2" 
            onClick={clearError}
            aria-label={t('close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            {t('name')}
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            placeholder={t('namePlaceholder')}
            {...register('name', { 
              required: t('nameRequired'),
              minLength: {
                value: 2,
                message: t('nameTooShort')
              }
            })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            placeholder={t('emailPlaceholder')}
            {...register('email', { 
              required: t('emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('emailInvalid')
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-1 font-medium">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            placeholder={t('passwordPlaceholder')}
            {...register('password', { 
              required: t('passwordRequired'),
              minLength: {
                value: 6,
                message: t('passwordTooShort')
              }
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword', { 
              required: t('confirmPasswordRequired'),
              validate: value => value === password || t('passwordsDoNotMatch')
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block mb-1 font-medium">
            {t('role')}
          </label>
          <select
            id="role"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            {...register('role')}
          >
            <option value="STUDENT">{t('role.student')}</option>
            <option value="TEACHER">{t('role.teacher')}</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('registering') : t('register')}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p>
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('loginHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
