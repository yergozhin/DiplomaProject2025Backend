import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', c.getAll);
r.post('/', requireAuth, requireRole(Roles.Fighter), c.create);
r.put('/:id', requireAuth, requireRole(Roles.Fighter), c.update);
r.delete('/:id', requireAuth, requireRole(Roles.Fighter), c.remove);
export default r;


