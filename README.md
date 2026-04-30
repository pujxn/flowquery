# FlowQuery

A visual, node-based query builder. Drag and connect nodes on a canvas to construct data queries that compile in real-time to SQL `WHERE` clauses and REST filter objects — then run them against a live database.

**Live demo:** https://flowquery.vercel.app

## How it works

Nodes are connected left-to-right to form query conditions:

```
Field → Operator → Value → Logic → Root
```

- **Field** — pick a column; list is fetched live from the database schema
- **Operator** — choose a comparator; available options filtered by the field's data type (e.g. `BETWEEN` only appears for numbers/dates)
- **Value** — enter a value, validated against the field's expected type via Zod
- **Logic** — AND / OR combinator that merges multiple conditions
- **Root** — the single terminal node that triggers compilation; everything flows into this

Edge connections are validated — invalid pairings (e.g. Field → Root directly) are rejected with a visual error.

Once the query is valid, click **Run Query** to execute it against the database and view paginated results in the panel.

## Features

- **Live query preview** — SQL and REST filter output update as you build the graph
- **Run Query** — executes the compiled WHERE clause against a real Postgres database; results appear in a paginated table (20 rows/page)
- **Resizable panel** — drag the left edge of the query preview panel to any width between 260–800px
- **Shareable URLs** — graph state is base64-encoded into the URL hash; share or bookmark any graph
- **Copy / paste** — Cmd/Ctrl+C/V to duplicate selected nodes and their connections
- **Light / dark mode** — toggle in the header; defaults to OS preference, persisted to localStorage

## Stack

**Frontend**
- React + TypeScript
- [ReactFlow](https://reactflow.dev) — canvas and graph engine
- [Zustand](https://zustand-demo.pmnd.rs) — graph state
- [TanStack Query](https://tanstack.com/query) — schema fetching and query execution
- [Zod](https://zod.dev) — per-node schema validation
- Tailwind CSS v4

**Backend**
- Vercel serverless API routes (production)
- Express + ts-node-dev (local dev)
- Neon serverless Postgres (production) / local Postgres (dev)

## Getting started

### Frontend only (no database)

```bash
npm install
npm run dev
```

The canvas and compiler work without a database — you just can't run queries. Open `http://localhost:5173` and build graphs freely.

### Full local setup (with query execution)

1. Make sure Postgres is running locally.

2. Create the database and seed it:
   ```bash
   psql postgres -c 'CREATE DATABASE flowquery_db;'
   cd server
   npm install
   npx ts-node -r ./dns-patch.cjs seed.ts
   ```

3. Start the API server:
   ```bash
   cd server
   npm run dev        # runs on http://localhost:3001
   ```

4. In a separate terminal, start Vite:
   ```bash
   npm run dev        # proxies /api/* to localhost:3001
   ```

Open `http://localhost:5173`. Build a valid graph, then click **Run Query**.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/schema` | Returns columns as `{ id, label, type }[]` |
| `POST` | `/api/query` | Accepts `{ where, page, pageSize }`, returns `{ rows, total, page, pageSize }` |

WHERE clauses are tokenized and re-parameterized server-side — literals become `$N` params and identifiers are validated against a column whitelist. No raw interpolation.
