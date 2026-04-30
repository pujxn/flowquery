import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Connection,
} from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'
import { nodeTypes } from '@/nodes'

export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphStore()

  const handleConnect = useCallback(
    (connection: Connection) => onConnect(connection),
    [onConnect],
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: false }}
        className="bg-zinc-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#3f3f46"
        />
        <Controls className="!bg-zinc-800 !border-zinc-700 !text-zinc-200" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-700"
          nodeColor="#7c3aed"
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
