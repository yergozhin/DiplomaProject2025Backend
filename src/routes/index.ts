import { Router } from 'express';
import { query } from '@src/db/client';

import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

apiRouter.get('/db-health', async (_req, res) => {
  const r = await query('select 1 as ok');
  res.json(r.rows[0]);
});


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
