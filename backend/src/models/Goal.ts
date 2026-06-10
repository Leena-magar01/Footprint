import { Schema, model } from 'mongoose';
import { IGoal } from './types';

const GoalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['total', 'transportation', 'electricity', 'food', 'water', 'shopping'],
    required: true
  },
  targetReductionPercentage: { type: Number, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'achieved', 'failed'],
    default: 'active'
  }
});

export const Goal = model<IGoal>('Goal', GoalSchema);
export default Goal;
