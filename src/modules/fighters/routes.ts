import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', c.getAll);
r.get('/possible-opponents', requireAuth, requireRole(Roles.Fighter), c.getList);
r.get('/profile', requireAuth, requireRole(Roles.Fighter), c.getProfile);
r.put('/profile', requireAuth, requireRole(Roles.Fighter), c.updateProfile);
r.put('/:fighterId/record', requireAuth, requireRole(Roles.Admin), c.updateRecord);
export default r;


