import { Schema, model } from 'mongoose';
import { IChallenge } from './types';

const ChallengeSchema = new Schema<IChallenge>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['transportation', 'electricity', 'food', 'water', 'shopping', 'general'],
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true
  },
  points: { type: Number, required: true },
  requirements: {
    targetCount: { type: Number },
    targetCategory: { type: String }
  }
});

export const Challenge = model<IChallenge>('Challenge', ChallengeSchema);
export default Challenge;
