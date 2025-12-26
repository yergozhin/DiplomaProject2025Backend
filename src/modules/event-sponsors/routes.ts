import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.post('/', requireAuth, requireRole([Roles.Admin, Roles.Plo]), c.create);
r.get('/event/:eventId', c.getByEvent);
r.get('/:id', c.getById);
r.put('/:id', requireAuth, requireRole([Roles.Admin, Roles.Plo]), c.update);
r.delete('/:id', requireAuth, requireRole([Roles.Admin, Roles.Plo]), c.deleteById);
export default r;

