import { z } from 'zod';

// Error copy matches the Figma input error state ("Enter a valid email address.")
export const emailField = z.string().trim().toLowerCase().email('Enter a valid email address.');
export const loginSchema = z.object({ email: emailField, password: z.string().min(1, 'Enter your password.') });
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  email: emailField,
  password: z.string().min(8, 'Use at least 8 characters.'),
});
export const addressSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your full name.'),
  line1: z.string().trim().min(1, 'Enter your street address.'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'Enter your city.'),
  state: z.string().trim().min(1, 'Enter your state.'),
  postcode: z.string().trim().regex(/^\d{4}$/, 'Enter a 4-digit postcode.'),
  country: z.literal('AU').default('AU'),
  phone: z.string().trim().min(8, 'Enter a valid phone number.'),
  saveAddress: z.boolean().optional(),
});
export type AddressForm = z.infer<typeof addressSchema>;
