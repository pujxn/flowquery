import type { NodeTypes } from '@xyflow/react'
import { RootNode } from './RootNode'
import { FieldNode } from './FieldNode'

export const nodeTypes: NodeTypes = {
  root:  RootNode,
  field: FieldNode,
}
