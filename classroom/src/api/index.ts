import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Logout on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If not on a login/register page, redirect to login
      if (
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    
    // Format error message
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
