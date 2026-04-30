import type { Connection, Edge, Node } from '@xyflow/react'

// which target node types are valid for each source node type
export const VALID_TARGETS: Record<string, string[]> = {
  field:    ['operator'],
  operator: ['value'],
  value:    ['logic', 'root'],
  logic:    ['logic', 'root'],
}

export function isConnectionAllowed(
  connection: Connection,
  nodes: Node[],
  edges: Edge[],
): boolean {
  const source = nodes.find((n) => n.id === connection.source)
  const target = nodes.find((n) => n.id === connection.target)
  if (!source?.type || !target?.type) return false

  // self-loop
  if (connection.source === connection.target) return false

  // type rule
  const allowed = VALID_TARGETS[source.type] ?? []
  if (!allowed.includes(target.type)) return false

  // duplicate edge
  if (edges.some((e) => e.source === connection.source && e.target === connection.target))
    return false

  // cycle detection — BFS from the proposed target; if we reach source, it's a cycle
  const visited = new Set<string>()
  const queue   = [connection.target!]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === connection.source) return false
    if (visited.has(current)) continue
    visited.add(current)
    edges.filter((e) => e.source === current).forEach((e) => queue.push(e.target))
  }

  return true
}
