import { Router } from 'express'
import { create, getAll,getAllSortedByDate,remove,update,getAllByUserSorted} from '../controllers/post.js'
import { validateAuthentication } from '../middleware/auth.js'

const router = Router()

router.post('/', validateAuthentication, create)
router.get('/', validateAuthentication, getAll)
router.get('/sorted', validateAuthentication, getAllSortedByDate)
router.get('/mine',validateAuthentication,getAllByUserSorted)
router.put('/:id', validateAuthentication,update)
router.delete('/:id', validateAuthentication, remove)



export default router
