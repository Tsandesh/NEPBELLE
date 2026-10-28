import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { getErrorMessage } from '@/services/api';

const schema = z.object({ firstName: z.string().trim().min(1, 'Enter your first name.'), lastName: z.string().trim().min(1, 'Enter your last name.'), phone: z.string().trim().optional() });

// Figma 04.1 User profile
export default function ProfilePage() {
  const { user, accessToken, setSession } = useAuthStore();
  const f = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone ?? '' } });
  const m = useMutation({ mutationFn: authService.updateProfile, onSuccess: (u) => user && accessToken && setSession({ ...user, ...u }, accessToken) });
  return (
    <form noValidate onSubmit={f.handleSubmit((v) => m.mutate(v))} className="max-w-[520px] space-y-5"><h1 className="font-serif text-display">My profile</h1>
      <div className="grid grid-cols-2 gap-4"><Input label="First name" error={f.formState.errors.firstName?.message} {...f.register('firstName')} /><Input label="Last name" error={f.formState.errors.lastName?.message} {...f.register('lastName')} /></div>
      <Input label="Email" value={user?.email} disabled readOnly /><Input label="Phone" type="tel" {...f.register('phone')} />
      {m.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(m.error)}</p>}{m.isSuccess && <p role="status" className="text-2xs text-muted-foreground">Profile updated.</p>}
      <Button loading={m.isPending}>Save changes</Button></form>
  );
}
