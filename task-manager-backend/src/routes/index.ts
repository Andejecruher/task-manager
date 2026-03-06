import { Router } from 'express';

const router = Router();

// Importing task routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/user';
// Using auth routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

export default router;