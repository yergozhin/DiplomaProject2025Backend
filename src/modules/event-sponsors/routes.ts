import { Router } from 'express';
import { requireAuth, requireAnyRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.post('/', requireAuth, requireAnyRole(Roles.Admin, Roles.PLO), c.create);
r.get('/event/:eventId', c.getByEvent);
r.get('/:id', c.getById);
r.put('/:id', requireAuth, requireAnyRole(Roles.Admin, Roles.PLO), c.update);
r.delete('/:id', requireAuth, requireAnyRole(Roles.Admin, Roles.PLO), c.deleteById);
export default r;

