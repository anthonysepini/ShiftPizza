import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  AUTH_TOKEN_KEY,
  clearStoredSession,
} from '../features/auth/session';
import { resolveApiBaseUrl } from '../config/api-url';

const api = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_URL, import.meta.env.DEV),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r: AxiosResponse) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearStoredSession(localStorage);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
