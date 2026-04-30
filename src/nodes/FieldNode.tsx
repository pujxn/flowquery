import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'
import { useSchema } from '@/hooks/useSchema'
import { FIELDS } from '@/types/fields'
import { cn } from '@/lib/utils'

export function FieldNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const fieldId = (data.fieldId as string | null) ?? ''
  const { data: schemaFields } = useSchema()
  const fields = schemaFields ?? FIELDS

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border-2 shadow-md min-w-40',
        'bg-emerald-50 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-600',
        selected && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-900',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
        Field
      </span>
      <select
        className="nodrag nopan bg-white border border-emerald-300 rounded-lg px-2 py-1 text-sm text-emerald-900 focus:outline-none focus:border-emerald-500 cursor-pointer dark:bg-emerald-900 dark:border-emerald-700 dark:text-emerald-100 dark:focus:border-emerald-400"
        value={fieldId}
        onChange={(e) =>
          updateNodeData(id, { fieldId: e.target.value || null })
        }
      >
        <option value="">Select field…</option>
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-emerald-500 !bg-emerald-50 dark:!border-emerald-400 dark:!bg-emerald-900"
      />
    </div>
  )
}
