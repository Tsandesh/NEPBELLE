import { api, type ApiEnvelope } from '@/services/api';
import type { Banner, Product } from '@/features/catalog/types';
import type { AdminCategory, BannerInput, CategoryInput, ProductInput } from '../types';

const d = <T,>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

export const adminService = {
  upload: (file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return d<{ url: string }>(api.post('/admin/uploads', fd)).then((r) => r.url);
  },
  products: {
    list: async (p: { q?: string; page?: number }) => {
      const { data } = await api.get<ApiEnvelope<Product[]>>('/admin/products', { params: p });
      return { items: data.data, meta: data.meta! };
    },
    get: (id: string) => d<Product>(api.get(`/admin/products/${id}`)),
    create: (b: ProductInput) => d<Product>(api.post('/admin/products', b)),
    update: (id: string, b: ProductInput) => d<Product>(api.put(`/admin/products/${id}`, b)),
    remove: (id: string) => api.delete(`/admin/products/${id}`),
  },
  categories: {
    list: () => d<AdminCategory[]>(api.get('/admin/categories')),
    create: (b: CategoryInput) => d<AdminCategory>(api.post('/admin/categories', b)),
    update: (id: string, b: CategoryInput) => d<AdminCategory>(api.put(`/admin/categories/${id}`, b)),
    remove: (id: string) => api.delete(`/admin/categories/${id}`),
  },
  banners: {
    list: () => d<Banner[]>(api.get('/admin/banners')),
    create: (b: BannerInput) => d<Banner>(api.post('/admin/banners', b)),
    update: (id: string, b: BannerInput) => d<Banner>(api.put(`/admin/banners/${id}`, b)),
    remove: (id: string) => api.delete(`/admin/banners/${id}`),
  },
};