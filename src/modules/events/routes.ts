import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', requireAuth, requireRole(Roles.PLO), c.getAll);
r.get('/owned-events', requireAuth, requireRole(Roles.PLO), c.getMyEvents);
r.get('/:eventId/available-slots', requireAuth, requireRole(Roles.PLO), c.getAvailableSlots);
r.post('/', requireAuth, requireRole(Roles.PLO), c.create);
r.put('/:eventId', requireAuth, requireRole(Roles.PLO), c.updateEvent);
export default r;


