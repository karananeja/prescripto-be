import { z } from 'zod';

export const doctorSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  image: z.string().min(1, { message: 'Image URL is required' }),
  specialty: z.string().min(1, { message: 'Specialty is required' }),
  degree: z.string().min(1, { message: 'Degree is required' }),
  experience: z.string().min(1, { message: 'Experience is required' }),
  about: z.string().min(1, { message: 'About description is required' }),
  available: z.boolean().optional(),
  fee: z.number().min(0, { message: 'Fee must be a positive number' }),
  address: z.object({
    line1: z.string().min(1, { message: 'Line1 is required' }),
    line2: z.string().min(1, { message: 'Line2 is required' }),
  }),
  date: z.number().min(0, { message: 'Date is required' }),
  slotsBooked: z.record(z.unknown()).default({}),
});

export const adminSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});
