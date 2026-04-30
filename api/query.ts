import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_lib/db.js'
import { parameterizeWhere } from './_lib/whereParser.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { where, page = 1, pageSize = 20 } = (req.body ?? {}) as {
    where?: string
    page?: number
    pageSize?: number
  }

  if (!where || typeof where !== 'string') {
    return res.status(400).json({ error: 'Missing "where" string in request body' })
  }

  const pageNum     = Math.max(1, Number(page))
  const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)))
  const offset      = (pageNum - 1) * pageSizeNum

  try {
    const sql = getDb()

    const schemaRows = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'transactions' AND table_schema = 'public'
    `
    const allowedColumns = new Set(
      schemaRows.map((r) => (r.column_name as string).toLowerCase()),
    )

    const { sql: whereSql, params } = parameterizeWhere(where, allowedColumns)

    const [countResult, dataResult] = await Promise.all([
      sql.query(`SELECT COUNT(*) AS count FROM transactions WHERE ${whereSql}`, params),
      sql.query(
        `SELECT * FROM transactions WHERE ${whereSql}
         ORDER BY id
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSizeNum, offset],
      ),
    ])

    res.json({
      rows:     dataResult.rows,
      total:    parseInt((countResult.rows[0] as { count: string }).count, 10),
      page:     pageNum,
      pageSize: pageSizeNum,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Query failed'
    console.error(err)
    res.status(400).json({ error: message })
  }
}
