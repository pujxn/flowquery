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
  value:    { value: null },
  logic:    { mode: 'AND' },
}

export interface GraphState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect:     (connection: Connection) => void
  addNode:       (kind: NodeKind) => void
  updateNodeData:(id: string, patch: Record<string, unknown>) => void
}

const initialNodes: Node[] = [
  {
    id:       'root-1',
    type:     'root',
    position: { x: 600, y: 300 },
    data:     { label: 'ROOT' },
    deletable: false,
  },
]

export const useGraphStore = create<GraphState>((set) => ({
  nodes: initialNodes,
  edges: [],

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({ edges: addEdge(connection, s.edges) })),

  addNode: (kind) => {
    const id = `${kind}-${Date.now()}`
    const node: Node = {
      id,
      type:     kind,
      position: { x: 150 + Math.random() * 80, y: 150 + Math.random() * 80 },
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
