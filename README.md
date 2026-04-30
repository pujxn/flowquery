# FlowQuery

A visual, node-based query builder. Drag and connect nodes on a canvas to construct data queries that compile in real-time to SQL `WHERE` clauses and REST filter objects.

## How it works

Nodes are connected left-to-right to form query conditions:

```
Field → Operator → Value → Logic → Root
```

- **Field** — pick a column (amount, status, region, etc.)
- **Operator** — choose a comparator; available options are filtered by the field's type (e.g. `BETWEEN` only appears for numbers/dates)
- **Value** — enter a value, validated against the field's expected type via Zod
- **Logic** — AND / OR combinator that merges multiple conditions
- **Root** — the single terminal node that triggers compilation; everything flows into this

Edge connections are validated — invalid pairings (e.g. Field → Root directly) are rejected with a visual error.

## Stack

- React + TypeScript
- [ReactFlow](https://reactflow.dev) — canvas and graph engine
- [Zustand](https://zustand-demo.pmnd.rs) — graph state outside ReactFlow's internal store
- [Zod](https://zod.dev) — per-node schema validation
- [TanStack Query](https://tanstack.com/query) — async state for the compiled query
- Tailwind CSS + shadcn/ui

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and use the **Add Node** palette in the top-left to place nodes on the canvas, then connect them by dragging from a node's right handle to the next node's left handle.
