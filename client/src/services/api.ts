import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

api.interceptors.request.use((cfg) => {
  const t = useAuthStore.getState().accessToken;
  if (t) cfg.headers.set('Authorization', `Bearer ${t}`);
  return cfg;
});

let refreshing: Promise<string | null> | null = null;
const refresh = () =>
  (refreshing ??= axios
    .post('/api/v1/auth/refresh', null, { withCredentials: true })
    .then((r) => { useAuthStore.getState().setSession(r.data.data.user, r.data.data.accessToken); return r.data.data.accessToken as string; })
    .catch(() => { useAuthStore.getState().clear(); return null; })
    .finally(() => { refreshing = null; }));

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const token = await refresh();
      if (token) { original.headers.set('Authorization', `Bearer ${token}`); return api(original); }
    }
    return Promise.reject(error);
  },
);

export interface ApiEnvelope<T> { success: true; data: T; meta?: { page: number; limit: number; total: number; totalPages: number } }
export const getErrorMessage = (e: unknown, fallback = 'Something went wrong. Please try again.') =>
  (axios.isAxiosError(e) && e.response?.data?.error?.message) || fallback;
export const getFieldErrors = (e: unknown): Record<string, string[]> | undefined =>
  axios.isAxiosError(e) ? e.response?.data?.error?.details : undefined;
