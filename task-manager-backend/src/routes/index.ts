import { Router } from 'express';

const router = Router();

// Importing task routes
import authRoutes from '@/routes/auth';
// Using auth routes
router.use('/auth', authRoutes);

export default router;