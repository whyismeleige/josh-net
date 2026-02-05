import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url: string = process.env.MONGO_URI || '';
const dbName: string = process.env.DB_NAME || 'college_database';

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