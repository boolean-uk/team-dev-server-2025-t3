import { Router } from 'express';
import { create,getAllComments ,getByPost,getByUser,remove,update} from '../controllers/comment.ts'
import { validateAuthentication } from '../middleware/auth';

const router = Router();

// Opprett en kommentar (krever autentisering)
router.post('/', validateAuthentication, create);

// Hent alle kommentarer
router.get('/',validateAuthentication,getAllComments);

router.get('/byPost/:Id',validateAuthentication, getByPost);

// Oppdater en kommentar (krever autentisering)
router.put('/:id',validateAuthentication, update);

// Slett en kommentar (krever autentisering)
router.delete('/:id', validateAuthentication, remove);

// Hent alle kommentarer fra en bestemt bruker
router.get('/byUser', validateAuthentication, getByUser);

export default router;
