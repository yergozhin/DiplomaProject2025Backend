import { Router } from 'express';
import { requireAuth } from '@src/middlewares/auth';
import * as c from './controller';

const r = Router();
r.post('/', requireAuth, c.create);
r.get('/fight/:fightId', c.getByFight);
r.get('/:id', c.getById);
export default r;

