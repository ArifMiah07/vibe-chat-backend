import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required']
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create index for faster queries
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);