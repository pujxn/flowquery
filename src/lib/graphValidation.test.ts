import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import { isConnectionAllowed } from './graphValidation'

const node = (id: string, type: string): Node => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: {},
})

const edge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
})

describe('isConnectionAllowed', () => {
  it('allows a valid Field → Operator connection', () => {
    const nodes = [node('f1', 'field'), node('op1', 'operator')]
    expect(
      isConnectionAllowed(
        { source: 'f1', target: 'op1', sourceHandle: null, targetHandle: null },
        nodes,
        [],
      ),
    ).toBe(true)
  })

  it('allows a valid Value → Root connection', () => {
    const nodes = [node('v1', 'value'), node('root', 'root')]
    expect(
      isConnectionAllowed(
        { source: 'v1', target: 'root', sourceHandle: null, targetHandle: null },
        nodes,
        [],
      ),
    ).toBe(true)
  })

  it('rejects Field → Logic (skipping Operator and Value)', () => {
    const nodes = [node('f1', 'field'), node('logic1', 'logic')]
    expect(
      isConnectionAllowed(
        { source: 'f1', target: 'logic1', sourceHandle: null, targetHandle: null },
        nodes,
        [],
      ),
    ).toBe(false)
  })

  it('rejects Field → Root (skipping all intermediate nodes)', () => {
    const nodes = [node('f1', 'field'), node('root', 'root')]
    expect(
      isConnectionAllowed(
        { source: 'f1', target: 'root', sourceHandle: null, targetHandle: null },
        nodes,
        [],
      ),
    ).toBe(false)
  })

  it('rejects Operator → Root (skipping Value)', () => {
    const nodes = [node('op1', 'operator'), node('root', 'root')]
    expect(
      isConnectionAllowed(
        { source: 'op1', target: 'root', sourceHandle: null, targetHandle: null },
        nodes,
        [],
      ),
    ).toBe(false)
  })

  it('rejects a duplicate edge', () => {
    const nodes = [node('f1', 'field'), node('op1', 'operator')]
    expect(
      isConnectionAllowed(
        { source: 'f1', target: 'op1', sourceHandle: null, targetHandle: null },
        nodes,
        [edge('f1', 'op1')],
      ),
    ).toBe(false)
  })

  it('detects a cycle via Logic → Logic back edge', () => {
    // Existing: logic2 → logic1; proposed: logic1 → logic2 would form a cycle
    const nodes = [node('logic1', 'logic'), node('logic2', 'logic')]
    expect(
      isConnectionAllowed(
        { source: 'logic1', target: 'logic2', sourceHandle: null, targetHandle: null },
        nodes,
        [edge('logic2', 'logic1')],
      ),
    ).toBe(false)
  })

  it('passes a valid connection in a partially built graph', () => {
    // f1→op1 already exists; proposing op1→v1
    const nodes = [
      node('f1', 'field'),
      node('op1', 'operator'),
      node('v1', 'value'),
      node('root', 'root'),
    ]
    expect(
      isConnectionAllowed(
        { source: 'op1', target: 'v1', sourceHandle: null, targetHandle: null },
        nodes,
        [edge('f1', 'op1')],
      ),
    ).toBe(true)
  })
})
