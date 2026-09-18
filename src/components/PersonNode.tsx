import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

import type { PersonNodeData } from '../graph/graph-projection'
import { relationshipHandleIds } from '../graph/relationship-connection'

type PersonGraphNode = Node<PersonNodeData, 'person'>

function PersonNode({ data, selected }: NodeProps<PersonGraphNode>) {
  const isSelected = selected || data.selected
  const genderClass = data.gender === 'woman'
    ? 'person-node--woman'
    : data.gender === 'man'
      ? 'person-node--man'
      : 'person-node--unknown'
  const isMinor = data.isMinor && data.gender !== null
  const nodeClasses = [
    'person-node',
    'nopan',
    genderClass,
    isMinor ? 'person-node--minor' : '',
    data.isCommonChild ? 'person-node--common-child' : '',
    isSelected ? 'person-node--selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={nodeClasses}>
      <Handle
        className="person-handle"
        type="target"
        position={Position.Top}
        id={relationshipHandleIds.childTarget}
      />
      {data.gender === 'woman' && (
        <Handle
          aria-label="Eheverbindung"
          className="person-handle person-handle--marriage"
          type="source"
          position={Position.Left}
          id={relationshipHandleIds.marriageSide}
        />
      )}
      {data.gender === 'man' && (
        <Handle
          aria-label="Eheverbindung"
          className="person-handle person-handle--marriage"
          type="source"
          position={Position.Right}
          id={relationshipHandleIds.marriageSide}
        />
      )}
      <strong className="person-node-name">{`${data.firstName}\n${data.lastName}`}</strong>
      <span className="person-node-years">{data.years}</span>
      <Handle
        className="person-handle"
        type="source"
        position={Position.Bottom}
        id={relationshipHandleIds.parentSource}
      />
    </div>
  )
}

export default PersonNode
