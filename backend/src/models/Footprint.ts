import { Schema, model, Types } from 'mongoose';
import { IFootprintLog } from './types';

const FootprintLogSchema = new Schema<IFootprintLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, index: true },
  category: {
    type: String,
    enum: ['transportation', 'electricity', 'food', 'water', 'shopping'],
    required: true
  },
  amount: { type: Number, required: true },
  carbonEmission: { type: Number, required: true },
  details: {
    vehicleType: { type: String },
    fuelType: { type: String },
    dietType: { type: String },
    waterType: { type: String },
    shoppingCategory: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export const FootprintLog = model<IFootprintLog>('FootprintLog', FootprintLogSchema);
export default FootprintLog;
