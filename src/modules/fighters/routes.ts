import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', c.getAll);
r.get('/profile', requireAuth, requireRole(Roles.Fighter), c.getProfile);
r.put('/profile', requireAuth, requireRole(Roles.Fighter), c.updateProfile);
export default r;


