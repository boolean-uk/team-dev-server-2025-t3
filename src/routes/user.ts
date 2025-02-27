import { Router } from 'express'
import { create, getById, getAll, updateById, deleteById } from '../controllers/user.js'
import {
  validateAuthentication,
  validateTeacherRole
} from '../middleware/auth.js'

const router = Router()

router.post('/', create)
router.get('/', validateAuthentication, getAll)
router.get('/:id', validateAuthentication, getById)
router.put('/:id', validateAuthentication, updateById)
router.delete('/:id', validateAuthentication, deleteById)
router.patch('/:id', validateAuthentication, validateTeacherRole, updateById)

export default router
