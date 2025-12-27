import pool, { query } from '@src/db/client';
import type { Fighter, FighterVerification } from './model';

const FIGHTER_COLUMNS = `
  u.id,
  u.email,
  coalesce(fp.first_name || ' ' || fp.last_name, fp.first_name, fp.last_name, u.name) as name,
  wc.name as "weightClass",
  fp.first_name as "firstName",
  fp.last_name as "lastName",
  fp.nickname,
  fci.phone_number as "phoneNumber",
  fpa.date_of_birth as "dateOfBirth",
  fpa.gender,
  wc.name as "currentWeightClass",
  fpa.height,
  fpa.reach,
  fci.country,
  fci.city,
  fp.status,
  fp.profile_picture as "profilePicture",
  fp.bio,
  fp.profile_created_at as "profileCreatedAt",
  fp.profile_updated_at as "profileUpdatedAt",
  fr.total_fights as "totalFights",
  fr.wins as "wins",
  fr.losses as "losses",
  fr.draws as "draws",
  fr.awards,
  fr.record_confirmed as "recordConfirmed",
  fr.record_confirmed_at as "recordConfirmedAt",
  fr.record_confirmed_by as "recordConfirmedBy",
  fr.record_admin_notes as "recordAdminNotes"
`;

const FIGHTER_FROM_JOIN = `
  from users u
  left join fighter_profiles fp on u.id = fp.user_id
  left join fighter_physical_attributes fpa on fp.id = fpa.fighter_id
  left join fighter_contact_info fci on fp.id = fci.fighter_id
  left join fighter_records fr on fp.id = fr.fighter_id
  left join weight_classes wc on fpa.weight_class_id = wc.id
`;

const VERIFICATION_COLUMNS = `
  fv.id,
  fp.user_id as "fighterId",
  fv.type,
  fv.value,
  fv.wins,
  fv.losses,
  fv.draws,
  fv.awards,
  fv.status,
  fv.admin_id as "adminId",
  fv.admin_note as "adminNote",
  fv.reviewed_at as "reviewedAt",
  fv.created_at as "createdAt"
`;

function isUuid(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function buildFullName(firstName: string | null, lastName: string | null): string | null {
  const parts: string[] = [];
  if (firstName && firstName.trim().length > 0) parts.push(firstName.trim());
  if (lastName && lastName.trim().length > 0) parts.push(lastName.trim());
  if (parts.length === 0) return null;
  return parts.join(' ');
}

export interface FighterProfileFields {
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  currentWeightClass: string | null;
  height: number | null;
  reach: number | null;
  country: string | null;
  city: string | null;
  status: string | null;
  profilePicture: string | null;
  bio: string | null;
}

export interface FighterRecordFields {
  totalFights: number | null;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  awards: string | null;
  recordConfirmed: boolean;
  recordAdminNotes: string | null;
}

export type VerificationType = 'link' | 'contact' | 'image';
export type VerificationStatus = 'pending' | 'accepted' | 'rejected';

export interface CreateVerificationFields {
  type: VerificationType;
  value: string;
  wins: number;
  losses: number;
  draws: number;
  awards: string | null;
}

export async function all(): Promise<Fighter[]> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS} ${FIGHTER_FROM_JOIN} where u.role=$1 order by fp.first_name nulls last, fp.last_name nulls last, u.name`,
    ['fighter'],
  );
  return r.rows;
}

export async function updateProfile(id: string, fields: FighterProfileFields): Promise<Fighter | null> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    
    const weightClassRes = await client.query<{ id: string }>(
      `select id from weight_classes where name = $1 limit 1`,
      [fields.currentWeightClass],
    );
    const weightClassId = weightClassRes.rows[0]?.id || null;
    
    await client.query(
      `update fighter_profiles
        set first_name=$2,
            last_name=$3,
            nickname=$4,
            profile_picture=$5,
            bio=$6,
            status=$7,
            profile_updated_at=now(),
            profile_created_at=coalesce(profile_created_at, now())
        where user_id=$1`,
      [
        id,
        fields.firstName,
        fields.lastName,
        fields.nickname,
        fields.profilePicture,
        fields.bio,
        fields.status,
      ],
    );
    
    await client.query(
      `update fighter_physical_attributes
        set date_of_birth=$2,
            gender=$3,
            height=$4,
            reach=$5,
            weight_class_id=$6,
            updated_at=now()
        where fighter_id=(select id from fighter_profiles where user_id=$1)`,
      [
        id,
        fields.dateOfBirth,
        fields.gender,
        fields.height,
        fields.reach,
        weightClassId,
      ],
    );
    
    await client.query(
      `update fighter_contact_info
        set phone_number=$2,
            country=$3,
            city=$4,
            updated_at=now()
        where fighter_id=(select id from fighter_profiles where user_id=$1)`,
      [
        id,
        fields.phoneNumber,
        fields.country,
        fields.city,
      ],
    );
    
    await client.query('commit');
    
    const r = await query<Fighter>(
      `select ${FIGHTER_COLUMNS} ${FIGHTER_FROM_JOIN} where u.id=$1 and u.role=$2`,
      [id, 'fighter'],
    );
    return r.rows[0] || null;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export async function getById(id: string): Promise<Fighter | null> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS} ${FIGHTER_FROM_JOIN} where u.id=$1 and u.role=$2`,
    [id, 'fighter'],
  );
  return r.rows[0] || null;
}

