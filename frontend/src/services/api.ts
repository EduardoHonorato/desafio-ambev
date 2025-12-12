import axios from 'axios';
import { API_CONFIG, APP_CONFIG, ROUTES } from '@/config';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONFIG.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem(APP_CONFIG.tokenKey);
        localStorage.removeItem(APP_CONFIG.userKey);
        window.location.href = ROUTES.login;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
