import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Database Connection Configuration
 * Connects to MongoDB using Mongoose
 * Uses MongoDB Memory Server for development when no MONGO_URI is provided
 */

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use in-memory MongoDB for development if no URI is provided
    if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('password@cluster')) {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log('🧪 Using in-memory MongoDB for development');
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Continue running even if DB connection fails for demo purposes
    console.log('⚠️  Running in limited mode without database persistence');
  }
};

export default connectDB;