export async function allExcept(excludeId: string): Promise<Fighter[]> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS}
       ${FIGHTER_FROM_JOIN}
       where u.role = $1
         and u.id != $2
         and not exists (
           select 1 from fights f
           join fighter_profiles fpa on f.fighter_a_id = fpa.id
           join fighter_profiles fpb on f.fighter_b_id = fpb.id
           where f.status in ('requested', 'accepted', 'scheduled')
             and ((fpa.user_id = u.id and fpb.user_id = $2) or (fpa.user_id = $2 and fpb.user_id = u.id))
         )
       order by fp.first_name nulls last, fp.last_name nulls last, u.name`,
    ['fighter', excludeId],
  );
  return r.rows;
}

export async function updateRecord(
  fighterId: string,
  adminId: string,
  fields: FighterRecordFields,
): Promise<Fighter | null> {
  const adminUuid = isUuid(adminId) ? adminId : null;
  const client = await pool.connect();
  try {
    await client.query('begin');
    
    await client.query(
      `update fighter_records
        set total_fights=$2,
            wins=$3,
            losses=$4,
            draws=$5,
            awards=$6,
            record_confirmed=$7,
            record_admin_notes=$8,
            record_confirmed_by=case when $7 and $9 is not null then $9 else null end,
            record_confirmed_at=case when $7 then now() else null end,
            updated_at=now()
        where fighter_id=(select id from fighter_profiles where user_id=$1)`,
      [
        fighterId,
        fields.totalFights,
        fields.wins,
        fields.losses,
        fields.draws,
        fields.awards,
        fields.recordConfirmed,
        fields.recordAdminNotes,
        adminUuid,
      ],
    );
    
    await client.query('commit');
    
    const r = await query<Fighter>(
      `select ${FIGHTER_COLUMNS} ${FIGHTER_FROM_JOIN} where u.id=$1 and u.role=$2`,
      [fighterId, 'fighter'],
    );
    return r.rows[0] || null;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export async function createVerification(
  fighterId: string,
  data: CreateVerificationFields,
): Promise<FighterVerification> {
  const r = await query<FighterVerification>(
    `insert into fighter_verifications (
        fighter_profile_id,
        type,
        value,
        wins,
        losses,
        draws,
        awards
      ) values ((select id from fighter_profiles where user_id = $1), $2, $3, $4, $5, $6, $7)
      returning id, $1 as "fighterId", type, value, wins, losses, draws, awards, status, admin_id as "adminId", admin_note as "adminNote", reviewed_at as "reviewedAt", created_at as "createdAt"`,
    [
      fighterId,
      data.type,
      data.value,
      data.wins,
      data.losses,
      data.draws,
      data.awards,
    ],
  );
  return r.rows[0];
}

export async function listVerificationsByFighter(fighterId: string): Promise<FighterVerification[]> {
  const r = await query<FighterVerification>(
    `select ${VERIFICATION_COLUMNS}
       from fighter_verifications fv
       join fighter_profiles fp on fv.fighter_profile_id = fp.id
       where fp.user_id = $1
       order by fv.created_at desc`,
    [fighterId],
  );
  return r.rows;
}

export async function listPendingVerifications(): Promise<FighterVerification[]> {
  const r = await query<FighterVerification>(
    `select ${VERIFICATION_COLUMNS}
       from fighter_verifications fv
       join fighter_profiles fp on fv.fighter_profile_id = fp.id
       where fv.status = 'pending'
       order by fv.created_at`,
  );
  return r.rows;
}

export async function listFightersWithPendingVerifications(): Promise<Fighter[]> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS}
       ${FIGHTER_FROM_JOIN}
       where u.role = 'fighter'
         and exists (
           select 1
           from fighter_verifications fv
           where fv.fighter_profile_id = fp.id
             and fv.status = 'pending'
         )
       order by fp.first_name nulls last, fp.last_name nulls last, u.name`,
  );
  return r.rows;
}

