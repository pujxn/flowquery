import { useMemo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { z } from 'zod'
import { useGraphStore } from '@/store/graphStore'
import { getField, type FieldType } from '@/types/fields'
import type { Operator } from '@/types/operators'
import { cn } from '@/lib/utils'

// ── validation ────────────────────────────────────────────────────────────────

function fieldValidator(type: FieldType) {
  switch (type) {
    case 'number': return z.coerce.number({ error: 'Must be a number' })
    case 'date':   return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use YYYY-MM-DD' })
    case 'string': return z.string().min(1, { message: 'Cannot be empty' })
  }
}

function validateSingle(raw: string, type: FieldType): string | null {
  const result = fieldValidator(type).safeParse(raw.trim())
  return result.success ? null : result.error.issues[0].message
}

function validateValue(raw: string, type: FieldType, operator: Operator | null): string | null {
  if (!raw.trim()) return null
  if (operator === 'IN') {
    const items = raw.split(',').map((s) => s.trim()).filter(Boolean)
    for (const item of items) {
      const err = validateSingle(item, type)
      if (err) return err
    }
    return null
  }
  return validateSingle(raw, type)
}

// ── upstream context ──────────────────────────────────────────────────────────
// Two separate selectors returning primitives/stable refs so Zustand's
// Object.is check doesn't see a new object every render and loop infinitely.

function useUpstreamOperator(nodeId: string): Operator | null {
  return useGraphStore((s) => {
    const opEdge = s.edges.find((e) => e.target === nodeId)
    if (!opEdge) return null
    const opNode = s.nodes.find((n) => n.id === opEdge.source)
    if (!opNode || opNode.type !== 'operator') return null
    return (opNode.data.operator as Operator | null) ?? null
  })
}

function useUpstreamField(nodeId: string) {
  return useGraphStore((s) => {
    const opEdge = s.edges.find((e) => e.target === nodeId)
    if (!opEdge) return undefined
    const opNode = s.nodes.find((n) => n.id === opEdge.source)
    if (!opNode || opNode.type !== 'operator') return undefined
    const fieldEdge = s.edges.find((e) => e.target === opNode.id)
    const fieldNode = fieldEdge ? s.nodes.find((n) => n.id === fieldEdge.source) : undefined
    if (!fieldNode || fieldNode.type !== 'field') return undefined
    return getField(fieldNode.data.fieldId as string) // stable ref from FIELDS array
  })
}

// ── component ─────────────────────────────────────────────────────────────────

const inputBase =
  'nodrag nopan w-full bg-sky-900 border border-sky-700 rounded-lg px-2 py-1 text-sm text-sky-100 placeholder:text-sky-700 focus:outline-none focus:border-sky-400'

export function ValueNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const operator = useUpstreamOperator(id)
  const field    = useUpstreamField(id)

  const value   = (data.value   as string) ?? ''
  const valueTo = (data.valueTo as string) ?? ''

  const isBetween = operator === 'BETWEEN'
  const isIn      = operator === 'IN'
  const inputType = field?.type === 'number' ? 'number'
                  : field?.type === 'date'   ? 'date'
                  : 'text'

  const error = useMemo(
    () => (field && value   ? validateValue(value,   field.type, operator) : null),
    [field, value, operator],
  )
  const errorTo = useMemo(
    () => (field && valueTo ? validateSingle(valueTo, field.type)          : null),
    [field, valueTo],
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border-2 shadow-md min-w-44',
        'bg-sky-950 text-sky-100 border-sky-600',
        selected && 'ring-2 ring-sky-400 ring-offset-1 ring-offset-zinc-900',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-500">
        Value
      </span>
      {field && (
        <span className="text-[11px] text-sky-400/60 -mt-0.5">
          {field.label}{operator ? ` ${operator}` : ''}
        </span>
      )}

      {isBetween ? (
        <div className="flex flex-col gap-1">
          <input
            className={inputBase}
            type={inputType}
            placeholder="From"
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
          {error   && <p className="text-[10px] text-red-400 -mt-0.5">{error}</p>}
          <input
            className={inputBase}
            type={inputType}
            placeholder="To"
            value={valueTo}
            onChange={(e) => updateNodeData(id, { valueTo: e.target.value })}
          />
          {errorTo && <p className="text-[10px] text-red-400 -mt-0.5">{errorTo}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <input
            className={inputBase}
            type={isIn ? 'text' : inputType}
            placeholder={isIn ? 'val1, val2, …' : 'Enter value…'}
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
          {error && <p className="text-[10px] text-red-400 -mt-0.5">{error}</p>}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-sky-400 !bg-sky-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-sky-400 !bg-sky-900"
      />
    </div>
  )
}
