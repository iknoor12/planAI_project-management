import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use in-memory MongoDB for development if no URI is provided
    if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('password@cluster')) {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
      }
    }

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
