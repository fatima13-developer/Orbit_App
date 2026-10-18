import { Router } from 'express';
import { searchUsers } from '../../controllers/search.controller.js';
import { optionalProtect } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/users', optionalProtect, searchUsers);

export default router;
