import { Router } from 'express';
import { requireAuth } from '@src/middlewares/auth';
import * as c from './controller';

const r = Router();
r.post('/', requireAuth, c.create);
r.get('/event/:eventId', c.getByEvent);
r.get('/:id', c.getById);
export default r;

