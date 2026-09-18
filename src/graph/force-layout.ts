import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'

import type { Position } from '../domain/types'

export interface ForceLayoutNode {
  id: string
  position: Position
}

export interface ForceLayoutLink extends SimulationLinkDatum<ForceSimulationNode> {
  source: string
  target: string
}

export interface ForceSimulationNode extends SimulationNodeDatum {
  id: string
  width: number
  height: number
}

export interface ForceLayoutOptions {
  nodes: readonly ForceLayoutNode[]
  links: readonly ForceLayoutLink[]
  center?: Position
  positionOverrides?: ReadonlyMap<string, Position>
}

export interface ForceSimulation {
  simulation: Simulation<ForceSimulationNode, ForceLayoutLink>
  nodes: ForceSimulationNode[]
}

export const forceNodeSize = {
  width: 148,
  height: 88,
} as const

const forceNodeRadius = Math.hypot(forceNodeSize.width / 2, forceNodeSize.height / 2) + 12

export const createForceSimulation = ({
  nodes,
  links,
  center = { x: 0, y: 0 },
  positionOverrides = new Map(),
}: ForceLayoutOptions): ForceSimulation => {
  const simulationNodes = nodes.map<ForceSimulationNode>((node) => {
    const position = positionOverrides.get(node.id) ?? node.position
    return {
      id: node.id,
      x: position.x + forceNodeSize.width / 2,
      y: position.y + forceNodeSize.height / 2,
      width: forceNodeSize.width,
      height: forceNodeSize.height,
    }
  })
  const simulationLinks = links.map((link) => ({ ...link }))

  const simulation = forceSimulation(simulationNodes)
    .force(
      'link',
      forceLink<ForceSimulationNode, ForceLayoutLink>(simulationLinks)
        .id((node) => node.id)
        .distance(180)
        .strength(0.55),
    )
    .force('charge', forceManyBody<ForceSimulationNode>().strength(-420).distanceMax(1000))
    .force('center', forceCenter(center.x, center.y).strength(0.08))
    .force('collision', forceCollide<ForceSimulationNode>().radius(forceNodeRadius).strength(0.9))
    .alpha(0.9)
    .alphaDecay(0.028)
    .velocityDecay(0.4)

  return { simulation, nodes: simulationNodes }
}

export const forceNodePosition = (node: ForceSimulationNode): Position => {
  const x = node.x ?? 0
  const y = node.y ?? 0

  return {
    x: (Number.isFinite(x) ? x : 0) - node.width / 2,
    y: (Number.isFinite(y) ? y : 0) - node.height / 2,
  }
}
