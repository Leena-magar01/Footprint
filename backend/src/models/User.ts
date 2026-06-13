import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from './types';

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Award badges automatically based on points milestones
UserSchema.pre<IUser>('save', function (next) {
  if (this.points >= 100 && !this.badges.includes('Eco Starter')) {
    this.badges.push('Eco Starter');
  }
  if (this.points >= 500 && !this.badges.includes('Eco Warrior')) {
    this.badges.push('Eco Warrior');
  }
  if (this.points >= 1500 && !this.badges.includes('Carbon Hero')) {
    this.badges.push('Carbon Hero');
  }
  next();
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);
export default User;
