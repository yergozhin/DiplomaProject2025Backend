import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/plos', requireAuth, requireRole(Roles.Admin), c.listPlos);
r.patch('/plos/:ploId/status', requireAuth, requireRole(Roles.Admin), c.updatePloStatus);
export default r;


