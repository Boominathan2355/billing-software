import mongoose, { Document, Schema, Types } from 'mongoose';

interface IBillItem {
  versionId: Types.ObjectId;
  productName: string;
  versionName: string;
  qty: number;
  price: number;
  taxAmount?: number;
}

export interface IBill extends Document {
  customerId?: Types.ObjectId;
  customerName?: string; // Ad-hoc walk-in
  customerPhone?: string; // Ad-hoc walk-in
  paymentType: 'CASH' | 'UDHAAR';
  items: IBillItem[];
  subTotal: number;
  taxAmount: number;
  discount: {
    type: 'FLAT' | 'PERCENTAGE';
    value: number;
    amount: number;
  };
  total: number;
  date: Date;
  transactionId?: Types.ObjectId;
  cancelled: boolean;
  status: 'DRAFT' | 'COMPLETED';
}

const BillSchema = new Schema<IBill>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String },
  customerPhone: { type: String },
  paymentType: { type: String, enum: ['CASH', 'UDHAAR'], required: true },
  items: [{
    versionId: { type: Schema.Types.ObjectId, ref: 'Version', required: true },
    productName: { type: String, required: true },
    versionName: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
  }],
  subTotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: {
    type: { type: String, enum: ['FLAT', 'PERCENTAGE'] },
    value: { type: Number },
    amount: { type: Number, default: 0 },
  },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  cancelled: { type: Boolean, default: false },
  status: { type: String, enum: ['DRAFT', 'COMPLETED'], default: 'COMPLETED' },
});

export default mongoose.model<IBill>('Bill', BillSchema);
