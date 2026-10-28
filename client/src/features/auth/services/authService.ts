import { api } from '@/services/api';
import type { User } from '@/store/authStore';

type Session = { user: User; accessToken: string };
export const authService = {
  login: async (b: { email: string; password: string }) => (await api.post<{ data: Session }>('/auth/login', b)).data.data,
  register: async (b: { email: string; password: string; firstName: string; lastName: string }) => (await api.post<{ data: Session }>('/auth/register', b)).data.data,
  refresh: async () => (await api.post<{ data: Session }>('/auth/refresh')).data.data,
  logout: () => api.post('/auth/logout'),
  updateProfile: async (b: { firstName?: string; lastName?: string; phone?: string }) => (await api.patch('/me', b)).data.data,
};
