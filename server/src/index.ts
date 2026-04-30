import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { pool } from './db'
import { parameterizeWhere } from './whereParser'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))
app.use(express.json())

// ── PG type → FieldType mapping ───────────────────────────────────────────────

const PG_TO_FIELD_TYPE: Record<string, string> = {
  integer:          'number',
  bigint:           'number',
  smallint:         'number',
  numeric:          'number',
  real:             'number',
  'double precision': 'number',
  'character varying': 'string',
  varchar:          'string',
  text:             'string',
  date:             'date',
  timestamp:        'date',
  'timestamp without time zone': 'date',
  'timestamp with time zone':    'date',
}

// ── GET /api/schema ───────────────────────────────────────────────────────────

app.get('/api/schema', async (_req, res) => {
  try {
    const result = await pool.query<{ column_name: string; data_type: string }>(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'transactions'
        AND table_schema = 'public'
        AND column_name != 'id'
      ORDER BY ordinal_position
    `)

    const fields = result.rows
      .map((row) => ({
        id:    row.column_name,
        label: row.column_name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        type: PG_TO_FIELD_TYPE[row.data_type] ?? 'string',
      }))
      .filter((f) => f.type !== undefined)

    res.json(fields)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch schema' })
  }
})

// ── POST /api/query ───────────────────────────────────────────────────────────

app.post('/api/query', async (req, res) => {
  const { where, page = 1, pageSize = 20 } = req.body as {
    where: string
    page?: number
    pageSize?: number
  }

  if (!where || typeof where !== 'string') {
    res.status(400).json({ error: 'Missing "where" string in request body' })
    return
  }

  const pageNum     = Math.max(1, Number(page))
  const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)))
  const offset      = (pageNum - 1) * pageSizeNum

  try {
    // Fetch allowed columns from DB at runtime so it stays in sync with schema
    const schemaResult = await pool.query<{ column_name: string }>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'transactions' AND table_schema = 'public'
    `)
    const allowedColumns = new Set(schemaResult.rows.map((r) => r.column_name.toLowerCase()))

    const { sql: whereSql, params } = parameterizeWhere(where, allowedColumns)

    const [countResult, dataResult] = await Promise.all([
      pool.query<{ count: string }>(
        `SELECT COUNT(*) FROM transactions WHERE ${whereSql}`,
        params,
      ),
      pool.query(
        `SELECT * FROM transactions WHERE ${whereSql}
         ORDER BY id
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSizeNum, offset],
      ),
    ])

    res.json({
      rows:     dataResult.rows,
      total:    parseInt(countResult.rows[0].count, 10),
      page:     pageNum,
      pageSize: pageSizeNum,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Query failed'
    console.error(err)
    res.status(400).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`FlowQuery server running on http://localhost:${PORT}`)
})
