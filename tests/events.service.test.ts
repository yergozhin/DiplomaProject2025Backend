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

vi.mock('@src/modules/events/repo', () => ({
  getById: vi.fn(),
  getByIdAndPloId: vi.fn(),
  getSlotCount: vi.fn(),
  updateEventStatus: vi.fn(),
  getAvailableSlots: vi.fn(),
}));

import * as service from '@src/modules/events/service';
import * as repo from '@src/modules/events/repo';

describe('Events Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('publishEvent', () => {
    it('should return error when event does not exist', async () => {
      vi.mocked(repo.getByIdAndPloId).mockResolvedValueOnce(null);
      
      const result = await service.publishEvent('invalid-event', 'plo-1');
      
      expect(result).toEqual({ event: null, error: 'not_found' });
      expect(repo.updateEventStatus).not.toHaveBeenCalled();
    });

    it('should return error when event status is not "draft"', async () => {
      vi.mocked(repo.getByIdAndPloId).mockResolvedValueOnce({
        id: 'event-1',
        status: 'published',
        ploId: 'plo-1',
      } as any);
      
      const result = await service.publishEvent('event-1', 'plo-1');
      
      expect(result).toEqual({ event: null, error: 'invalid_status' });
      expect(repo.updateEventStatus).not.toHaveBeenCalled();
    });

    it('should return error when required fields are missing', async () => {
      vi.mocked(repo.getByIdAndPloId).mockResolvedValueOnce({
        id: 'event-1',
        status: 'draft',
        ploId: 'plo-1',
        venueName: null,
        venueAddress: '123 Main St',
        city: 'City',
        country: 'Country',
        venueCapacity: 100,
        posterImage: 'image.jpg',
        ticketLink: 'tickets.com',
      } as any);
      
      const result = await service.publishEvent('event-1', 'plo-1');
      
      expect(result).toEqual({ event: null, error: 'missing_required_fields' });
      expect(repo.getSlotCount).not.toHaveBeenCalled();
      expect(repo.updateEventStatus).not.toHaveBeenCalled();
    });

    it('should return error when venue capacity is zero or negative', async () => {
      vi.mocked(repo.getByIdAndPloId).mockResolvedValueOnce({
        id: 'event-1',
        status: 'draft',
        ploId: 'plo-1',
        venueName: 'Venue',
        venueAddress: '123 Main St',
        city: 'City',
        country: 'Country',
        venueCapacity: 0,
        posterImage: 'image.jpg',
        ticketLink: 'tickets.com',
      } as any);
      
      const result = await service.publishEvent('event-1', 'plo-1');
      
      expect(result).toEqual({ event: null, error: 'missing_required_fields' });
      expect(repo.updateEventStatus).not.toHaveBeenCalled();
    });

    it('should return error when required string fields are empty', async () => {
      vi.mocked(repo.getByIdAndPloId).mockResolvedValueOnce({
        id: 'event-1',
        status: 'draft',
        ploId: 'plo-1',
        venueName: '   ',
        venueAddress: '123 Main St',
        city: 'City',
        country: 'Country',
        venueCapacity: 100,
        posterImage: 'image.jpg',
        ticketLink: 'tickets.com',
      } as any);
      
      const result = await service.publishEvent('event-1', 'plo-1');
      
      expect(result).toEqual({ event: null, error: 'missing_required_fields' });
      expect(repo.updateEventStatus).not.toHaveBeenCalled();
    });

    it('should return error when event has no slots', async () => {
      vi.mocked(repo.getByIdAndPloId).mockResolvedValueOnce({
        id: 'event-1',
        status: 'draft',
        ploId: 'plo-1',
        venueName: 'Venue',
        venueAddress: '123 Main St',
        city: 'City',
        country: 'Country',
        venueCapacity: 100,
        posterImage: 'image.jpg',
        ticketLink: 'tickets.com',
      } as any);
      vi.mocked(repo.getSlotCount).mockResolvedValueOnce(0);
      
      const result = await service.publishEvent('event-1', 'plo-1');
      
      expect(result).toEqual({ event: null, error: 'no_slots' });
      expect(repo.updateEventStatus).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableSlotsForEvent', () => {
    it('should return error when event does not exist', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce(null);
      
      const result = await service.getAvailableSlotsForEvent('invalid-event', 'plo-1');
      
      expect(result).toEqual({ error: 'event_not_found' });
      expect(repo.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('should return error when event is not owned by PLO', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce({
        id: 'event-1',
        ploId: 'plo-2',
      } as any);
      
      const result = await service.getAvailableSlotsForEvent('event-1', 'plo-1');
      
      expect(result).toEqual({ error: 'event_not_owned' });
      expect(repo.getAvailableSlots).not.toHaveBeenCalled();
    });
  });
});
