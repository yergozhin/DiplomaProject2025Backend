import { Router } from 'express';
import { query } from '@src/db/client';
import AuthRoutes from '@src/modules/auth/routes';
import FighterRoutes from '@src/modules/fighters/routes';
import FightRoutes from '@src/modules/fights/routes';
import EventRoutes from '@src/modules/events/routes';
import OfferRoutes from '@src/modules/offers/routes';
import AdminRoutes from '@src/modules/admin/routes';
import PloRoutes from '@src/modules/plos/routes';
import FighterRankingsRoutes from '@src/modules/fighter-rankings/routes';
import FighterInjuriesRoutes from '@src/modules/fighter-injuries/routes';
import MedicalClearancesRoutes from '@src/modules/medical-clearances/routes';
import FightResultsRoutes from '@src/modules/fight-results/routes';
import FightStatisticsRoutes from '@src/modules/fight-statistics/routes';
import FightHistoryRoutes from '@src/modules/fight-history/routes';
import FightContractsRoutes from '@src/modules/fight-contracts/routes';
import EventCategoriesRoutes from '@src/modules/event-categories/routes';
import EventSponsorsRoutes from '@src/modules/event-sponsors/routes';
import EventLocationsRoutes from '@src/modules/event-locations/routes';
import EventMetadataRoutes from '@src/modules/event-metadata/routes';
import EventStatusHistoryRoutes from '@src/modules/event-status-history/routes';
import PloEventStatisticsRoutes from '@src/modules/plo-event-statistics/routes';
import OfferResponsesRoutes from '@src/modules/offer-responses/routes';

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
apiRouter.use('/fighter-rankings', FighterRankingsRoutes);
apiRouter.use('/fighter-injuries', FighterInjuriesRoutes);
apiRouter.use('/medical-clearances', MedicalClearancesRoutes);
apiRouter.use('/fight-results', FightResultsRoutes);
apiRouter.use('/fight-statistics', FightStatisticsRoutes);
apiRouter.use('/fight-history', FightHistoryRoutes);
apiRouter.use('/fight-contracts', FightContractsRoutes);
apiRouter.use('/event-categories', EventCategoriesRoutes);
apiRouter.use('/event-sponsors', EventSponsorsRoutes);
apiRouter.use('/event-locations', EventLocationsRoutes);
apiRouter.use('/event-metadata', EventMetadataRoutes);
apiRouter.use('/event-status-history', EventStatusHistoryRoutes);
apiRouter.use('/plo-event-statistics', PloEventStatisticsRoutes);
apiRouter.use('/offer-responses', OfferResponsesRoutes);

apiRouter.get('/db-health', async (_req, res) => {
  const r = await query('select 1 as ok');
  res.json(r.rows[0]);
});


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
