import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getSuggestedUsers
} from '../../controllers/user.controller.js';
import { protect, optionalProtect } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { updateProfileSchema } from '../../utils/validators.js';

const router = Router();

router.get('/suggested', optionalProtect, getSuggestedUsers);
router.get('/profile/:username', optionalProtect, getUserProfile);
router.patch('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.patch('/avatar', protect, upload.single('avatar'), updateAvatar);
router.patch('/cover', protect, upload.single('coverPhoto'), updateCoverPhoto);

router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/followers', optionalProtect, getFollowers);
router.get('/:id/following', optionalProtect, getFollowing);

export default router;
