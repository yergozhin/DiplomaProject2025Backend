import { query } from '@src/db/client';

interface PloStatusRow {
  id: string;
  plo_status: 'unverified' | 'verified';
}

export async function updatePloStatus(
  ploId: string,
  status: 'unverified' | 'verified',
): Promise<{ id: string; ploStatus: 'unverified' | 'verified' } | null> {
  const r = await query<PloStatusRow>(
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


