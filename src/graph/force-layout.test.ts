import { describe, expect, it } from 'vitest'

import {
  createForceSimulation,
  forceNodePosition,
  type ForceLayoutLink,
  type ForceLayoutNode,
} from './force-layout'

const nodes: ForceLayoutNode[] = [
  { id: 'parent', position: { x: 40, y: 40 } },
  { id: 'child', position: { x: 300, y: 40 } },
  { id: 'unconnected', position: { x: 160, y: 260 } },
]

const links: ForceLayoutLink[] = [
  { source: 'parent', target: 'child' },
]

describe('force-directed graph layout', () => {
  it('keeps stable ids, uses starting positions, and produces separated finite positions', () => {
    const { simulation, nodes: simulationNodes } = createForceSimulation({
      nodes,
      links,
      center: { x: 260, y: 180 },
    })
    const initialParent = simulationNodes.find((node) => node.id === 'parent')

    expect(initialParent).toMatchObject({ x: 114, y: 84 })

    simulation.stop()
    simulation.tick(80)

    expect(simulationNodes.map((node) => node.id)).toEqual(['parent', 'child', 'unconnected'])
    simulationNodes.forEach((node) => {
      expect(Number.isFinite(node.x)).toBe(true)
      expect(Number.isFinite(node.y)).toBe(true)
    })

    const parent = simulationNodes.find((node) => node.id === 'parent')
    const child = simulationNodes.find((node) => node.id === 'child')
    expect(parent).toBeDefined()
    expect(child).toBeDefined()
    expect(Math.hypot((parent?.x ?? 0) - (child?.x ?? 0), (parent?.y ?? 0) - (child?.y ?? 0)))
      .toBeGreaterThan(80)
    expect(forceNodePosition(parent!)).toEqual({
      x: expect.any(Number),
      y: expect.any(Number),
    })
  })
})
