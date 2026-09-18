import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ForceTreeView from './ForceTreeView'
import { projectFamilyTree } from '../graph/graph-projection'
import type { FamilyTreeDocument, Position } from '../domain/types'

const documentFixture: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    {
      id: 'parent',
      firstName: 'Anna',
      lastName: 'Test',
      gender: 'woman',
      birthYear: null,
      deathYear: null,
      position: null,
    },
    {
      id: 'child',
      firstName: 'Lina',
      lastName: 'Test',
      gender: 'woman',
      birthYear: null,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [
    {
      id: 'parent-child',
      type: 'parent-child',
      fromId: 'parent',
      toId: 'child',
      status: 'explicit',
      sourceUrl: null,
    },
  ],
}

describe('ForceTreeView', () => {
  it('reports a dragged node as a view-only position', async () => {
    const onManualPositionChange = vi.fn<(nodeId: string, position: Position) => void>()
    render(
      <ForceTreeView
        projection={projectFamilyTree(documentFixture)}
        positionOverrides={new Map()}
        onManualPositionChange={onManualPositionChange}
      />,
    )

    const person = await screen.findByText('Anna Test')
    const node = person.closest('.react-flow__node')
    expect(node).not.toBeNull()

    const dispatchMouseEvent = (
      target: EventTarget,
      type: string,
      init: MouseEventInit,
    ) => {
      const event = new MouseEvent(type, { ...init, bubbles: true, cancelable: true })
      Object.defineProperty(event, 'view', { value: window })
      target.dispatchEvent(event)
    }

    dispatchMouseEvent(node as HTMLElement, 'mousedown', { buttons: 1, clientX: 40, clientY: 40 })
    dispatchMouseEvent(document, 'mousemove', { buttons: 1, clientX: 180, clientY: 160 })
    dispatchMouseEvent(document, 'mouseup', { clientX: 180, clientY: 160 })

    await waitFor(() => expect(onManualPositionChange).toHaveBeenCalled())
    expect(onManualPositionChange).toHaveBeenCalledWith(
      'parent',
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    )
  })

  it('centers the viewport on an externally requested person', async () => {
    render(
      <ForceTreeView
        projection={projectFamilyTree(documentFixture)}
        positionOverrides={new Map()}
        onManualPositionChange={vi.fn()}
        focusPersonId="child"
        focusRequest={1}
      />,
    )

    await screen.findByText('Lina Test')
    const viewport = document.querySelector('.force-tree-view .react-flow__viewport') as HTMLElement
    const initialTransform = viewport.style.transform

    await waitFor(() => expect(viewport.style.transform).not.toBe(initialTransform))
  })
})
