import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { BannerInput, CategoryInput, ProductInput,ColourInput } from '../types';

// After any admin write, refetch everything the storefront or admin screens might show
const useRefresh = () => {
  const qc = useQueryClient();
  return () => Promise.all(['admin', 'products', 'product', 'home', 'categories', 'facets'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
};

export const useAdminProducts = (q: string, page: number) =>
  useQuery({ queryKey: ['admin', 'products', q, page], queryFn: () => adminService.products.list({ q: q || undefined, page }), placeholderData: keepPreviousData });
export const useAdminProduct = (id?: string) =>
  useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminService.products.get(id!), enabled: !!id });
export const useSaveProduct = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: ProductInput }) => (id ? adminService.products.update(id, body) : adminService.products.create(body)),
    onSuccess: refresh,
  });
};
export const useDeleteProduct = () => { const refresh = useRefresh(); return useMutation({ mutationFn: adminService.products.remove, onSuccess: refresh }); };

export const useAdminCategories = () => useQuery({ queryKey: ['admin', 'categories'], queryFn: adminService.categories.list });
export const useSaveCategory = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CategoryInput }) => (id ? adminService.categories.update(id, body) : adminService.categories.create(body)),
    onSuccess: refresh,
  });
};
export const useDeleteCategory = () => { const refresh = useRefresh(); return useMutation({ mutationFn: adminService.categories.remove, onSuccess: refresh }); };

export const useAdminBanners = () => useQuery({ queryKey: ['admin', 'banners'], queryFn: adminService.banners.list });
export const useSaveBanner = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: BannerInput }) => (id ? adminService.banners.update(id, body) : adminService.banners.create(body)),
    onSuccess: refresh,
  });
};
export const useDeleteBanner = () => { const refresh = useRefresh(); return useMutation({ mutationFn: adminService.banners.remove, onSuccess: refresh }); };

export const useAdminColours = () => useQuery({ queryKey: ['admin', 'colours'], queryFn: adminService.colours.list });
export const useSaveColour = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: ColourInput }) => (id ? adminService.colours.update(id, body) : adminService.colours.create(body)),
    onSuccess: refresh,
  });
};
export const useDeleteColour = () => { const refresh = useRefresh(); return useMutation({ mutationFn: adminService.colours.remove, onSuccess: refresh }); };