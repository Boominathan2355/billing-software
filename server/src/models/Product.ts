import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  unitName: string;
  freeStock: number;
  taxRate: number; // Percentage
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  unitName: { type: String, required: true },
  freeStock: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
});

export default mongoose.model<IProduct>('Product', ProductSchema);
