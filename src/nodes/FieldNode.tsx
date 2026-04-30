import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FIELDS } from '@/types/fields'
import { useGraphStore } from '@/store/graphStore'
import { cn } from '@/lib/utils'

export function FieldNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const fieldId = (data.fieldId as string | null) ?? ''

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border-2 shadow-md min-w-40',
        'bg-emerald-950 text-emerald-100 border-emerald-600',
        selected && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-900',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
        Field
      </span>
      <select
        className="nodrag nopan bg-emerald-900 border border-emerald-700 rounded-lg px-2 py-1 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 cursor-pointer"
        value={fieldId}
        onChange={(e) =>
          updateNodeData(id, { fieldId: e.target.value || null })
        }
      >
        <option value="">Select field…</option>
        {FIELDS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-emerald-400 !bg-emerald-900"
      />
    </div>
  )
}
