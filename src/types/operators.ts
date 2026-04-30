import type { FieldType } from './fields'

export type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'BETWEEN'

export const ALL_OPERATORS: Operator[] = ['=', '!=', '>', '>=', '<', '<=', 'IN', 'BETWEEN']

export const OPERATORS_BY_TYPE: Record<FieldType, Operator[]> = {
  string: ['=', '!=', 'IN'],
  number: ['=', '!=', '>', '>=', '<', '<=', 'IN', 'BETWEEN'],
  date:   ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN'],
}
