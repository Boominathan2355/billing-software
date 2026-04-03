import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVersion extends Document {
  productId: Types.ObjectId;
  name: string;
  multiplier: number;
  price: number;
}

const VersionSchema = new Schema<IVersion>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  multiplier: { type: Number, required: true },
  price: { type: Number, required: true },
});

export default mongoose.model<IVersion>('Version', VersionSchema);
