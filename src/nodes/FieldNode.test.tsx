import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { NodeProps } from '@xyflow/react'
import { FieldNode } from './FieldNode'

const mockUpdateNodeData = vi.fn()

vi.mock('@/store/graphStore', () => ({
  useGraphStore: (selector: (s: unknown) => unknown) =>
    selector({ updateNodeData: mockUpdateNodeData }),
}))

vi.mock('@/hooks/useSchema', () => ({
  useSchema: () => ({
    data: [
      { id: 'amount', label: 'Amount', type: 'number' },
      { id: 'status', label: 'Status', type: 'string' },
    ],
  }),
}))

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Right: 'right', Left: 'left', Top: 'top', Bottom: 'bottom' },
}))

const baseProps = {
  id: 'f1',
  data: { fieldId: null },
  selected: false,
} as unknown as NodeProps

describe('FieldNode', () => {
  beforeEach(() => {
    mockUpdateNodeData.mockClear()
  })

  it('renders without crashing', () => {
    render(<FieldNode {...baseProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays all field labels from the schema', () => {
    render(<FieldNode {...baseProps} />)
    expect(screen.getByRole('option', { name: 'Amount' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Status' })).toBeInTheDocument()
  })

  it('reflects the current fieldId as the selected value', () => {
    render(
      <FieldNode
        {...baseProps}
        data={{ fieldId: 'amount' }}
      />,
    )
    expect(screen.getByRole('combobox')).toHaveValue('amount')
  })

  it('calls updateNodeData with the new fieldId when selection changes', () => {
    render(<FieldNode {...baseProps} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'amount' } })
    expect(mockUpdateNodeData).toHaveBeenCalledWith('f1', { fieldId: 'amount' })
  })

  it('calls updateNodeData with null when selection is cleared', () => {
    render(<FieldNode {...{ ...baseProps, data: { fieldId: 'amount' } }} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    expect(mockUpdateNodeData).toHaveBeenCalledWith('f1', { fieldId: null })
  })
})
