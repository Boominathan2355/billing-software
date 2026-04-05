import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Positive = advance, Negative = debt
}

const CustomerSchema = new Schema<ICustomer>({
  name:    { type: String, required: true },
  phone:   { type: String, required: true, unique: true },
  email:   { type: String },
  address: { type: String },
  balance: { type: Number, default: 0 },
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
