import { Schema, model } from 'mongoose';
import { IUserChallenge } from './types';

const UserChallengeSchema = new Schema<IUserChallenge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  progress: { type: Number, default: 0 },
  completedAt: { type: Date },
  streakCount: { type: Number, default: 0 }
});

export const UserChallenge = model<IUserChallenge>('UserChallenge', UserChallengeSchema);
export default UserChallenge;
