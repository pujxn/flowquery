import { useEffect } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'

function encode(nodes: Node[], edges: Edge[]): string {
  return btoa(JSON.stringify({
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  }))
}

export function useUrlSync() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)

  useEffect(() => {
    window.history.replaceState(null, '', `#v1=${encode(nodes, edges)}`)
  }, [nodes, edges])
}
