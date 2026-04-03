import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import User from './models/User';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import billRoutes from './routes/bills';
import conversionRoutes from './routes/conversion';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Seed admin user on first run or fix if corrupted
const seedAdmin = async () => {
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    await User.create({ username: 'admin', password: 'admin123' });
    console.log('👤 Admin user created (admin / admin123)');
  } else {
    // Check if the current password is valid (it might be plain text from an old run)
    const isValid = await admin.comparePassword('admin123');
    if (!isValid) {
      admin.password = 'admin123'; // This will trigger the pre-save hook and hash it correctly
      await admin.save();
      console.log('👤 Admin password reset and hashed (admin / admin123)');
    }
  }
};

export default app;

const start = async () => {
  await connectDB();
  await seedAdmin();
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  }
};

start();
