import { Router } from 'express';

const router = Router();

// Importing task routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/user';
import workspaceRoutes from '@/routes/workspace';
// Using auth routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/workspace', workspaceRoutes);

export default router;