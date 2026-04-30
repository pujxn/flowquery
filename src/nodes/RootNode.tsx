import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { RootNodeData } from '@/types/nodeData'

export function RootNode({ data, selected }: NodeProps) {
  const { label } = data as RootNodeData
  return (
    <div
      className={cn(
        'flex items-center justify-center w-28 h-14 rounded-xl border-2 font-semibold text-sm tracking-wide shadow-md',
        'bg-violet-50 text-violet-900 border-violet-400 dark:bg-violet-950 dark:text-violet-100 dark:border-violet-500',
        selected && 'ring-2 ring-violet-400 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-900',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-violet-500 !bg-violet-50 dark:!border-violet-400 dark:!bg-violet-900"
      />
      {label}
    </div>
  )
}