export async function updateVerificationStatus(
  verificationId: string,
  adminId: string,
  status: Exclude<VerificationStatus, 'pending'>,
  adminNote: string | null,
): Promise<{ verification: FighterVerification | null; fighter: Fighter | null }> {
  const client = await pool.connect();
  const adminUuid = isUuid(adminId) ? adminId : null;
  try {
    await client.query('begin');
    const existingRes = await client.query<FighterVerification>(
      `select ${VERIFICATION_COLUMNS}
         from fighter_verifications fv
         join fighter_profiles fp on fv.fighter_profile_id = fp.id
         where fv.id = $1
         for update`,
      [verificationId],
    );
    const existing = existingRes.rows[0];
    if (existing?.status !== 'pending') {
      await client.query('rollback');
      return { verification: null, fighter: null };
    }

    let updatedFighter: Fighter | null = null;

    if (status === 'accepted') {
      const fighterRes = await client.query<{
        total_fights: number | null;
        wins: number | null;
        losses: number | null;
        draws: number | null;
        awards: string | null;
      }>(
        `select total_fights, wins, losses, draws, awards
           from fighter_records
           where fighter_id=(select id from fighter_profiles where user_id = $1)
           for update`,
        [existing.fighterId],
      );
      const fighterRow = fighterRes.rows[0];
      if (!fighterRow) {
        await client.query('rollback');
        return { verification: null, fighter: null };
      }
      const currentWins = fighterRow.wins ?? 0;
      const currentLosses = fighterRow.losses ?? 0;
      const currentDraws = fighterRow.draws ?? 0;
      const currentTotal = fighterRow.total_fights ?? 0;

      const newWins = currentWins + (existing.wins ?? 0);
      const newLosses = currentLosses + (existing.losses ?? 0);
      const newDraws = currentDraws + (existing.draws ?? 0);
      const newTotal = currentTotal + (existing.wins ?? 0) + (existing.losses ?? 0) + (existing.draws ?? 0);

      let newAwards = fighterRow.awards;
      if (existing.awards) {
        newAwards = newAwards ? `${newAwards}\n${existing.awards}` : existing.awards;
      }

      await client.query(
        `update fighter_records
           set total_fights=$2,
               wins=$3,
               losses=$4,
               draws=$5,
               awards=$6,
               updated_at=now()
         where fighter_id=(select id from fighter_profiles where user_id=$1)`,
        [existing.fighterId, newTotal, newWins, newLosses, newDraws, newAwards],
      );

      const fighterUpdated = await client.query<Fighter>(
        `select ${FIGHTER_COLUMNS} ${FIGHTER_FROM_JOIN} where u.id=$1 and u.role='fighter'`,
        [existing.fighterId],
      );
      updatedFighter = fighterUpdated.rows[0] || null;
    }

    const updatedVerificationRes = await client.query<FighterVerification>(
      `update fighter_verifications fv
         set status=$2,
             admin_id=$3,
             admin_note=$4,
             reviewed_at=now()
       from fighter_profiles fp
       where fv.id=$1 and fv.fighter_profile_id = fp.id
       returning ${VERIFICATION_COLUMNS}`,
      [verificationId, status, adminUuid, adminNote],
    );

    await client.query('commit');
    return {
      verification: updatedVerificationRes.rows[0] || null,
      fighter: updatedFighter,
    };
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export async function getPendingVerificationDetails(
  fighterId: string,
): Promise<{ fighter: Fighter | null; verifications: FighterVerification[] }> {
  const fighterRes = await query<Fighter>(
    `select ${FIGHTER_COLUMNS}
       ${FIGHTER_FROM_JOIN}
       where u.id = $1 and u.role = 'fighter'`,
    [fighterId],
  );
  const fighter = fighterRes.rows[0] || null;
  if (!fighter) {
    return { fighter: null, verifications: [] };
  }
  const verificationsRes = await query<FighterVerification>(
    `select ${VERIFICATION_COLUMNS}
       from fighter_verifications fv
       join fighter_profiles fp on fv.fighter_profile_id = fp.id
       where fp.user_id = $1
       order by fv.created_at desc`,
    [fighterId],
  );
  return { fighter, verifications: verificationsRes.rows };
}

