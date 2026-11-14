import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { adminOrderService } from '../services/adminOrderService';

export const ProofImage = ({ orderId }: { orderId: string }) => {
  const { data: url, isLoading, isError } = useQuery({
    queryKey: ['admin', 'proof', orderId], staleTime: Infinity, gcTime: 0,
    queryFn: async () => URL.createObjectURL(await adminOrderService.proof(orderId)),
  });
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  if (isLoading) return <Skeleton className="h-64 w-48" />;
  if (isError || !url) return <p className="text-2xs text-brand">Couldn’t load the screenshot.</p>;
  return <a href={url} target="_blank" rel="noreferrer" title="Open full size"><img src={url} alt="Customer’s payment screenshot" className="max-h-80 border border-line" /></a>;
};