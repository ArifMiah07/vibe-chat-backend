import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

// Type inferences
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Auth response
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
  errors?: any[];
}