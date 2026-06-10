import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  points: number;
  streak: number;
  lastActive: Date;
  badges: string[];
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export type FootprintCategory = 'transportation' | 'electricity' | 'food' | 'water' | 'shopping';

export interface IFootprintLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  category: FootprintCategory;
  amount: number; // e.g. km, kWh, meals, Liters, items
  carbonEmission: number; // kg CO2
  details: {
    vehicleType?: string; // car, public, bike, walk, flight
    fuelType?: string; // petrol, diesel, electric, none
    dietType?: string; // vegan, vegetarian, poultry, meat-heavy
    waterType?: string; // shower, tap, washing-machine
    shoppingCategory?: string; // electronics, clothing, household, general
  };
  createdAt: Date;
}

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: FootprintCategory | 'general';
  type: 'daily' | 'weekly';
  points: number;
  requirements: {
    targetCount?: number;
    targetCategory?: string;
  };
}

export interface IUserChallenge extends Document {
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  status: 'active' | 'completed';
  progress: number;
  completedAt?: Date;
  streakCount: number;
}

export interface IGoal extends Document {
  userId: Types.ObjectId;
  category: FootprintCategory | 'total';
  targetReductionPercentage: number;
  targetValue: number; // kg CO2
  currentValue: number; // kg CO2
  startDate: Date;
  endDate: Date;
  status: 'active' | 'achieved' | 'failed';
}

export interface INotification extends Document {
  userId: Types.ObjectId;
  message: string;
  type: 'alert' | 'recommendation' | 'social';
  read: boolean;
  createdAt: Date;
}
