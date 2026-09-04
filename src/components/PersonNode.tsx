import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

import type { PersonNodeData } from '../graph/graph-projection'
import { relationshipHandleIds } from '../graph/relationship-connection'

type PersonGraphNode = Node<PersonNodeData, 'person'>

function PersonNode({ data, selected }: NodeProps<PersonGraphNode>) {
  const genderLabel = data.gender === 'woman' ? 'Frau' : data.gender === 'man' ? 'Mann' : 'Nicht angegeben'

  return (
    <div className={`person-node nopan${selected ? ' person-node--selected' : ''}`}>
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
      <div className="person-node-header">
        <span className="person-node-glyph" aria-hidden="true">
          {data.gender === 'woman' ? 'W' : data.gender === 'man' ? 'M' : '?'}
        </span>
        <span className="person-node-gender">{genderLabel}</span>
      </div>
      <strong>{data.label}</strong>
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
