# FlowQuery — Build Status

## Live
https://flowquery.vercel.app

## What's built

### Nodes (all 5 complete)
| Node | Color | Description |
|------|-------|-------------|
| Field | Emerald | Dropdown to select a column (amount, quantity, status, region, created_at) |
| Operator | Amber | Comparator selector — filters available ops by the connected field's type |
| Value | Sky | Typed input (number / date / text); two inputs for BETWEEN, comma-separated for IN; Zod validation |
| Logic | Rose | AND / OR toggle; accepts multiple incoming edges; shows live condition count |
| Root | Violet | Terminal node; non-deletable; triggers compilation |

### Edge validation
- Enforces `Field → Operator → Value → Logic → Root` connection order
- Rejects duplicate edges and cycles (BFS check)
- Handles turn green/red while dragging based on validity
- Error banner appears at bottom on invalid drop attempt

### Compiler (`src/compiler/index.ts`)
- Walks graph backward from Root recursively
- Outputs a formatted SQL `WHERE` clause
- Outputs a nested REST filter object (`{ field: { op: value } }`)
- Handles IN (comma-separated → array), BETWEEN (two bounds), nested AND/OR groups
- Reports per-node errors for incomplete graphs

### Live query preview panel
- Right sidebar with SQL / REST Filter tabs
- `● valid` / `● incomplete` status indicator
- Updates on every graph change via `useMemo`
- Empty state when nothing is connected to Root

## Tech stack
React · TypeScript · ReactFlow (@xyflow/react) · Zustand · Zod v4 · Tailwind CSS v4 · Vite

## Repo
https://github.com/pujxn/flowquery

## Known bugs fixed
- Value node caused black screen on add — Zustand selector was returning a new object
  literal every render, triggering an infinite re-render loop. Fixed by splitting into
  two selectors returning primitives/stable refs.
- Vercel build failed — deprecated TypeScript `baseUrl` option, Zod v4 API rename
  (`invalid_type_error` → `error`), and ReactFlow `IsValidConnection` type mismatch.

## Possible next steps
- Edge labels showing the field/operator on connections
- Undo / redo (Zustand middleware or ReactFlow's built-in)
- Save / load graph to localStorage or JSON export
- More field definitions or user-defined schema
- Copy node / duplicate subgraph
- Mobile / touch support improvements
