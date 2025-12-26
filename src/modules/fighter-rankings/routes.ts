import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.post('/', requireAuth, requireRole(Roles.Admin), c.create);
r.get('/fighter/:fighterId', c.getByFighter);
r.get('/weight-class/:weightClassId', c.getByWeightClass);
r.get('/:id', c.getById);
r.put('/:id', requireAuth, requireRole(Roles.Admin), c.update);
r.delete('/:id', requireAuth, requireRole(Roles.Admin), c.deleteById);
export default r;

