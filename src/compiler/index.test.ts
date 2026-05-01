import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import { compileGraph } from './index'
import { FIELDS } from '@/types/fields'

const n = (id: string, type: string, data: Record<string, unknown>): Node => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data,
})

const e = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
})

const ROOT  = n('root', 'root', { label: 'ROOT' })

describe('compileGraph', () => {
  it('single condition: field + operator + value', () => {
    const nodes = [
      ROOT,
      n('f1', 'field',    { fieldId: 'amount' }),
      n('op1', 'operator', { operator: '>' }),
      n('v1', 'value',    { value: '100', valueTo: null }),
    ]
    const edges = [
      e('e1', 'f1', 'op1'),
      e('e2', 'op1', 'v1'),
      e('e3', 'v1', 'root'),
    ]
    const result = compileGraph(nodes, edges, FIELDS)
    expect(result.errors).toHaveLength(0)
    expect(result.sql).toBe('WHERE "amount" > 100')
    expect(result.rest).toEqual({ amount: { gt: 100 } })
  })

  it('two conditions joined by AND', () => {
    const nodes = [
      ROOT,
      n('f1',     'field',    { fieldId: 'amount' }),
      n('op1',    'operator', { operator: '>' }),
      n('v1',     'value',    { value: '100', valueTo: null }),
      n('f2',     'field',    { fieldId: 'status' }),
      n('op2',    'operator', { operator: '=' }),
      n('v2',     'value',    { value: 'active', valueTo: null }),
      n('logic1', 'logic',    { mode: 'AND' }),
    ]
    const edges = [
      e('e1', 'f1',     'op1'),
      e('e2', 'op1',    'v1'),
      e('e3', 'v1',     'logic1'),
      e('e4', 'f2',     'op2'),
      e('e5', 'op2',    'v2'),
      e('e6', 'v2',     'logic1'),
      e('e7', 'logic1', 'root'),
    ]
    const result = compileGraph(nodes, edges, FIELDS)
    expect(result.errors).toHaveLength(0)
    expect(result.sql).toBe(
      `WHERE (\n  "amount" > 100\n  AND "status" = 'active'\n)`,
    )
    expect(result.rest).toEqual({
      AND: [{ amount: { gt: 100 } }, { status: { eq: 'active' } }],
    })
  })

  it('two conditions joined by OR', () => {
    const nodes = [
      ROOT,
      n('f1',     'field',    { fieldId: 'amount' }),
      n('op1',    'operator', { operator: '<' }),
      n('v1',     'value',    { value: '50', valueTo: null }),
      n('f2',     'field',    { fieldId: 'region' }),
      n('op2',    'operator', { operator: '=' }),
      n('v2',     'value',    { value: 'east', valueTo: null }),
      n('logic1', 'logic',    { mode: 'OR' }),
    ]
    const edges = [
      e('e1', 'f1',     'op1'),
      e('e2', 'op1',    'v1'),
      e('e3', 'v1',     'logic1'),
      e('e4', 'f2',     'op2'),
      e('e5', 'op2',    'v2'),
      e('e6', 'v2',     'logic1'),
      e('e7', 'logic1', 'root'),
    ]
    const result = compileGraph(nodes, edges, FIELDS)
    expect(result.errors).toHaveLength(0)
    expect(result.sql).toBe(
      `WHERE (\n  "amount" < 50\n  OR "region" = 'east'\n)`,
    )
    expect(result.rest).toEqual({
      OR: [{ amount: { lt: 50 } }, { region: { eq: 'east' } }],
    })
  })

  it('incomplete graph: missing field selection returns error', () => {
    const nodes = [
      ROOT,
      n('f1',  'field',    { fieldId: null }),
      n('op1', 'operator', { operator: '=' }),
      n('v1',  'value',    { value: '100', valueTo: null }),
    ]
    const edges = [
      e('e1', 'f1',  'op1'),
      e('e2', 'op1', 'v1'),
      e('e3', 'v1',  'root'),
    ]
    const result = compileGraph(nodes, edges, FIELDS)
    expect(result.sql).toBeNull()
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('empty graph: nothing connected to root returns no errors', () => {
    const result = compileGraph([ROOT], [], FIELDS)
    expect(result.sql).toBeNull()
    expect(result.errors).toHaveLength(0)
  })
})
