import { Router } from 'express';
import index from './api/index'

const router = Router();
router.use('/api', index);

export default router;