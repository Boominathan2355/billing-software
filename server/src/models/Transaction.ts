import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  date: Date;
  type: 'IN' | 'OUT';
  category: string;
  amount: number;
  customerId?: Types.ObjectId;
  details: string;
}

const TransactionSchema = new Schema<ITransaction>({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['IN', 'OUT'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
  details: { type: String, default: '' },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
