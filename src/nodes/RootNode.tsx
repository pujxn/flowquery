import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { RootNodeData } from '@/types/nodeData'

export function RootNode({ data, selected }: NodeProps) {
  const { label } = data as RootNodeData
  return (
    <div
      className={cn(
        'flex items-center justify-center w-28 h-14 rounded-xl border-2 font-semibold text-sm tracking-wide shadow-md',
        'bg-violet-950 text-violet-100 border-violet-500',
        selected && 'ring-2 ring-violet-400 ring-offset-1 ring-offset-zinc-900',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-violet-400 !bg-violet-900"
      />
      {label}
    </div>
  )
}
