import { z } from 'zod';
import { IUser } from '../models/User';

// Message schema
export const messageSchema = z.object({
  receiver: z.string().min(1, { message: 'Receiver ID is required' }),
  content: z.string().min(1, { message: 'Message content is required' })
});

// Type inference
export type MessageInput = z.infer<typeof messageSchema>;

// Message with populated user fields
export interface PopulatedMessage {
  _id: string;
  sender: IUser;
  receiver: IUser;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Socket message event
export interface MessageEvent {
  receiver: string;
  content: string;
}

// Socket typing event
export interface TypingEvent {
  receiverId: string;
}

// Socket read receipt event
export interface ReadReceiptEvent {
  senderId: string;
}