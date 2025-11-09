import { query } from '@src/db/client';

export interface PloProfile {
  id: string;
  email: string;
  leagueName: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  phoneNumber: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  logo: string | null;
  foundedDate: string | null;
  socialMediaLinks: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const SELECT_COLUMNS = `
  id,
  email,
  league_name as "leagueName",
  owner_first_name as "ownerFirstName",
  owner_last_name as "ownerLastName",
  phone_number as "phoneNumber",
  website,
  country,
  city,
  address,
  description,
  logo,
  founded_date as "foundedDate",
  social_media_links as "socialMediaLinks",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

export async function getProfile(ploId: string): Promise<PloProfile | null> {
  const r = await query<PloProfile>(
    `
      select ${SELECT_COLUMNS}
        from users
       where id = $1
         and role = 'plo'
       limit 1
    `,
    [ploId],
  );
  return r.rows[0] || null;
}

export interface PloProfileUpdate {
  leagueName: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  phoneNumber: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  logo: string | null;
  foundedDate: string | null;
  socialMediaLinks: string | null;
}

export async function updateProfile(
  ploId: string,
  fields: PloProfileUpdate,
): Promise<PloProfile | null> {
  const r = await query<PloProfile>(
    `
      update users
         set league_name = $2,
             owner_first_name = $3,
             owner_last_name = $4,
             phone_number = $5,
             website = $6,
             country = $7,
             city = $8,
             address = $9,
             description = $10,
             logo = $11,
             founded_date = $12,
             social_media_links = $13,
             updated_at = now()
       where id = $1
         and role = 'plo'
      returning ${SELECT_COLUMNS}
    `,
    [
      ploId,
      fields.leagueName,
      fields.ownerFirstName,
      fields.ownerLastName,
      fields.phoneNumber,
      fields.website,
      fields.country,
      fields.city,
      fields.address,
      fields.description,
      fields.logo,
      fields.foundedDate,
      fields.socialMediaLinks,
    ],
  );
  return r.rows[0] || null;
}


