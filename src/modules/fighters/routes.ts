import { Router } from 'express';
import { requireAuth, requireRole } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as c from './controller';

const r = Router();
r.get('/', c.getAll);
r.get('/possible-opponents', requireAuth, requireRole(Roles.Fighter), c.getList);
r.get('/profile', requireAuth, requireRole(Roles.Fighter), c.getProfile);
r.put('/profile', requireAuth, requireRole(Roles.Fighter), c.updateProfile);
r.post('/verifications', requireAuth, requireRole(Roles.Fighter), c.createVerification);
r.get('/verifications', requireAuth, requireRole(Roles.Fighter), c.getMyVerifications);
r.get('/verifications/pending', requireAuth, requireRole(Roles.Admin), c.getPendingVerifications);
r.patch('/verifications/:verificationId/status', requireAuth, requireRole(Roles.Admin), c.reviewVerification);
r.get('/pending-verifications/fighters', requireAuth, requireRole(Roles.Admin), c.getFightersWithPendingVerifications);
r.get('/pending-verifications/:fighterId', requireAuth, requireRole(Roles.Admin), c.getPendingVerificationDetails);
r.put('/:fighterId/record', requireAuth, requireRole(Roles.Admin), c.updateRecord);
export default r;


