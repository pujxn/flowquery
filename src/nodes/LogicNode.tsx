import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'
import type { LogicNodeData } from '@/types/nodeData'
import { cn } from '@/lib/utils'

export function LogicNode({ id, data, selected }: NodeProps) {
  const updateNodeData   = useGraphStore((s) => s.updateNodeData)
  const conditionCount   = useGraphStore((s) => s.edges.filter((e) => e.target === id).length)
  const { mode } = data as LogicNodeData

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 px-3 py-2.5 rounded-xl border-2 shadow-md min-w-32',
        'bg-rose-50 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-600',
        selected && 'ring-2 ring-rose-400 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-900',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-500">
        Logic
      </span>

      {/* AND / OR toggle */}
      <div className="flex rounded-lg overflow-hidden border border-rose-300 dark:border-rose-700">
        {(['AND', 'OR'] as const).map((m) => (
          <button
            key={m}
            className={cn(
              'nodrag nopan px-3 py-1 text-sm font-bold transition-colors',
              mode === m
                ? 'bg-rose-500 text-white'
                : 'bg-white text-rose-500 hover:bg-rose-50 dark:bg-rose-900 dark:text-rose-400 dark:hover:bg-rose-800',
            )}
            onClick={() => updateNodeData(id, { mode: m })}
          >
            {m}
          </button>
        ))}
      </div>

      <span className="text-[10px] text-rose-500/60 dark:text-rose-400/60">
        {conditionCount === 0
          ? 'no conditions'
          : `${conditionCount} condition${conditionCount > 1 ? 's' : ''}`}
      </span>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-rose-500 !bg-rose-50 dark:!border-rose-400 dark:!bg-rose-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-rose-500 !bg-rose-50 dark:!border-rose-400 dark:!bg-rose-900"
      />
    </div>
  )
}
