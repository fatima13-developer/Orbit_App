import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import notificationRoutes from './notification.routes.js';
import conversationRoutes from './conversation.routes.js';
import searchRoutes from './search.routes.js';

import 'dotenv/config';
import { connectDB,closeDB } from '../../config/db.js';

await connectDB();

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/conversations', conversationRoutes);
router.use('/search', searchRoutes);

export default router;
