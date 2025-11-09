import { query } from '@src/db/client';

interface PloRow {
  id: string;
  email: string;
  plo_status: 'unverified' | 'verified';
  name: string | null;
  league_name: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  phone_number: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  logo: string | null;
  founded_date: string | null;
  social_media_links: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function listPlos(): Promise<{
  id: string;
  email: string;
  status: 'unverified' | 'verified';
  name: string | null;
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
}[]> {
  const r = await query<PloRow>(
    `
      select
        id,
        email,
        plo_status,
        name,
        league_name,
        owner_first_name,
        owner_last_name,
        phone_number,
        website,
        country,
        city,
        address,
        description,
        logo,
        founded_date,
        social_media_links,
        created_at,
        updated_at
        from users
       where role = 'plo'
       order by email
    `,
  );
  return r.rows.map((row) => ({
    id: row.id,
    email: row.email,
    status: row.plo_status,
    name: row.name,
    leagueName: row.league_name,
    ownerFirstName: row.owner_first_name,
    ownerLastName: row.owner_last_name,
    phoneNumber: row.phone_number,
    website: row.website,
    country: row.country,
    city: row.city,
    address: row.address,
    description: row.description,
    logo: row.logo,
    foundedDate: row.founded_date,
    socialMediaLinks: row.social_media_links,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updatePloStatus(
  ploId: string,
  status: 'unverified' | 'verified',
): Promise<{ id: string; ploStatus: 'unverified' | 'verified' } | null> {
  const r = await query<PloRow>(
    `
      update users
         set plo_status = $2
       where id = $1
         and role = 'plo'
      returning id, plo_status
    `,
    [ploId, status],
  );
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, ploStatus: row.plo_status };
}


