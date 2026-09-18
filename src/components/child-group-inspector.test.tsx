import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ChildGroupInspector from './ChildGroupInspector'

describe('ChildGroupInspector', () => {
  it('shows the child count and offers expanding the group', () => {
    const onExpand = vi.fn()

    render(
      <ChildGroupInspector
        group={{
          id: 'children-group:marriage',
          marriageId: 'marriage',
          childIds: ['child-a', 'child-b', 'child-c'],
        }}
        onExpand={onExpand}
      />,
    )

    expect(screen.getByRole('heading', { name: '3 Kinder' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Kinder auffächern' }))

    expect(onExpand).toHaveBeenCalledOnce()
  })
})
