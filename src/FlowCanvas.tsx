import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  type Connection,
  type Edge,
  type FinalConnectionState,
} from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'
import { nodeTypes } from '@/nodes'
import { NodePalette } from '@/components/NodePalette'
import { isConnectionAllowed } from '@/lib/graphValidation'
import { useUrlSync } from '@/lib/useUrlSync'

export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphStore()
  const [connectionError, setConnectionError] = useState<string | null>(null)
  useUrlSync()

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    const { nodes, edges } = useGraphStore.getState()
    return isConnectionAllowed(connection as Connection, nodes, edges)
  }, [])

  const handleConnect = useCallback(
    (connection: Connection) => onConnect(connection),
    [onConnect],
  )

  const handleConnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
      if (state.isValid === false) {
        setConnectionError('Invalid connection — allowed order: Field → Operator → Value → Logic / Root')
        setTimeout(() => setConnectionError(null), 3000)
      }
    },
    [],
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectEnd={handleConnectEnd}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        className="bg-zinc-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#3f3f46" />
        <Controls className="!bg-zinc-800 !border-zinc-700 !text-zinc-200" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-700"
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              root:     '#7c3aed',
              field:    '#059669',
              operator: '#d97706',
              value:    '#0284c7',
              logic:    '#e11d48',
            }
            return colors[n.type ?? ''] ?? '#71717a'
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
        <NodePalette />

        {connectionError && (
          <Panel position="bottom-center">
            <div className="bg-red-950 border border-red-700 text-red-300 text-xs px-4 py-2 rounded-xl shadow-lg">
              {connectionError}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
