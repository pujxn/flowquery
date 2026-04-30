import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost/flowquery_db',
})

const merchants = [
  'Amazon', 'Netflix', 'Stripe', 'PayPal', 'Shopify', 'Square', 'Apple',
  'Google', 'Microsoft', 'Adobe', 'Spotify', 'Uber', 'Lyft', 'DoorDash',
  'Airbnb', 'Expedia', 'Nike', 'Adidas', 'Walmart', 'Target',
]

const statuses  = ['pending', 'active', 'completed'] as const
const regions   = ['US', 'EU', 'APAC']               as const

// Deterministic pseudo-variety — same output every seed run
const rows = Array.from({ length: 60 }, (_, i) => ({
  amount:     +((i * 137.51 % 4490) + 10).toFixed(2),
  quantity:   (i * 7 % 20) + 1,
  status:     statuses[i % 3],
  region:     regions[Math.floor(i / 3) % 3],
  created_at: new Date(2024, Math.floor(i / 5) % 12, (i % 28) + 1)
    .toISOString()
    .slice(0, 10),
  merchant:   merchants[i % merchants.length],
}))

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id         SERIAL PRIMARY KEY,
        amount     NUMERIC(10, 2) NOT NULL,
        quantity   INTEGER        NOT NULL,
        status     VARCHAR(20)    NOT NULL CHECK (status IN ('pending', 'active', 'completed')),
        region     VARCHAR(10)    NOT NULL CHECK (region IN ('US', 'EU', 'APAC')),
        created_at DATE           NOT NULL,
        merchant   VARCHAR(100)   NOT NULL
      )
    `)

    await client.query('TRUNCATE transactions RESTART IDENTITY')

    for (const row of rows) {
      await client.query(
        `INSERT INTO transactions (amount, quantity, status, region, created_at, merchant)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.amount, row.quantity, row.status, row.region, row.created_at, row.merchant],
      )
    }

    await client.query('COMMIT')
    console.log(`Seeded ${rows.length} rows into transactions.`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
