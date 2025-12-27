import pool, { query } from '@src/db/client';

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
        u.id,
        u.email,
        pp.plo_status,
        u.name,
        pp.league_name,
        pp.owner_first_name,
        pp.owner_last_name,
        pci.phone_number,
        pci.website,
        pci.country,
        pci.city,
        pci.address,
        pp.description,
        pp.logo,
        pp.founded_date,
        pp.social_media_links,
        pp.created_at,
        pp.updated_at
      from users u
      left join plo_profiles pp on u.id = pp.user_id
      left join plo_contact_info pci on pp.id = pci.plo_id
      where u.role = 'plo'
      order by u.email
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
  const client = await pool.connect();
  try {
    await client.query('begin');
    
    const r = await client.query<{ id: string }>(
      `select id from users where id = $1 and role = 'plo'`,
      [ploId],
    );
    const user = r.rows[0];
    if (!user) {
      await client.query('rollback');
      return null;
    }
    
    await client.query(
      `update plo_profiles
         set plo_status = $2,
             updated_at = now()
       where user_id = $1`,
      [ploId, status],
    );
    
    await client.query('commit');
    return { id: user.id, ploStatus: status };
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}


