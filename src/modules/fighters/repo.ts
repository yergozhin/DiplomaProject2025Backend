import { query } from '@src/db/client';
import type { Fighter } from './model';

const FIGHTER_COLUMNS = `
  id,
  email,
  name,
  weight_class as "weightClass",
  first_name as "firstName",
  last_name as "lastName",
  nickname,
  phone_number as "phoneNumber",
  date_of_birth as "dateOfBirth",
  gender,
  current_weight_class as "currentWeightClass",
  height,
  reach,
  country,
  city,
  status,
  profile_picture as "profilePicture",
  bio,
  profile_created_at as "profileCreatedAt",
  profile_updated_at as "profileUpdatedAt",
  verification_links as "verificationLinks",
  verification_contacts as "verificationContacts",
  total_fights as "totalFights",
  wins as "wins",
  losses as "losses",
  draws as "draws",
  awards,
  record_confirmed as "recordConfirmed",
  record_confirmed_at as "recordConfirmedAt",
  record_confirmed_by as "recordConfirmedBy",
  record_admin_notes as "recordAdminNotes"
`;

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
  verificationLinks: string | null;
  verificationContacts: string | null;
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

export async function all(): Promise<Fighter[]> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS} from users where role=$1 order by first_name nulls last, last_name nulls last, name`,
    ['fighter'],
  );
  return r.rows;
}

export async function updateProfile(id: string, fields: FighterProfileFields): Promise<Fighter | null> {
  const fullName = buildFullName(fields.firstName, fields.lastName);
  const r = await query<Fighter>(
    `update users
      set first_name=$2,
          last_name=$3,
          nickname=$4,
          phone_number=$5,
          date_of_birth=$6,
          gender=$7,
          current_weight_class=$8,
          weight_class=$8,
          height=$9,
          reach=$10,
          country=$11,
          city=$12,
          status=$13,
          profile_picture=$14,
          bio=$15,
          verification_links=$16,
          verification_contacts=$17,
          profile_updated_at=now(),
          profile_created_at=coalesce(profile_created_at, now()),
          name=$18
      where id=$1 and role=$19
      returning ${FIGHTER_COLUMNS}`,
    [
      id,
      fields.firstName,
      fields.lastName,
      fields.nickname,
      fields.phoneNumber,
      fields.dateOfBirth,
      fields.gender,
      fields.currentWeightClass,
      fields.height,
      fields.reach,
      fields.country,
      fields.city,
      fields.status,
      fields.profilePicture,
      fields.bio,
      fields.verificationLinks,
      fields.verificationContacts,
      fullName,
      'fighter',
    ],
  );
  return r.rows[0] || null;
}

export async function getById(id: string): Promise<Fighter | null> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS} from users where id=$1 and role=$2`,
    [id, 'fighter'],
  );
  return r.rows[0] || null;
}

export async function allExcept(excludeId: string): Promise<Fighter[]> {
  const r = await query<Fighter>(
    `select ${FIGHTER_COLUMNS}
       from users u
       where u.role = $1
         and u.id != $2
         and not exists (
           select 1 from fights f
           where f.status in ('requested', 'accepted', 'scheduled')
             and ((f.fighter_a_id = u.id and f.fighter_b_id = $2) or (f.fighter_a_id = $2 and f.fighter_b_id = u.id))
         )
       order by u.first_name nulls last, u.last_name nulls last, u.name`,
    ['fighter', excludeId],
  );
  return r.rows;
}

export async function updateRecord(
  fighterId: string,
  adminId: string,
  fields: FighterRecordFields,
): Promise<Fighter | null> {
  const r = await query<Fighter>(
    `update users
      set total_fights=$3,
          wins=$4,
          losses=$5,
          draws=$6,
          awards=$7,
          record_confirmed=$8,
          record_admin_notes=$9,
          record_confirmed_by=case when $8 then $2 else null end,
          record_confirmed_at=case when $8 then now() else null end,
          profile_updated_at=now()
      where id=$1 and role=$10
      returning ${FIGHTER_COLUMNS}`,
    [
      fighterId,
      adminId,
      fields.totalFights,
      fields.wins,
      fields.losses,
      fields.draws,
      fields.awards,
      fields.recordConfirmed,
      fields.recordAdminNotes,
      'fighter',
    ],
  );
  return r.rows[0] || null;
}

