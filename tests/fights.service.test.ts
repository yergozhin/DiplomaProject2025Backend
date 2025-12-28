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

vi.mock('@src/modules/fights/repo', () => ({
  getFighterById: vi.fn(),
  findExisting: vi.fn(),
  create: vi.fn(),
  getById: vi.fn(),
  accept: vi.fn(),
}));

import * as service from '@src/modules/fights/service';
import * as repo from '@src/modules/fights/repo';

describe('Fights Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('should return error when fighter requests fight with themselves', async () => {
      const result = await service.sendRequest('fighter-1', 'fighter-1');
      expect(result).toEqual({ error: 'cannot_request_self' });
      expect(repo.getFighterById).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when sender is not a fighter', async () => {
      vi.mocked(repo.getFighterById).mockResolvedValueOnce(null);
      
      const result = await service.sendRequest('invalid-id', 'fighter-2');
      
      expect(result).toEqual({ error: 'sender_not_fighter' });
      expect(repo.getFighterById).toHaveBeenCalledWith('invalid-id');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when receiver is not a fighter', async () => {
      vi.mocked(repo.getFighterById)
        .mockResolvedValueOnce({ id: 'fighter-1' })
        .mockResolvedValueOnce(null);
      
      const result = await service.sendRequest('fighter-1', 'invalid-id');
      
      expect(result).toEqual({ error: 'receiver_not_fighter' });
      expect(repo.getFighterById).toHaveBeenCalledTimes(2);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return error when fight request already exists', async () => {
      vi.mocked(repo.getFighterById)
        .mockResolvedValueOnce({ id: 'fighter-1' })
        .mockResolvedValueOnce({ id: 'fighter-2' });
      vi.mocked(repo.findExisting).mockResolvedValueOnce({
        id: 'existing-fight',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'requested',
      });
      
      const result = await service.sendRequest('fighter-1', 'fighter-2');
      
      expect(result).toEqual({ error: 'request_exists' });
      expect(repo.findExisting).toHaveBeenCalledWith('fighter-1', 'fighter-2');
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('acceptFight', () => {
    it('should return error when fight does not exist', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce(null);
      
      const result = await service.acceptFight('invalid-id', 'fighter-2');
      
      expect(result).toEqual({ error: 'fight_not_found' });
      expect(repo.accept).not.toHaveBeenCalled();
    });

    it('should return error when fight status is not "requested"', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'accepted',
      });
      
      const result = await service.acceptFight('fight-1', 'fighter-2');
      
      expect(result).toEqual({ error: 'invalid_status' });
      expect(repo.accept).not.toHaveBeenCalled();
    });

    it('should return error when fighter is not the receiver', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'requested',
      });
      
      const result = await service.acceptFight('fight-1', 'fighter-1');
      
      expect(result).toEqual({ error: 'not_receiver' });
      expect(repo.accept).not.toHaveBeenCalled();
    });

    it('should return error when accept fails', async () => {
      vi.mocked(repo.getById).mockResolvedValueOnce({
        id: 'fight-1',
        fighterAId: 'fighter-1',
        fighterBId: 'fighter-2',
        status: 'requested',
      });
      vi.mocked(repo.accept).mockResolvedValueOnce(null);
      
      const result = await service.acceptFight('fight-1', 'fighter-2');
      
      expect(result).toEqual({ error: 'accept_failed' });
      expect(repo.accept).toHaveBeenCalledWith('fight-1');
    });
  });
});
