import { query } from '@src/db/client';
import type { FightContract, CreateContractFields, UpdateContractFields } from './model';

export async function create(fields: CreateContractFields): Promise<FightContract> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `with inserted as (
      insert into fight_contracts (fight_id, fighter_id, contract_amount, currency, contract_terms)
      values ($1, (select id from fighter_profiles where user_id = $2), $3, $4, $5)
      returning id, fight_id, fighter_id, contract_amount, currency, contract_signed, contract_signed_at, contract_terms, created_at, updated_at
    )
    select i.id, i.fight_id as "fightId", fp.user_id as "fighterId", i.contract_amount as "contractAmount", i.currency, i.contract_signed as "contractSigned", i.contract_signed_at as "contractSignedAt", i.contract_terms as "contractTerms", i.created_at as "createdAt", i.updated_at as "updatedAt",
           COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name
    from inserted i
    join fighter_profiles fp on i.fighter_id = fp.id`,
    [fields.fightId, fields.fighterId, fields.contractAmount, fields.currency ?? 'USD', fields.contractTerms ?? null],
  );
  const contract = r.rows[0];
  return { ...contract, fighterName: contract.fighter_name };
}

export async function getByFightId(fightId: string): Promise<FightContract[]> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `select fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt",
           COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name
     from fight_contracts fc
     join fighter_profiles fp on fc.fighter_id = fp.id
     where fc.fight_id = $1
     order by fc.created_at desc`,
    [fightId],
  );
  return r.rows.map(contract => ({ ...contract, fighterName: contract.fighter_name }));
}

export async function getByFighterId(fighterId: string): Promise<FightContract[]> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `select fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt",
           COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name
     from fight_contracts fc
     join fighter_profiles fp on fc.fighter_id = fp.id
     where fp.user_id = $1
     order by fc.created_at desc`,
    [fighterId],
  );
  return r.rows.map(contract => ({ ...contract, fighterName: contract.fighter_name }));
}

export async function getById(id: string): Promise<FightContract | null> {
  const r = await query<FightContract & { fighter_name: string | null }>(
    `select fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt",
           COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name
     from fight_contracts fc
     join fighter_profiles fp on fc.fighter_id = fp.id
     where fc.id = $1`,
    [id],
  );
  const contract = r.rows[0];
  if (!contract) return null;
  return { ...contract, fighterName: contract.fighter_name };
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
    `update fight_contracts fc
     set ${updates.join(', ')}
     from fighter_profiles fp
     where fc.id = $${paramCount} and fc.fighter_id = fp.id
     returning fc.id, fc.fight_id as "fightId", fp.user_id as "fighterId", fc.contract_amount as "contractAmount", fc.currency, fc.contract_signed as "contractSigned", fc.contract_signed_at as "contractSignedAt", fc.contract_terms as "contractTerms", fc.created_at as "createdAt", fc.updated_at as "updatedAt",
            COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name`,
    values,
  );
  const contract = r.rows[0];
  if (!contract) return null;
  return { ...contract, fighterName: contract.fighter_name };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_contracts where id = $1', [id]);
}

