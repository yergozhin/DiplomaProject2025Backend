import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

export async function getAll(_req: AuthRequest, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function sendOffers(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { fightId, eventId, eventSlotId, fighterAAmount, fighterACurrency, fighterBAmount, fighterBCurrency } = req.body;
  if (!fightId || !eventId || !eventSlotId || fighterAAmount === undefined || !fighterACurrency || fighterBAmount === undefined || !fighterBCurrency) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.sendOffers(req.user.userId, fightId, eventId, eventSlotId, fighterAAmount, fighterACurrency, fighterBAmount, fighterBCurrency);
  if ('error' in result) {
    if (result.error === 'fight_not_found') return res.status(404).json({ error: 'fight_not_found' });
    if (result.error === 'fight_not_accepted') return res.status(400).json({ error: 'fight_not_accepted' });
    if (result.error === 'event_not_found') return res.status(404).json({ error: 'event_not_found' });
    if (result.error === 'event_not_owned') return res.status(403).json({ error: 'forbidden' });
    if (result.error === 'slot_not_found') return res.status(404).json({ error: 'slot_not_found' });
    if (result.error === 'slot_not_in_event') return res.status(400).json({ error: 'slot_not_in_event' });
    if (result.error === 'slot_already_assigned') return res.status(409).json({ error: 'slot_already_assigned' });
    if (result.error === 'offer_already_exists') return res.status(409).json({ error: 'offer_already_exists' });
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result);
}

export async function deleteOffer(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { fightId } = req.body;
  if (!fightId) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.deleteOffer(req.user.userId, fightId);
  if ('error' in result) {
    if (result.error === 'offer_not_found') return res.status(404).json({ error: 'offer_not_found' });
    return res.status(400).json({ error: result.error });
  }
  res.status(204).end();
}


