import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
