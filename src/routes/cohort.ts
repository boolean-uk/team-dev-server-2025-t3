import { Router } from 'express'
import { create, getAllCohorts, getCohort } from '../controllers/cohort.js'
import {
  validateAuthentication,
  validateTeacherRole
} from '../middleware/auth.js'

const router = Router()

router.post('/', validateAuthentication, validateTeacherRole, create)
router.get('/', validateAuthentication, validateTeacherRole, getAllCohorts)
router.get('/:id', validateAuthentication, getCohort)

export default router
