import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema, registerSchema } from '@/utils/validation';
import { getErrorMessage, getFieldErrors } from '@/services/api';
import { useLogin, useRegister } from '../hooks/useAuth';
import type { z } from 'zod';

const useRedirect = () => { const nav = useNavigate(); const loc = useLocation(); return () => nav((loc.state as any)?.from ?? '/account', { replace: true }); };

export const LoginForm = () => {
  const m = useLogin(); const done = useRedirect();
  const f = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const { state } = useLocation();
  return (
    <form noValidate onSubmit={f.handleSubmit((v) => m.mutate(v, { onSuccess: done }))} className="space-y-5">
      <h1 className="font-serif text-display">Sign in</h1>
      {(state as any)?.reason === 'bag' && <p className="bg-brand-tint p-3 text-sm">Sign in to add items to your bag.</p>}
      <Input label="Email" type="email" autoComplete="email" placeholder="Enter your email" error={f.formState.errors.email?.message} {...f.register('email')} />
      <Input label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" error={f.formState.errors.password?.message} {...f.register('password')} />
      {m.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(m.error)}</p>}
      <Button size="block" loading={m.isPending}>Sign in</Button>
      <p className="text-center text-sm text-muted-foreground">New to Nepbelle? <Link to="/register" state={useLocation().state} className="text-brand underline">Create an account</Link></p>
    </form>
  );
};

export const RegisterForm = () => {
  const m = useRegister(); const done = useRedirect();
  const f = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });
  const server = getFieldErrors(m.error);
  return (
    <form noValidate onSubmit={f.handleSubmit((v) => m.mutate(v, { onSuccess: done }))} className="space-y-5">
      <h1 className="font-serif text-display">Create account</h1>
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" autoComplete="given-name" error={f.formState.errors.firstName?.message} {...f.register('firstName')} />
        <Input label="Last name" autoComplete="family-name" error={f.formState.errors.lastName?.message} {...f.register('lastName')} />
      </div>
      <Input label="Email" type="email" autoComplete="email" placeholder="Enter your email" error={f.formState.errors.email?.message ?? server?.email?.[0]} {...f.register('email')} />
      <Input label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={f.formState.errors.password?.message ?? server?.password?.[0]} {...f.register('password')} />
      {m.isError && !server && <p role="alert" className="text-2xs text-brand">{getErrorMessage(m.error)}</p>}
      <Button size="block" loading={m.isPending}>Create account</Button>
      <p className="text-center text-sm text-muted-foreground">Already registered? <Link to="/login" className="text-brand underline">Sign in</Link></p>
    </form>
  );
};
