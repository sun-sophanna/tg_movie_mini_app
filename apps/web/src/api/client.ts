import axios from 'axios';
import { getTelegramInitData } from '../hooks/useTelegram';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const initData = getTelegramInitData();
  if (initData) {
    config.headers.Authorization = `tma ${initData}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 429) {
      error.message = 'Too many requests. Please wait and try again.';
    } else if (status >= 500) {
      error.message = 'Something went wrong. Please try again later.';
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string): Promise<T> {
  const { data } = await apiClient.get<{ success: boolean; data: T }>(url);
  return data.data;
}

export async function apiPost<T>(url: string): Promise<T> {
  const { data } = await apiClient.post<{ success: boolean; data: T }>(url);
  return data.data;
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const { data } = await apiClient.put<{ success: boolean; data: T }>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<{ success: boolean; data: T }>(url);
  return data.data;
}
