import { Router } from 'express';
import { query } from '@src/db/client';
import AuthRoutes from '@src/modules/auth/routes';
import FighterRoutes from '@src/modules/fighters/routes';
import FightRoutes from '@src/modules/fights/routes';
import EventRoutes from '@src/modules/events/routes';
import OfferRoutes from '@src/modules/offers/routes';
import AdminRoutes from '@src/modules/admin/routes';
import PloRoutes from '@src/modules/plos/routes';

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

apiRouter.use(Paths.Auth.Base, AuthRoutes);
apiRouter.use(Paths.Fighters.Base, FighterRoutes);
apiRouter.use(Paths.Fights.Base, FightRoutes);
apiRouter.use(Paths.Events.Base, EventRoutes);
apiRouter.use(Paths.Offers.Base, OfferRoutes);
apiRouter.use(Paths.Admin.Base, AdminRoutes);
apiRouter.use(Paths.Plos.Base, PloRoutes);

apiRouter.get('/db-health', async (_req, res) => {
  const r = await query('select 1 as ok');
  res.json(r.rows[0]);
});


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
