import { Router } from 'express';
import authRoutes       from './auth';
import customerRoutes   from './customers';
import productRoutes    from './products';
import billRoutes       from './bills';
import conversionRoutes from './conversion';
import transactionRoutes from './transactions';
import dashboardRoutes  from './dashboard';

const router = Router();

router.use('/auth',        authRoutes);
router.use('/customers',   customerRoutes);
router.use('/products',    productRoutes);
router.use('/bills',       billRoutes);
router.use('/conversion',  conversionRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard',   dashboardRoutes);

export default router;
