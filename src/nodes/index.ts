import type { NodeTypes } from '@xyflow/react'
import { RootNode } from './RootNode'
import { FieldNode } from './FieldNode'
import { OperatorNode } from './OperatorNode'

export const nodeTypes: NodeTypes = {
  root:     RootNode,
  field:    FieldNode,
  operator: OperatorNode,
}
