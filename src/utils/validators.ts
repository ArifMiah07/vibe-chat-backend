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

// Message schema
export const messageSchema = z.object({
  receiver: z.string().min(1, { message: 'Receiver ID is required' }),
  content: z.string().min(1, { message: 'Message content is required' })
});

// Type inferences
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MessageInput = z.infer<typeof messageSchema>;