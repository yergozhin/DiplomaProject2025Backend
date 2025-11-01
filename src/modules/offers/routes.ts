import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', requireAuth, requireRole(Roles.PLO), c.getAll);
r.get('/available-offers', requireAuth, requireRole(Roles.Fighter), c.getAvailableOffers);
r.post('/', requireAuth, requireRole(Roles.PLO), c.sendOffers);
r.delete('/', requireAuth, requireRole(Roles.PLO), c.deleteOffer);
export default r;


