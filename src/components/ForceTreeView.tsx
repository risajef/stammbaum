import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  type NodeChange,
  type NodePositionChange,
} from '@xyflow/react'

import type { Position } from '../domain/types'
import {
  createForceSimulation,
  forceNodePosition,
  type ForceSimulationNode,
} from '../graph/force-layout'
import type { GraphProjection } from '../graph/graph-projection'
import PersonNode from './PersonNode'
import ChildGroupNode from './ChildGroupNode'

const nodeTypes = { person: PersonNode, 'child-group': ChildGroupNode }
const proOptions = { hideAttribution: true }

type ForceGraphNode = GraphProjection['nodes'][number]

interface ForceTreeViewProps {
  projection: GraphProjection
  positionOverrides: ReadonlyMap<string, Position>
  onManualPositionChange: (nodeId: string, position: Position) => void
  focusPersonId?: string | null
  focusRequest?: number
}

const isPositionChange = (
  change: NodeChange<ForceGraphNode>,
): change is NodePositionChange => change.type === 'position' && Boolean(change.position)

function FocusPersonOnRequest({
  personId,
  request,
}: {
  personId: string | null | undefined
  request: number
}) {
  const { getNode, setCenter } = useReactFlow()

  useEffect(() => {
    if (!personId || request === 0) {
      return
    }

    const node = getNode(personId)
    if (!node) {
      return
    }

    const nodeWidth = node.measured?.width ?? node.width ?? 148
    const nodeHeight = node.measured?.height ?? node.height ?? 88
    void setCenter(
      node.position.x + nodeWidth / 2,
      node.position.y + nodeHeight / 2,
      { zoom: 1.05, duration: 180 },
    )
  }, [getNode, personId, request, setCenter])

  return null
}

function ForceTreeView({
  projection,
  positionOverrides,
  onManualPositionChange,
  focusPersonId = null,
  focusRequest = 0,
}: ForceTreeViewProps) {
  const [nodes, setNodes] = useState<ForceGraphNode[]>(projection.nodes)
  const simulationRef = useRef<ReturnType<typeof createForceSimulation> | null>(null)
  const simulationNodesRef = useRef<Map<string, ForceSimulationNode>>(new Map())

  const graphKey = useMemo(
    () => JSON.stringify({
      nodes: projection.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: String(node.data.label ?? ''),
      })),
      edges: projection.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    }),
    [projection],
  )
  const positionKey = useMemo(
    () => JSON.stringify([...positionOverrides.entries()].sort(([first], [second]) =>
      first.localeCompare(second))),
    [positionOverrides],
  )

  useEffect(() => {
    const forceNodes = projection.nodes.map((node) => ({
      id: node.id,
      position: node.position,
    }))
    const forceLinks = projection.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }))
    const forceSimulation = createForceSimulation({
      nodes: forceNodes,
      links: forceLinks,
      positionOverrides,
    })
    const simulationNodes = new Map(
      forceSimulation.nodes.map((node) => [node.id, node]),
    )

    positionOverrides.forEach((position, nodeId) => {
      const simulationNode = simulationNodes.get(nodeId)
      if (!simulationNode) return

      simulationNode.fx = position.x + simulationNode.width / 2
      simulationNode.fy = position.y + simulationNode.height / 2
    })

    simulationRef.current?.simulation.stop()
    simulationRef.current = forceSimulation
    simulationNodesRef.current = simulationNodes

    const renderNodes = () => {
      setNodes(
        projection.nodes.map((node) => {
          const simulationNode = simulationNodes.get(node.id)
          return simulationNode
            ? { ...node, position: forceNodePosition(simulationNode) }
            : node
        }),
      )
    }

    forceSimulation.simulation.on('tick', renderNodes)
    renderNodes()

    return () => {
      forceSimulation.simulation.on('tick', null)
      forceSimulation.simulation.stop()
      if (simulationRef.current === forceSimulation) {
        simulationRef.current = null
        simulationNodesRef.current = new Map()
      }
    }
  }, [graphKey, positionKey, positionOverrides, projection])

  const syncSimulationNode = useCallback((node: ForceGraphNode) => {
    const simulationNode = simulationNodesRef.current.get(node.id)
    if (!simulationNode) return

    simulationNode.x = node.position.x + simulationNode.width / 2
    simulationNode.y = node.position.y + simulationNode.height / 2
    simulationNode.fx = simulationNode.x
    simulationNode.fy = simulationNode.y
  }, [])

  const handleNodesChange = useCallback((changes: NodeChange<ForceGraphNode>[]) => {
    const positionChanges = changes.filter(isPositionChange)
    if (positionChanges.length === 0) return

    setNodes((current) => current.map((node) => {
      const change = positionChanges.find((candidate) => candidate.id === node.id)
      return change?.position ? { ...node, position: change.position } : node
    }))

    positionChanges.forEach((change) => {
      const simulationNode = simulationNodesRef.current.get(change.id)
      if (!simulationNode || !change.position) return

      simulationNode.x = change.position.x + simulationNode.width / 2
      simulationNode.y = change.position.y + simulationNode.height / 2
      simulationNode.fx = simulationNode.x
      simulationNode.fy = simulationNode.y
    })
  }, [])

  const handleNodeDragStart = useCallback((_event: MouseEvent | TouchEvent, node: ForceGraphNode) => {
    syncSimulationNode(node)
    simulationRef.current?.simulation.alphaTarget(0.24).restart()
  }, [syncSimulationNode])

  const handleNodeDrag = useCallback((_event: MouseEvent | TouchEvent, node: ForceGraphNode) => {
    syncSimulationNode(node)
  }, [syncSimulationNode])

  const handleNodeDragStop = useCallback((_event: MouseEvent | TouchEvent, node: ForceGraphNode) => {
    syncSimulationNode(node)
    onManualPositionChange(node.id, { ...node.position })
    simulationRef.current?.simulation.alphaTarget(0)
  }, [onManualPositionChange, syncSimulationNode])

  return (
    <div className="force-tree-view" data-testid="force-tree-view">
      <ReactFlow
        nodes={nodes}
        edges={projection.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={projection.fitViewOptions}
        minZoom={0.01}
        maxZoom={1.4}
        nodesConnectable={false}
        nodesDraggable
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        edgesReconnectable={false}
        panOnDrag
        onNodesChange={handleNodesChange}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        proOptions={proOptions}
      >
        <FocusPersonOnRequest personId={focusPersonId} request={focusRequest} />
        <Background color="#d9d0c2" gap={24} size={1} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  )
}

export default ForceTreeView
