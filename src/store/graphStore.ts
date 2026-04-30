import { create } from 'zustand'
import { type Node, type Edge, addEdge, type Connection, applyNodeChanges, type NodeChange, applyEdgeChanges, type EdgeChange } from '@xyflow/react'

export type NodeType = 'root' | 'field' | 'operator' | 'value' | 'logic'

export interface RootNodeData extends Record<string, unknown> {
  label: string
}

export interface GraphState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
}

const initialNodes: Node[] = [
  {
    id: 'root-1',
    type: 'root',
    position: { x: 400, y: 300 },
    data: { label: 'ROOT' } satisfies RootNodeData,
    deletable: false,
  },
]

export const useGraphStore = create<GraphState>((set) => ({
  nodes: initialNodes,
  edges: [],

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({ edges: addEdge(connection, state.edges) })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}))
