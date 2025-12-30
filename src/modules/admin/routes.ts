import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/plos', requireAuth, requireRole(Roles.Admin), c.listPlos);
r.patch('/plos/:ploId/status', requireAuth, requireRole(Roles.Admin), c.updatePloStatus);
r.get('/users', requireAuth, requireRole(Roles.Admin), c.listUsers);
r.post('/users/:userId/verify-email', requireAuth, requireRole(Roles.Admin), c.verifyUserEmail);
r.get('/medical-clearances', requireAuth, requireRole(Roles.Admin), c.listMedicalClearances);
export default r;


