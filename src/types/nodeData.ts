import { z } from 'zod'
import type { Operator } from './operators'

export const rootNodeDataSchema = z.object({
  label: z.string(),
})

export const fieldNodeDataSchema = z.object({
  fieldId: z.string().nullable(),
})

export const operatorNodeDataSchema = z.object({
  operator: z
    .enum(['=', '!=', '>', '>=', '<', '<=', 'IN', 'BETWEEN'])
    .nullable() as z.ZodNullable<z.ZodType<Operator>>,
})

export const valueNodeDataSchema = z.object({
  value: z.union([z.string(), z.number()]).nullable(),
})

export const logicNodeDataSchema = z.object({
  mode: z.enum(['AND', 'OR']),
})

export type RootNodeData    = z.infer<typeof rootNodeDataSchema>
export type FieldNodeData   = z.infer<typeof fieldNodeDataSchema>
export type OperatorNodeData = z.infer<typeof operatorNodeDataSchema>
export type ValueNodeData   = z.infer<typeof valueNodeDataSchema>
export type LogicNodeData   = z.infer<typeof logicNodeDataSchema>
