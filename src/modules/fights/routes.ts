import { Router } from 'express';
import * as c from './controller';

const r = Router();
r.get('/', c.getAll);
export default r;


