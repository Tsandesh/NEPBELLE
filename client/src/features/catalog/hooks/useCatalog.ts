import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';
import type { ProductFilters } from '../types';

export const useProducts = (f: ProductFilters) =>
  useQuery({ queryKey: ['products', f], queryFn: () => catalogService.list(f), placeholderData: keepPreviousData });
export const useProduct = (slug?: string) =>
  useQuery({ queryKey: ['product', slug], queryFn: () => catalogService.detail(slug!), enabled: !!slug });
export const useFacets = (category?: string) =>
  useQuery({ queryKey: ['facets', category], queryFn: () => catalogService.facets(category) });
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: catalogService.categories, staleTime: 600_000 });
