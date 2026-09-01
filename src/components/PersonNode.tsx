import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

import type { PersonNodeData } from '../graph/graph-projection'

type PersonGraphNode = Node<PersonNodeData, 'person'>

function PersonNode({ data, selected }: NodeProps<PersonGraphNode>) {
  const genderLabel = data.gender === 'woman' ? 'Frau' : data.gender === 'man' ? 'Mann' : 'Nicht angegeben'

  return (
    <div className={`person-node nopan${selected ? ' person-node--selected' : ''}`}>
      <Handle className="person-handle" type="target" position={Position.Top} id="target-top" />
      <div className="person-node-header">
        <span className="person-node-glyph" aria-hidden="true">
          {data.gender === 'woman' ? 'W' : data.gender === 'man' ? 'M' : '?'}
        </span>
        <span className="person-node-gender">{genderLabel}</span>
      </div>
      <strong>{data.label}</strong>
      <span className="person-node-years">{data.years}</span>
      <Handle className="person-handle" type="source" position={Position.Bottom} id="source-bottom" />
    </div>
  )
}

export default PersonNode