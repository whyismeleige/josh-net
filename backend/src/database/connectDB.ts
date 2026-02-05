import mongoose from 'mongoose';
import { env } from '@config/env.config';

const url: string = env.MONGODB_URI || '';
const dbName: string = env.DB_NAME || 'college_database';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(url, { dbName });
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('Connection Error', err);
    process.exit(1);
  }
};

export default connectDB;