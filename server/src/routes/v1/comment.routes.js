import { Router } from 'express';
import {
  createComment,
  getCommentsByPost,
  deleteComment,
  likeComment,
  unlikeComment
} from '../../controllers/comment.controller.js';
import { protect, optionalProtect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createCommentSchema } from '../../utils/validators.js';

const router = Router();

router.post('/post/:postId', protect, validateBody(createCommentSchema), createComment);
router.get('/post/:postId', optionalProtect, getCommentsByPost);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);
router.delete('/:id/like', protect, unlikeComment);

export default router;
