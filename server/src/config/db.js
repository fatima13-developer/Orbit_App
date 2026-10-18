
import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from .env');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
};

export const closeDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB connection closed');
};
