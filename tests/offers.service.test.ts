import { vi } from 'vitest';

vi.mock('@src/db/client', () => {
  const mockQuery = vi.fn();
  return {
    query: mockQuery,
    default: {
      query: mockQuery,
      connect: vi.fn(),
      end: vi.fn(),
    },
  };
});

import { describe, it, expect, beforeEach } from 'vitest';

vi.mock('@src/modules/offers/repo', () => ({
  getFightById: vi.fn(),
  getEventById: vi.fn(),
  getEventSlotById: vi.fn(),
  getOffersForFightEventSlotPlo: vi.fn(),
  create: vi.fn(),
  findExistingOffer: vi.fn(),
  deleteByFightAndPlo: vi.fn(),
  getById: vi.fn(),
  updateStatus: vi.fn(),
  getOffersForFightEventSlot: vi.fn(),
  updateFightStatus: vi.fn(),
  updateEventSlotFight: vi.fn(),
  rejectPendingOffersForEventSlot: vi.fn(),
}));

import * as service from '@src/modules/offers/service';
import * as repo from '@src/modules/offers/repo';

describe('Offers Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendOffers', () => {
    it('should return error when fight does not exist', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce(null);
      
      const result = await service.sendOffers(
        'plo-1',
        'invalid-fight',
        'event-1',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'fight_not_found' });
      expect(repo.getEventById).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when fight status is not "accepted"', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'requested',
      });
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'event-1',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'fight_not_accepted' });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when event does not exist', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      vi.mocked(repo.getEventById).mockResolvedValueOnce(null);
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'invalid-event',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'event_not_found' });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when event is not owned by PLO', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      vi.mocked(repo.getEventById).mockResolvedValueOnce({
        id: 'event-1',
        ploId: 'plo-2',
      } as any);
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'event-1',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'event_not_owned' });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when slot does not exist', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      vi.mocked(repo.getEventById).mockResolvedValueOnce({
        id: 'event-1',
        ploId: 'plo-1',
      } as any);
      vi.mocked(repo.getEventSlotById).mockResolvedValueOnce(null);
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'event-1',
        'invalid-slot',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'slot_not_found' });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when slot is not in event', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      vi.mocked(repo.getEventById).mockResolvedValueOnce({
        id: 'event-1',
        ploId: 'plo-1',
      } as any);
      vi.mocked(repo.getEventSlotById).mockResolvedValueOnce({
        id: 'slot-1',
        eventId: 'event-2',
        fightId: null,
      });
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'event-1',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'slot_not_in_event' });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when slot is already assigned', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      vi.mocked(repo.getEventById).mockResolvedValueOnce({
        id: 'event-1',
        ploId: 'plo-1',
      } as any);
      vi.mocked(repo.getEventSlotById).mockResolvedValueOnce({
        id: 'slot-1',
        eventId: 'event-1',
        fightId: 'other-fight',
      });
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'event-1',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'slot_already_assigned' });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when offer already exists', async () => {
      vi.mocked(repo.getFightById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      vi.mocked(repo.getEventById).mockResolvedValueOnce({
        id: 'event-1',
        ploId: 'plo-1',
      } as any);
      vi.mocked(repo.getEventSlotById).mockResolvedValueOnce({
        id: 'slot-1',
        eventId: 'event-1',
        fightId: null,
      });
      vi.mocked(repo.getOffersForFightEventSlotPlo).mockResolvedValueOnce([
        { id: 'offer-1', status: 'pending' } as any,
      ]);
      
      const result = await service.sendOffers(
        'plo-1',
        'fight-1',
        'event-1',
        'slot-1',
        1000,
        'USD',
        2000,
        'USD'
      );
      
      expect(result).toEqual({ error: 'offer_already_exists' });
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateOfferStatus', () => {
    it('should return error when offer does not exist', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce(null);
      
      const result = await service.updateOfferStatus('fighter-1', 'invalid-offer', 'accepted');
      
      expect(result).toEqual({ error: 'offer_not_found' });
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should return error when fighter is not the offer recipient', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce({
        id: 'offer-1',
        fighterId: 'fighter-2',
        status: 'pending',
      } as any);
      
      const result = await service.updateOfferStatus('fighter-1', 'offer-1', 'accepted');
      
      expect(result).toEqual({ error: 'forbidden' });
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should return error when offer is already responded', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce({
        id: 'offer-1',
        fighterId: 'fighter-1',
        status: 'accepted',
      } as any);
      
      const result = await service.updateOfferStatus('fighter-1', 'offer-1', 'accepted');
      
      expect(result).toEqual({ error: 'offer_already_responded' });
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });

});
