import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { addressSchema, type AddressForm } from '@/utils/validation';
import { useCart } from '@/features/cart/hooks/useCart';
import { checkoutService } from '@/features/checkout/services/checkoutService';
import { useCheckoutStore } from '@/features/checkout/hooks/useCheckoutStore';
import { OrderSummaryPanel } from '@/features/checkout/components/OrderSummaryPanel';

// Figma 03.2 Checkout / Shipping
export default function CheckoutShippingPage() {
  const nav = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { shipping, setShipping } = useCheckoutStore();
  const { data: saved } = useQuery({ queryKey: ['addresses'], queryFn: checkoutService.addresses });
  const f = useForm<AddressForm>({ resolver: zodResolver(addressSchema), defaultValues: shipping ?? { country: 'AU' } });
  const { register, formState: { errors }, setValue, watch } = f;

  useEffect(() => { const d = saved?.find((a) => a.isDefault) ?? saved?.[0]; if (d && !shipping) f.reset({ ...d, line2: d.line2 ?? '', country: 'AU' }); }, [saved]); // eslint-disable-line

  if (!isLoading && !cart?.items.length) return <Navigate to="/cart" replace />;
  return (
    <div className="container-nb grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
      <form noValidate onSubmit={f.handleSubmit((v) => { setShipping(v); nav('/checkout/payment'); })} className="space-y-5 border border-line-soft bg-white p-6">
        <h1 className="font-serif text-display">Shipping address</h1>
        <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Address" autoComplete="address-line1" error={errors.line1?.message} {...register('line1')} />
        <Input label="Apartment, suite, etc. (optional)" autoComplete="address-line2" {...register('line2')} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
          <Input label="State" autoComplete="address-level1" error={errors.state?.message} {...register('state')} />
          <Input label="Postcode" inputMode="numeric" autoComplete="postal-code" error={errors.postcode?.message} {...register('postcode')} />
        </div>
        <Input label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
        <div className="flex items-center gap-2.5"><Checkbox id="save" checked={!!watch('saveAddress')} onCheckedChange={(c) => setValue('saveAddress', c === true)} /><Label htmlFor="save" className="font-sans font-normal text-muted-foreground">Save this address</Label></div>
        <div className="flex flex-wrap gap-3"><Button asChild variant="secondary"><Link to="/cart">Back to bag</Link></Button><Button>Continue to payment</Button></div>
      </form>
      <OrderSummaryPanel />
    </div>
  );
}
