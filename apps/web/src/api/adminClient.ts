import axios from 'axios';

const ADMIN_KEY_STORAGE = 'movie_admin_api_key';

export function getStoredAdminKey(): string {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '';
}

export function setStoredAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearStoredAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE);
}

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const adminClient = axios.create({
  baseURL,
  timeout: 60000,
});

adminClient.interceptors.request.use((config) => {
  const key = getStoredAdminKey();
  if (key) {
    config.headers['X-Admin-Key'] = key;
  }
  return config;
});

export async function adminGet<T>(url: string): Promise<T> {
  const { data } = await adminClient.get<{ success: boolean; data: T }>(url);
  return data.data;
}

export async function adminPost<T>(url: string, body: unknown): Promise<T> {
  const { data } = await adminClient.post<{ success: boolean; data: T }>(url, body);
  return data.data;
}

export async function adminPatch<T>(url: string, body: unknown): Promise<T> {
  const { data } = await adminClient.patch<{ success: boolean; data: T }>(url, body);
  return data.data;
}

export async function adminDelete<T>(url: string): Promise<T> {
  const { data } = await adminClient.delete<{ success: boolean; data: T }>(url);
  return data.data;
}
