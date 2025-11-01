import { Router } from 'express';
import { requireAuth, requireRole, requireAnyRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', requireAuth, requireRole(Roles.Fighter), c.getAll);
r.get('/accepted', requireAuth, requireAnyRole(Roles.Fighter, Roles.PLO), c.getAccepted);
r.get('/requests', requireAuth, requireRole(Roles.Fighter), c.getRequestsTo);
r.post('/request', requireAuth, requireRole(Roles.Fighter), c.sendRequest);
r.put('/:id/accept', requireAuth, requireRole(Roles.Fighter), c.acceptFight);
export default r;


