import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import User from './models/User';

import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed admin user logic
const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      await User.create({ username: 'admin', password: 'admin123' });
      console.log('👤 Admin user created (admin / admin123)');
    } else {
      const isValid = await admin.comparePassword('admin123');
      if (!isValid) {
        admin.password = 'admin123';
        await admin.save();
        console.log('👤 Admin password reset and hashed (admin / admin123)');
      }
    }
  } catch (err) {
    console.error('❌ Admin seeding failed:', err);
  }
};

// Middleware to ensure database connection for serverless
const ensureConnection = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    res.status(503).json({
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Add database connection check to all API routes
app.use(ensureConnection);

// Routes
app.use('/api', apiRoutes);

// Export the app for Vercel Serverless Functions
export default app;

// Local and Production server logic (outside Vercel)
if (!process.env.VERCEL) {
  const start = async () => {
    try {
      await connectDB();
      await seedAdmin();
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
      console.error('❌ Server startup failed:', err);
    }
  };
  start();
}
