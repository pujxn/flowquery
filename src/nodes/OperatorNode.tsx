import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'
import { getField } from '@/types/fields'
import { OPERATORS_BY_TYPE, ALL_OPERATORS, type Operator } from '@/types/operators'
import { cn } from '@/lib/utils'

function useConnectedField(nodeId: string) {
  return useGraphStore((s) => {
    const edge = s.edges.find((e) => e.target === nodeId)
    if (!edge) return undefined
    const source = s.nodes.find((n) => n.id === edge.source)
    if (!source || source.type !== 'field') return undefined
    return getField(source.data.fieldId as string)
  })
}

export function OperatorNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const field = useConnectedField(id)
  const operator = (data.operator as Operator | null) ?? ''
  const availableOps = field ? OPERATORS_BY_TYPE[field.type] : ALL_OPERATORS

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border-2 shadow-md min-w-40',
        'bg-amber-950 text-amber-100 border-amber-600',
        selected && 'ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
        Operator
      </span>
      {field && (
        <span className="text-[11px] text-amber-400/60 -mt-0.5">{field.label}</span>
      )}
      <select
        className="nodrag nopan bg-amber-900 border border-amber-700 rounded-lg px-2 py-1 text-sm text-amber-100 focus:outline-none focus:border-amber-400 cursor-pointer"
        value={operator}
        onChange={(e) =>
          updateNodeData(id, { operator: e.target.value || null })
        }
      >
        <option value="">Select operator…</option>
        {availableOps.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-amber-400 !bg-amber-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-amber-400 !bg-amber-900"
      />
    </div>
  )
}
