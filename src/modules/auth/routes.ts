import { Router } from 'express';
import * as c from './controller';

const r = Router();
r.post('/register', c.register);
r.post('/login', c.login);
r.get('/verify-email', c.verifyEmail);
r.post('/resend-verification-email', c.resendVerificationEmail);
r.post('/request-password-reset', c.requestPasswordReset);
r.post('/reset-password', c.resetPassword);
export default r;


