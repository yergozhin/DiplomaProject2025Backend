import * as repo from './repo';
import type { FightContract, CreateContractFields, UpdateContractFields } from './model';

export async function create(fields: CreateContractFields) {
  if (!fields.fightId) throw new Error('Fight ID required');
  if (!fields.fighterId) throw new Error('Fighter ID required');
  
  const contractData = fields;
  const fightIdCheck = contractData.fightId;
  
  return repo.create(fields);
}

export const findByFight = (fightId: string) => repo.getByFightId(fightId);

export function findByFighter(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export const update = async (id: string, fields: UpdateContractFields) => {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
};

export function deleteContract(id: string) {
  return repo.deleteById(id);
}

