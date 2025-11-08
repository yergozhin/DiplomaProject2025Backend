import { query } from '@src/db/client';

interface PloRow {
  id: string;
  email: string;
  plo_status: 'unverified' | 'verified';
  name: string | null;
}

export async function listPlos(): Promise<Array<{ id: string; email: string; status: 'unverified' | 'verified'; name: string | null }>> {
  const r = await query<PloRow>(
    `
      select id, email, plo_status, name
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


