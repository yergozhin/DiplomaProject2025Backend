import { query } from '@src/db/client';
import type { FightContract, CreateContractFields, UpdateContractFields } from './model';

export async function create(fields: CreateContractFields): Promise<FightContract> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `insert into fight_contracts (fight_id, fighter_id, contract_amount, currency, contract_terms)
     values ($1, $2, $3, $4, $5)
     returning id, fight_id as "fightId", fighter_id as "fighterId", contract_amount as "contractAmount", currency, contract_signed as "contractSigned", contract_signed_at as "contractSignedAt", contract_terms as "contractTerms", created_at as "createdAt", updated_at as "updatedAt"`,
    [fields.fightId, fields.fighterId, fields.contractAmount, fields.currency || 'USD', fields.contractTerms ?? null],
  );
  const contract = r.rows[0];
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [contract.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...contract, fighterName };
}

export async function getByFightId(fightId: string): Promise<FightContract[]> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `select id, fight_id as "fightId", fighter_id as "fighterId", contract_amount as "contractAmount", currency, contract_signed as "contractSigned", contract_signed_at as "contractSignedAt", contract_terms as "contractTerms", created_at as "createdAt", updated_at as "updatedAt"
     from fight_contracts
     where fight_id = $1
     order by created_at desc`,
    [fightId],
  );
  const contracts = await Promise.all(r.rows.map(async (contract) => {
    const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [contract.fighterId],
    );
    const fighter = fighterRes.rows[0];
    const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
    return { ...contract, fighterName };
  }));
  return contracts;
}

export async function getByFighterId(fighterId: string): Promise<FightContract[]> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `select id, fight_id as "fightId", fighter_id as "fighterId", contract_amount as "contractAmount", currency, contract_signed as "contractSigned", contract_signed_at as "contractSignedAt", contract_terms as "contractTerms", created_at as "createdAt", updated_at as "updatedAt"
     from fight_contracts
     where fighter_id = $1
     order by created_at desc`,
    [fighterId],
  );
  const contracts = await Promise.all(r.rows.map(async (contract) => {
    const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [contract.fighterId],
    );
    const fighter = fighterRes.rows[0];
    const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
    return { ...contract, fighterName };
  }));
  return contracts;
}

export async function getById(id: string): Promise<FightContract | null> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `select id, fight_id as "fightId", fighter_id as "fighterId", contract_amount as "contractAmount", currency, contract_signed as "contractSigned", contract_signed_at as "contractSignedAt", contract_terms as "contractTerms", created_at as "createdAt", updated_at as "updatedAt"
     from fight_contracts
     where id = $1`,
    [id],
  );
  const contract = r.rows[0];
  if (!contract) return null;
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [contract.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...contract, fighterName };
}

export async function update(id: string, fields: UpdateContractFields): Promise<FightContract | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.contractAmount !== undefined) {
    updates.push(`contract_amount = $${paramCount++}`);
    values.push(fields.contractAmount);
  }
  if (fields.currency !== undefined) {
    updates.push(`currency = $${paramCount++}`);
    values.push(fields.currency);
  }
  if (fields.contractSigned !== undefined) {
    updates.push(`contract_signed = $${paramCount++}`);
    values.push(fields.contractSigned);
    if (fields.contractSigned) {
      updates.push(`contract_signed_at = now()`);
    } else {
      updates.push(`contract_signed_at = null`);
    }
  }
  if (fields.contractTerms !== undefined) {
    updates.push(`contract_terms = $${paramCount++}`);
    values.push(fields.contractTerms);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  updates.push(`updated_at = now()`);
  values.push(id);
  const r = await query<FightContract & { fighter_name: string | null }>(
    `update fight_contracts
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, fight_id as "fightId", fighter_id as "fighterId", contract_amount as "contractAmount", currency, contract_signed as "contractSigned", contract_signed_at as "contractSignedAt", contract_terms as "contractTerms", created_at as "createdAt", updated_at as "updatedAt"`,
    values,
  );
  const contract = r.rows[0];
  if (!contract) return null;
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [contract.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...contract, fighterName };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_contracts where id = $1', [id]);
}

