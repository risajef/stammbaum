import { render } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

import PersonNode from './PersonNode'
import type { PersonNodeData } from '../graph/graph-projection'

const data: PersonNodeData = {
  personId: 'person-1',
  firstName: 'Anna',
  lastName: 'Weber',
  label: 'Anna Weber',
  years: '1834 - 1901',
  gender: 'woman',
  isMinor: false,
  isCommonChild: false,
  selected: false,
  comment: 'Personennotiz',
}

describe('PersonNode', () => {
  it('shows a person comment as a hover title', () => {
    const { container } = render(
      <ReactFlowProvider>
        <PersonNode
          id="person-1"
          data={data}
          type="person"
          dragging={false}
          zIndex={0}
          selectable
          deletable
          selected={false}
          draggable
          isConnectable
          positionAbsoluteX={0}
          positionAbsoluteY={0}
        />
      </ReactFlowProvider>,
    )

    expect(container.querySelector('.person-node')).toHaveAttribute('title', 'Personennotiz')
  })
})
