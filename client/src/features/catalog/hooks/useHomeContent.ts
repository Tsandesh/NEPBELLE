import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { HomeContent } from '../types';

export const useHomeContent = () =>
  useQuery({ queryKey: ['home'], queryFn: async () => (await api.get<{ data: HomeContent }>('/site/home')).data.data });