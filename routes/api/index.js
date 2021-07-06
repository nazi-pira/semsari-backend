import { Router } from 'express'
import userRoutes from './user'
import itemRoutes from './item'
import uploadRoutes from './upload'

const router = Router();

router.use('/user', userRoutes)
router.use('/item', itemRoutes)
router.use('/upload', uploadRoutes)

export default router