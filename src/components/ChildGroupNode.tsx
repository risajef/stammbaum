import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

import type { ChildGroupNodeData } from '../graph/graph-projection'
import { relationshipHandleIds } from '../graph/relationship-connection'

type ChildGroupGraphNode = Node<ChildGroupNodeData, 'child-group'>

function ChildGroupNode({ data, selected }: NodeProps<ChildGroupGraphNode>) {
  const isSelected = selected || data.selected
  const nodeClasses = [
    'child-group-node',
    'nopan',
    isSelected ? 'child-group-node--selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={nodeClasses}
      data-testid={`child-group-node-${data.groupId}`}
      aria-label={data.label}
    >
      <Handle
        className="child-group-handle"
        type="target"
        position={Position.Top}
        id={relationshipHandleIds.childTarget}
      />
      <Handle
        className="child-group-handle child-group-handle--marriage"
        type="target"
        position={Position.Left}
        id={relationshipHandleIds.marriageSide}
      />
      <Handle
        className="child-group-handle child-group-handle--marriage"
        type="source"
        position={Position.Right}
        id={relationshipHandleIds.marriageSide}
      />
      <strong>{data.label}</strong>
      <span className="child-group-node-caption">Gemeinsame Kinder</span>
      <Handle
        className="child-group-handle"
        type="source"
        position={Position.Bottom}
        id={relationshipHandleIds.parentSource}
      />
    </div>
  )
}

export default ChildGroupNode
