import mongoose from 'mongoose';

let cachedConnection: any = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGO_URI or MONGODB_URI is not defined in environment variables');
    }
    
    // Set simplified connection options
    cachedConnection = await mongoose.connect(uri);
    console.log('✅ MongoDB connected (New Connection)');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // In serverless, we must throw the error instead of using process.exit(1)
    throw err;
  }
};

export default connectDB;
