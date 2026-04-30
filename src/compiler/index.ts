import type { Node, Edge } from '@xyflow/react'
import type { FieldType } from '@/types/fields'
import type { Operator } from '@/types/operators'
import type { FieldNodeData, OperatorNodeData, ValueNodeData, LogicNodeData } from '@/types/nodeData'
import { getField } from '@/types/fields'

// ── internal tree types ───────────────────────────────────────────────────────

interface SimpleCondition {
  kind: 'condition'
  field: string
  fieldType: FieldType
  operator: Operator
  value: string
  valueTo?: string
}

interface GroupCondition {
  kind: 'group'
  mode: 'AND' | 'OR'
  children: ConditionNode[]
}

type ConditionNode = SimpleCondition | GroupCondition

// ── public result type ────────────────────────────────────────────────────────

export interface CompileResult {
  sql:    string | null
  rest:   unknown
  errors: string[]
}

// ── recursive graph walker ────────────────────────────────────────────────────

function compileNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  errors: string[],
): ConditionNode | null {
  const node = nodes.find((n) => n.id === nodeId)
  if (!node) { errors.push(`Node ${nodeId} not found`); return null }

  // Logic node — collect all incoming branches
  if (node.type === 'logic') {
    const { mode } = node.data as LogicNodeData
    const incoming = edges.filter((e) => e.target === nodeId)
    if (incoming.length === 0) {
      errors.push('A Logic node has no conditions connected to it')
      return null
    }
    const children = incoming
      .map((e) => compileNode(e.source, nodes, edges, errors))
      .filter((c): c is ConditionNode => c !== null)
    if (children.length === 0) return null
    return { kind: 'group', mode, children }
  }

  // Value node — walk back to Operator → Field
  if (node.type === 'value') {
    const { value, valueTo } = node.data as ValueNodeData

    const opEdge = edges.find((e) => e.target === nodeId)
    if (!opEdge) { errors.push('A Value node is not connected to an Operator'); return null }

    const opNode = nodes.find((n) => n.id === opEdge.source)
    if (!opNode || opNode.type !== 'operator') {
      errors.push('A Value node is not preceded by an Operator')
      return null
    }

    const { operator } = opNode.data as OperatorNodeData
    if (!operator) { errors.push('An Operator node has no comparator selected'); return null }

    const fieldEdge = edges.find((e) => e.target === opNode.id)
    if (!fieldEdge) { errors.push('An Operator node is not connected to a Field'); return null }

    const fieldNode = nodes.find((n) => n.id === fieldEdge.source)
    if (!fieldNode || fieldNode.type !== 'field') {
      errors.push('An Operator node is not preceded by a Field')
      return null
    }

    const { fieldId } = fieldNode.data as FieldNodeData
    if (!fieldId) { errors.push('A Field node has no column selected'); return null }

    const field = getField(fieldId)
    if (!field) { errors.push(`Unknown field: ${fieldId}`); return null }

    if (!value) { errors.push(`Value for "${field.label}" is empty`); return null }
    if (operator === 'BETWEEN' && !valueTo) {
      errors.push(`Upper bound for "${field.label} BETWEEN" is empty`)
      return null
    }

    return {
      kind:      'condition',
      field:     field.id,
      fieldType: field.type,
      operator,
      value,
      valueTo:   operator === 'BETWEEN' ? (valueTo ?? undefined) : undefined,
    }
  }

  errors.push(`Unexpected node type "${node.type}" in graph`)
  return null
}

// ── SQL emitter ───────────────────────────────────────────────────────────────

function sqlValue(raw: string, type: FieldType): string {
  if (type === 'number') return raw
  return `'${raw.replace(/'/g, "''")}'`
}

function toSQL(node: ConditionNode, depth = 0): string {
  const childIndent = '  '.repeat(depth + 1)
  const closeIndent = '  '.repeat(depth)

  if (node.kind === 'group') {
    if (node.children.length === 1) return toSQL(node.children[0], depth)
    const children = node.children.map((c) => toSQL(c, depth + 1))
    const joined   = children.join(`\n${childIndent}${node.mode} `)
    return `(\n${childIndent}${joined}\n${closeIndent})`
  }

  const col = `"${node.field}"`
  if (node.operator === 'IN') {
    const list = node.value
      .split(',')
      .map((v) => sqlValue(v.trim(), node.fieldType))
      .join(', ')
    return `${col} IN (${list})`
  }
  if (node.operator === 'BETWEEN') {
    return `${col} BETWEEN ${sqlValue(node.value, node.fieldType)} AND ${sqlValue(node.valueTo!, node.fieldType)}`
  }
  return `${col} ${node.operator} ${sqlValue(node.value, node.fieldType)}`
}

// ── REST filter emitter ───────────────────────────────────────────────────────

const OP_MAP: Record<Operator, string> = {
  '=':       'eq',
  '!=':      'neq',
  '>':       'gt',
  '>=':      'gte',
  '<':       'lt',
  '<=':      'lte',
  'IN':      'in',
  'BETWEEN': 'between',
}

function coerce(raw: string, type: FieldType): string | number {
  return type === 'number' ? parseFloat(raw) : raw
}

function toREST(node: ConditionNode): unknown {
  if (node.kind === 'group') {
    return { [node.mode]: node.children.map(toREST) }
  }
  const opKey = OP_MAP[node.operator]
  let val: unknown
  if (node.operator === 'IN') {
    val = node.value.split(',').map((v) => coerce(v.trim(), node.fieldType))
  } else if (node.operator === 'BETWEEN') {
    val = [coerce(node.value, node.fieldType), coerce(node.valueTo!, node.fieldType)]
  } else {
    val = coerce(node.value, node.fieldType)
  }
  return { [node.field]: { [opKey]: val } }
}

// ── public entry point ────────────────────────────────────────────────────────

export function compileGraph(nodes: Node[], edges: Edge[]): CompileResult {
  const errors: string[] = []

  const root = nodes.find((n) => n.type === 'root')
  if (!root) return { sql: null, rest: null, errors: ['No Root node found'] }

  const incoming = edges.filter((e) => e.target === root.id)
  if (incoming.length === 0) return { sql: null, rest: null, errors: [] }

  let tree: ConditionNode | null

  if (incoming.length === 1) {
    tree = compileNode(incoming[0].source, nodes, edges, errors)
  } else {
    // multiple direct edges into Root → implicit AND
    const children = incoming
      .map((e) => compileNode(e.source, nodes, edges, errors))
      .filter((c): c is ConditionNode => c !== null)
    tree = { kind: 'group', mode: 'AND', children }
  }

  if (errors.length > 0 || !tree) return { sql: null, rest: null, errors }

  return {
    sql:    `WHERE ${toSQL(tree)}`,
    rest:   toREST(tree),
    errors: [],
  }
}
