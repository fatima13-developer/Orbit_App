import { Router } from 'express';
import {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsSeen
} from '../../controllers/conversation.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/', protect, getOrCreateConversation);
router.get('/', protect, getUserConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, upload.single('image'), sendMessage);
router.patch('/:conversationId/seen', protect, markAsSeen);

export default router;
