import { Router } from 'express'
import {
  create,
  getAll,
  getById,
  updateById,
  deleteById
} from '../controllers/profile.ts'
import { validateAuthentication } from '../middleware/auth'

const router = Router()

router.post('/', validateAuthentication, create)
router.get('/', validateAuthentication, getAll)
router.get('/:userId', validateAuthentication, getById)
router.put('/:userId', validateAuthentication, updateById)
router.delete('/:userId', validateAuthentication, deleteById)

export default router
