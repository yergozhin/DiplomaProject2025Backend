import pool, { query } from '@src/db/client';

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
  u.id,
  u.email,
  pp.league_name as "leagueName",
  pp.owner_first_name as "ownerFirstName",
  pp.owner_last_name as "ownerLastName",
  pci.phone_number as "phoneNumber",
  pci.website,
  pci.country,
  pci.city,
  pci.address,
  pp.description,
  pp.logo,
  pp.founded_date as "foundedDate",
  pp.social_media_links as "socialMediaLinks",
  pp.created_at as "createdAt",
  pp.updated_at as "updatedAt"
`;

export async function getProfile(ploId: string): Promise<PloProfile | null> {
  const r = await query<PloProfile>(
    `
      select ${SELECT_COLUMNS}
        from users u
        left join plo_profiles pp on u.id = pp.user_id
        left join plo_contact_info pci on pp.id = pci.plo_id
       where u.id = $1
         and u.role = 'plo'
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
  const client = await pool.connect();
  try {
    await client.query('begin');
    
    await client.query(
      `update users
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
         and role = 'plo'`,
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
    
    await client.query(
      `update plo_profiles
         set league_name = $2,
             owner_first_name = $3,
             owner_last_name = $4,
             description = $5,
             logo = $6,
             founded_date = $7,
             social_media_links = $8,
             updated_at = now()
       where user_id = $1`,
      [
        ploId,
        fields.leagueName,
        fields.ownerFirstName,
        fields.ownerLastName,
        fields.description,
        fields.logo,
        fields.foundedDate,
        fields.socialMediaLinks,
      ],
    );
    
    await client.query(
      `update plo_contact_info
         set phone_number = $2,
             website = $3,
             country = $4,
             city = $5,
             address = $6,
             updated_at = now()
       where plo_id = (select id from plo_profiles where user_id = $1)`,
      [
        ploId,
        fields.phoneNumber,
        fields.website,
        fields.country,
        fields.city,
        fields.address,
      ],
    );
    
    await client.query('commit');
    
    const r = await query<PloProfile>(
      `
        select ${SELECT_COLUMNS}
          from users u
          left join plo_profiles pp on u.id = pp.user_id
          left join plo_contact_info pci on pp.id = pci.plo_id
       where u.id = $1
         and u.role = 'plo'
       limit 1
      `,
      [ploId],
    );
    return r.rows[0] || null;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}


