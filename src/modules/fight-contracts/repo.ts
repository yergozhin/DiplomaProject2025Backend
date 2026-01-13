import { query } from '@src/db/client';
import type { FightContract, CreateContractFields, UpdateContractFields } from './model';

export async function create(fields: CreateContractFields): Promise<FightContract> {
  const result = await query<FightContract & { fighter_name: string | null }>(
    'with inserted as (insert into fight_contracts (fight_id, fighter_id, contract_amount, currency, contract_terms) values ($1, (select id from fighter_profiles where user_id = $2), $3, $4, $5) returning id, fight_id, fighter_id, contract_amount, currency, contract_signed, contract_signed_at, contract_terms, created_at, updated_at) select i.id, i.fight_id as "fightId", fp.user_id as "fighterId", i.contract_amount as "contractAmount", i.currency, i.contract_signed as "contractSigned", i.contract_signed_at as "contractSignedAt", i.contract_terms as "contractTerms", i.created_at as "createdAt", i.updated_at as "updatedAt", COALESCE(fp.nickname, fp.first_name || \' \' || fp.last_name) as fighter_name from inserted i join fighter_profiles fp on i.fighter_id = fp.id',
    [fields.fightId, fields.fighterId, fields.contractAmount, fields.currency ?? 'USD', fields.contractTerms ?? null],
  );
  const contract = result.rows[0];
  return { ...contract, fighterName: contract.fighter_name };
}

export async function getByFightId(fightId: string): Promise<FightContract[]> {
  const res = await query<FightContract & { fighter_name: string | null }>(
    'select fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt", COALESCE(fp.nickname, fp.first_name || \' \' || fp.last_name) as fighter_name from fight_contracts fc join fighter_profiles fp on fc.fighter_id = fp.id where fc.fight_id = $1 order by fc.created_at desc',
    [fightId],
  );
  const contracts = [];
  for (const row of res.rows) {
    contracts.push({ ...row, fighterName: row.fighter_name });
  }
  return contracts;
}

export const getByFighterId = async (fighterId: string): Promise<FightContract[]> => {
  const result = await query<FightContract & { fighter_name: string | null }>(
    'select fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt", COALESCE(fp.nickname, fp.first_name || \' \' || fp.last_name) as fighter_name from fight_contracts fc join fighter_profiles fp on fc.fighter_id = fp.id where fp.user_id = $1 order by fc.created_at desc',
    [fighterId],
  );
  const contracts = [];
  for (const row of result.rows) {
    contracts.push({ ...row, fighterName: row.fighter_name });
  }
  return contracts;
};

export async function getById(id: string): Promise<FightContract | null> {
  const res = await query<FightContract & { fighter_name: string | null }>(
    'select fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt", COALESCE(fp.nickname, fp.first_name || \' \' || fp.last_name) as fighter_name from fight_contracts fc join fighter_profiles fp on fc.fighter_id = fp.id where fc.id = $1',
    [id],
  );
  const contract = res.rows[0];
  if (!contract) return null;
  return { ...contract, fighterName: contract.fighter_name };
}

export async function update(id: string, fields: UpdateContractFields): Promise<FightContract | null> {
  const updateMap = new Map<string, unknown>();
  
  if (fields.contractAmount !== undefined) updateMap.set('contract_amount', fields.contractAmount);
  if (fields.currency !== undefined) updateMap.set('currency', fields.currency);
  if (fields.contractTerms !== undefined) updateMap.set('contract_terms', fields.contractTerms);
  
  if (fields.contractSigned !== undefined) {
    updateMap.set('contract_signed', fields.contractSigned);
    updateMap.set('contract_signed_at', fields.contractSigned ? 'now()' : null);
  }
  
  if (updateMap.size === 0) {
    return getById(id);
  }
  
  const updateClauses: string[] = [];
  const queryValues: unknown[] = [];
  let paramNum = 1;
  
  for (const [key, value] of updateMap.entries()) {
    if (value === 'now()') {
      updateClauses.push(`${key} = now()`);
    } else if (value === null) {
      updateClauses.push(`${key} = null`);
    } else {
      updateClauses.push(`${key} = $${paramNum}`);
      queryValues.push(value);
      paramNum++;
    }
  }
  
  updateClauses.push('updated_at = now()');
  queryValues.push(id);
  
  const result = await query<FightContract & { fighter_name: string | null }>(
    `update fight_contracts fc set ${updateClauses.join(', ')} from fighter_profiles fp where fc.id = $${paramNum} and fc.fighter_id = fp.id returning fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt", COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name`,
    queryValues,
  );
  const contract = result.rows[0];
  if (!contract) return null;
  return { ...contract, fighterName: contract.fighter_name };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_contracts where id = $1', [id]);
}

