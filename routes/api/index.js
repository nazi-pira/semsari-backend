import { Router } from 'express'
import userRoutes from './user'
import itemRoutes from './item'

const router = Router();

router.use('/user', userRoutes)
router.use('/item', itemRoutes)

export default router