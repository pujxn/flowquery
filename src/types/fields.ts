export type FieldType = 'string' | 'number' | 'date'

export interface FieldDefinition {
  id: string
  label: string
  type: FieldType
}

export const FIELDS: FieldDefinition[] = [
  { id: 'amount',     label: 'Amount',     type: 'number' },
  { id: 'quantity',   label: 'Quantity',   type: 'number' },
  { id: 'status',     label: 'Status',     type: 'string' },
  { id: 'region',     label: 'Region',     type: 'string' },
  { id: 'created_at', label: 'Created At', type: 'date'   },
]

export function getField(id: string): FieldDefinition | undefined {
  return FIELDS.find((f) => f.id === id)
}
