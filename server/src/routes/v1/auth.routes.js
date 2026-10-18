import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  logout,
  refreshToken,
  getMe
} from '../../controllers/auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../../utils/validators.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/demo', demoLogin);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

export default router;
