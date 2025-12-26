import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.post('/', requireAuth, requireRole(Roles.Admin), c.create);
r.get('/', c.getAll);
r.get('/name/:name', c.getByName);
r.get('/:id', c.getById);
r.put('/:id', requireAuth, requireRole(Roles.Admin), c.update);
r.delete('/:id', requireAuth, requireRole(Roles.Admin), c.deleteById);
export default r;

