import { Router } from 'express';
import * as c from './controller';

const r = Router();
r.post('/register', c.register);
r.post('/login', c.login);
r.get('/verify-email', c.verifyEmail);
r.post('/resend-verification-email', c.resendVerificationEmail);
export default r;


