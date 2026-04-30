import type { NodeTypes } from '@xyflow/react'
import { RootNode }     from './RootNode'
import { FieldNode }    from './FieldNode'
import { OperatorNode } from './OperatorNode'
import { ValueNode }    from './ValueNode'

export const nodeTypes: NodeTypes = {
  root:     RootNode,
  field:    FieldNode,
  operator: OperatorNode,
  value:    ValueNode,
}
