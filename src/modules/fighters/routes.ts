import { Router } from 'express';
import * as c from './controller';

const r = Router();
r.get('/', c.getAll);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
export default r;


