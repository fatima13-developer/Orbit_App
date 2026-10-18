import { Router } from 'express';
import {
  createPost,
  getFeed,
  getExplorePosts,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost
} from '../../controllers/post.controller.js';
import { protect, optionalProtect } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { updatePostSchema } from '../../utils/validators.js';

const router = Router();

router.get('/feed', optionalProtect, getFeed);
router.get('/explore', optionalProtect, getExplorePosts);
router.get('/user/:username', optionalProtect, getUserPosts);
router.get('/:id', optionalProtect, getPostById);

router.post('/', protect, upload.array('images', 4), createPost);
router.patch('/:id', protect, validateBody(updatePostSchema), updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

export default router;
