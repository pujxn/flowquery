import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_lib/db'

const PG_TO_FIELD_TYPE: Record<string, string> = {
  integer:                       'number',
  bigint:                        'number',
  smallint:                      'number',
  numeric:                       'number',
  real:                          'number',
  'double precision':            'number',
  'character varying':           'string',
  varchar:                       'string',
  text:                          'string',
  date:                          'date',
  'timestamp without time zone': 'date',
  'timestamp with time zone':    'date',
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const sql = getDb()
    const rows = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name  = 'transactions'
        AND table_schema = 'public'
        AND column_name != 'id'
      ORDER BY ordinal_position
    `

    const fields = rows.map((row) => ({
      id:    row.column_name as string,
      label: (row.column_name as string)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      type: PG_TO_FIELD_TYPE[row.data_type as string] ?? 'string',
    }))

    res.json(fields)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch schema' })
  }
}
