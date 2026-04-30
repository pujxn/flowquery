import { create } from 'zustand'
import {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  applyNodeChanges,
  type NodeChange,
  applyEdgeChanges,
  type EdgeChange,
} from '@xyflow/react'

export type NodeKind = 'root' | 'field' | 'operator' | 'value' | 'logic'

const defaultDataByKind: Record<NodeKind, Record<string, unknown>> = {
  root:     { label: 'ROOT' },
  field:    { fieldId: null },
  operator: { operator: null },
  value:    { value: null, valueTo: null },
  logic:    { mode: 'AND' },
}

export interface GraphState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect:     (connection: Connection) => void
  addNode:       (kind: NodeKind, position?: { x: number; y: number }) => void
  updateNodeData:(id: string, patch: Record<string, unknown>) => void
}

const DEFAULT_NODES: Node[] = [
  {
    id:       'root-1',
    type:     'root',
    position: { x: 600, y: 300 },
    data:     { label: 'ROOT' },
    deletable: false,
  },
]

function loadFromHash(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const match = window.location.hash.match(/^#v1=(.+)$/)
    if (!match) return null
    const raw = JSON.parse(atob(match[1]))
    const nodes: Node[] = (raw.nodes as Node[]).map((n) => ({
      ...n,
      deletable: n.type === 'root' ? false : undefined,
    }))
    return { nodes, edges: raw.edges as Edge[] }
  } catch {
    return null
  }
}

const saved = loadFromHash()

export const useGraphStore = create<GraphState>((set) => ({
  nodes: saved?.nodes ?? DEFAULT_NODES,
  edges: saved?.edges ?? [],

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({ edges: addEdge(connection, s.edges) })),

  addNode: (kind, position) => {
    const id = `${kind}-${Date.now()}`
    const node: Node = {
      id,
      type:     kind,
      position: position ?? { x: 150 + Math.random() * 80, y: 150 + Math.random() * 80 },
      data:     { ...defaultDataByKind[kind] },
    }
    set((s) => ({ nodes: [...s.nodes, node] }))
  },

  updateNodeData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    })),
}))
