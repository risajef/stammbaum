import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  type Connection,
  type NodeChange,
} from '@xyflow/react'

import { createEmptyDocument, createPerson, updatePerson } from './domain/person'
import { synchronizeInferredRelationships } from './domain/inference'
import {
  createMarriage,
  createParentChild,
  removeRelationship,
  updateRelationship,
} from './domain/relationship'
import type {
  DomainError,
  FamilyTreeDocument,
  PersonDraft,
  Position,
  Relationship,
} from './domain/types'
import { projectFamilyTree, type GraphSelection } from './graph/graph-projection'
import PersonNode from './components/PersonNode'
import PersonInspector from './components/PersonInspector'
import RelationshipInspector, {
  type RelationshipFormDraft,
} from './components/RelationshipInspector'
import { createBrowserFilePort } from './persistence/file-port'
import { parseFamilyTreeYaml, serializeFamilyTreeYaml } from './persistence/yaml'

import '@xyflow/react/dist/style.css'

const nodeTypes = { person: PersonNode }
const proOptions = { hideAttribution: true }

interface ConnectionDraft {
  sourceId: string
  targetId: string
}

function FitViewOnPersonCount({ personCount }: { personCount: number }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    void fitView({ padding: 0.2, minZoom: 0.01, maxZoom: 1.4 })
  }, [fitView, personCount])

  return null
}

interface CenterPersonOnSaveProps {
  personId: string | null
  surfaceRef: React.RefObject<HTMLDivElement | null>
  onCentered: (personId: string, position: Position) => void
}

function CenterPersonOnSave({
  personId,
  surfaceRef,
  onCentered,
}: CenterPersonOnSaveProps) {
  const { fitView, getNode, screenToFlowPosition } = useReactFlow()

  useEffect(() => {
    if (!personId) {
      return
    }

    let isActive = true
    const centerPerson = async () => {
      await fitView({ padding: 0.2, minZoom: 0.01, maxZoom: 1.4 })
      if (!isActive) {
        return
      }

      const surface = surfaceRef.current
      const surfaceBounds = surface?.getBoundingClientRect()
      if (!surfaceBounds) {
        return
      }

      const flowCenter = screenToFlowPosition({
        x: surfaceBounds.left + surfaceBounds.width / 2,
        y: surfaceBounds.top + surfaceBounds.height / 2,
      })
      const node = getNode(personId)
      const nodeWidth = node?.measured?.width ?? node?.width ?? 148
      const nodeHeight = node?.measured?.height ?? node?.height ?? 88

      onCentered(personId, {
        x: Math.round(flowCenter.x - nodeWidth / 2),
        y: Math.round(flowCenter.y - nodeHeight / 2),
      })
    }

    void centerPerson()
    return () => {
      isActive = false
    }
  }, [fitView, getNode, onCentered, personId, screenToFlowPosition, surfaceRef])

  return null
}

function App() {
  const [document, setDocument] = useState<FamilyTreeDocument>(createEmptyDocument)
  const [selection, setSelection] = useState<GraphSelection>(undefined)
  const [isCreatingPerson, setIsCreatingPerson] = useState(false)
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [fileName, setFileName] = useState('stammbaum.yaml')
  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState('Nicht gespeichert')
  const [filePort] = useState(() => createBrowserFilePort())
  const [temporaryPositions, setTemporaryPositions] = useState<Map<string, Position>>(
    () => new Map(),
  )
  const [personToCenter, setPersonToCenter] = useState<string | null>(null)
  const flowSurfaceRef = useRef<HTMLDivElement>(null)

  const projection = useMemo(
    () => projectFamilyTree(document, selection, temporaryPositions),
    [document, selection, temporaryPositions],
  )
  const selectedPerson =
    selection?.type === 'person'
      ? document.persons.find((person) => person.id === selection.id) ?? null
      : null
  const selectedRelationship =
    selection?.type === 'relationship'
      ? document.relationships.find((relationship) => relationship.id === selection.id) ?? null
      : null
  const inspectorRelationship = selectedRelationship ?? null
  const inspectorConnection = connectionDraft ?? (
    selectedRelationship
      ? { sourceId: selectedRelationship.fromId, targetId: selectedRelationship.toId }
      : null
  )
  const sourcePerson = inspectorConnection
    ? document.persons.find((person) => person.id === inspectorConnection.sourceId) ?? null
    : null
  const targetPerson = inspectorConnection
    ? document.persons.find((person) => person.id === inspectorConnection.targetId) ?? null
    : null
  const handleNodesChange = (changes: NodeChange[]) => {
    if (!changes.some((change) => change.type === 'position' && change.position)) {
      return
    }

    setTemporaryPositions((current) => {
      const next = new Map(current)
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          next.set(change.id, { x: change.position.x, y: change.position.y })
        }
      })
      return next
    })
  }
  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) {
      return
    }

    setIsCreatingPerson(false)
    setSelection(undefined)
    setConnectionDraft({ sourceId: connection.source, targetId: connection.target })
  }

  const handlePersonSave = (draft: PersonDraft): DomainError | null => {
    const isNewPerson = !selectedPerson || isCreatingPerson
    const result = selectedPerson && !isCreatingPerson
      ? updatePerson(document, selectedPerson.id, draft)
      : createPerson(document, draft)

    if (!result.ok) {
      return result.error
    }

    const nextDocument = synchronizeInferredRelationships(result.value)
    const savedPersonId = selectedPerson && !isCreatingPerson
      ? selectedPerson.id
      : result.value.persons[result.value.persons.length - 1]?.id

    setDocument(nextDocument)
    setTemporaryPositions(new Map())
    setPersonToCenter(isNewPerson ? savedPersonId ?? null : null)
    setIsDirty(true)
    setSaveState('Ungespeichert')
    setWorkflowError(null)
    const savedPerson = savedPersonId
      ? nextDocument.persons.find((person) => person.id === savedPersonId)
      : undefined
    setIsCreatingPerson(false)
    setSelection(savedPerson ? { type: 'person', id: savedPerson.id } : undefined)
    return null
  }

  const handlePersonCentered = useCallback((personId: string, position: Position) => {
    setTemporaryPositions((current) => {
      const next = new Map(current)
      next.set(personId, position)
      return next
    })
    setPersonToCenter(null)
  }, [])

  const handlePersonCancel = () => {
    setIsCreatingPerson(false)
    setSelection(undefined)
    setConnectionDraft(null)
  }

  const handleRelationshipSave = (draft: RelationshipFormDraft): DomainError | null => {
    const sourceId = inspectorConnection?.sourceId
    const targetId = inspectorConnection?.targetId
    const sourceUrl = draft.sourceUrl.trim() || null

    if (!sourceId || !targetId) {
      return {
        code: 'relationship-not-found',
        message: 'Die Beziehung konnte nicht gefunden werden.',
      }
    }

    const result: ReturnType<typeof createMarriage> = connectionDraft
      ? draft.relationshipType === 'marriage'
        ? createMarriage(document, sourceId, targetId, {
            startDate: draft.startDate.trim() || null,
            status: draft.status,
            sourceUrl,
            comment: draft.comment,
          })
        : createParentChild(document, sourceId, targetId, {
            status: draft.status,
            sourceUrl,
            comment: draft.comment,
          })
      : selectedRelationship
        ? updateRelationship(document, selectedRelationship.id, {
          startDate: draft.startDate.trim() || null,
            status: draft.status,
            sourceUrl,
            comment: draft.comment,
          })
        : {
            ok: false,
            error: {
              code: 'relationship-not-found',
              message: 'Die Beziehung konnte nicht gefunden werden.',
            },
          }

    if (!result.ok) {
      return result.error
    }

    const savedRelationshipId = connectionDraft
      ? result.value.relationships[result.value.relationships.length - 1]?.id
      : selectedRelationship?.id
    const nextDocument = synchronizeInferredRelationships(result.value)

    setDocument(nextDocument)
    setTemporaryPositions(new Map())
    setIsDirty(true)
    setSaveState('Ungespeichert')
    setWorkflowError(null)
    const savedRelationship: Relationship | undefined = savedRelationshipId
      ? nextDocument.relationships.find((relationship) => relationship.id === savedRelationshipId)
      : undefined
    setConnectionDraft(null)
    setSelection(
      savedRelationship ? { type: 'relationship', id: savedRelationship.id } : undefined,
    )
    return null
  }

  const handleRelationshipCancel = () => {
    setConnectionDraft(null)
    setSelection(undefined)
  }

  const handleRelationshipRemove = () => {
    if (!selectedRelationship || !window.confirm('Beziehung wirklich entfernen?')) {
      return
    }

    const result = removeRelationship(document, selectedRelationship.id)
    if (!result.ok) {
      return
    }

    setDocument(synchronizeInferredRelationships(result.value))
    setTemporaryPositions(new Map())
    setIsDirty(true)
    setSaveState('Ungespeichert')
    setSelection(undefined)
  }

  const clearTransientState = () => {
    setSelection(undefined)
    setIsCreatingPerson(false)
    setConnectionDraft(null)
  }

  const canReplaceDocument = () =>
    !isDirty || window.confirm('Ungespeicherte Änderungen verwerfen?')

  const handleNewDocument = () => {
    if (!canReplaceDocument()) {
      return
    }

    setDocument(createEmptyDocument())
    setTemporaryPositions(new Map())
    clearTransientState()
    setIsDirty(false)
    setFileName('stammbaum.yaml')
    setSaveState('Nicht gespeichert')
    setWorkflowError(null)
  }

  const handleOpenFile = async () => {
    if (!canReplaceDocument()) {
      return
    }

    try {
      const openedFile = await filePort.open()
      const result = parseFamilyTreeYaml(openedFile.contents)
      if (!result.ok) {
        setWorkflowError(`Die Datei konnte nicht geladen werden: ${result.error.message}`)
        return
      }

      setDocument(synchronizeInferredRelationships(result.value))
      setTemporaryPositions(new Map())
      clearTransientState()
      setIsDirty(false)
      setFileName(openedFile.name)
      setSaveState(`Geöffnet: ${openedFile.name}`)
      setWorkflowError(null)
    } catch (error: unknown) {
      setWorkflowError(
        error instanceof Error
          ? `Die Datei konnte nicht geladen werden: ${error.message}`
          : 'Die Datei konnte nicht geladen werden.',
      )
    }
  }

  const handleSaveFile = async () => {
    try {
      const outputFileName = fileName.endsWith('.yaml') || fileName.endsWith('.yml')
        ? fileName
        : `${fileName}.yaml`
      await filePort.save(serializeFamilyTreeYaml(document), outputFileName)
      setFileName(outputFileName)
      setIsDirty(false)
      setSaveState(`Gespeichert: ${outputFileName}`)
      setWorkflowError(null)
    } catch (error: unknown) {
      setWorkflowError(
        error instanceof Error
          ? `Die Datei konnte nicht gespeichert werden: ${error.message}`
          : 'Die Datei konnte nicht gespeichert werden.',
      )
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">Familienarchiv</p>
            <h1>Stammbaum</h1>
          </div>
        </div>
        <div className="topbar-actions" aria-label="Dateiwerkzeuge">
          <button className="toolbar-button" type="button" onClick={handleNewDocument}>
            Neu
          </button>
          <button className="toolbar-button" type="button" onClick={handleOpenFile}>
            Öffnen
          </button>
          <button
            className="toolbar-button toolbar-button--accent"
            type="button"
            onClick={handleSaveFile}
          >
            Speichern
          </button>
          <span className={`save-state${isDirty ? ' save-state--dirty' : ''}`}>{saveState}</span>
        </div>
      </header>

      {workflowError && <p className="workflow-error" role="alert">{workflowError}</p>}

      <div className="workspace-grid">
        <section className="canvas-panel" aria-label="Stammbaum-Arbeitsfläche">
          <div className="canvas-heading">
            <div>
              <p className="section-label">Übersicht</p>
              <p className="canvas-caption">
                {document.persons.length === 0
                  ? 'Leer'
                  : `${document.persons.length} ${document.persons.length === 1 ? 'Person' : 'Personen'}`}
              </p>
            </div>
            <div className="canvas-heading-actions">
              <button
                aria-label="Person anlegen"
                className="add-person-button"
                title="Person anlegen"
                type="button"
                onClick={() => {
                  setSelection(undefined)
                  setConnectionDraft(null)
                  setIsCreatingPerson(true)
                }}
              >
                <span aria-hidden="true">+</span>
              </button>
              <span className="canvas-status">
                <span className="status-dot" aria-hidden="true" />
                Lokal
              </span>
            </div>
          </div>
          <div ref={flowSurfaceRef} className="flow-surface">
            <ReactFlow
              nodes={projection.nodes}
              edges={projection.edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={projection.fitViewOptions}
              minZoom={0.01}
              maxZoom={1.4}
              nodesConnectable
              nodesDraggable
              panOnDrag
              onNodesChange={handleNodesChange}
              onNodeClick={(_event, node) => {
                setIsCreatingPerson(false)
                setConnectionDraft(null)
                setSelection({ type: 'person', id: node.id })
              }}
              onEdgeClick={(_event, edge) => {
                setIsCreatingPerson(false)
                setConnectionDraft(null)
                setSelection({ type: 'relationship', id: edge.id })
              }}
              onPaneClick={() => {
                setIsCreatingPerson(false)
                setConnectionDraft(null)
                setSelection(undefined)
              }}
              onConnect={handleConnect}
              proOptions={proOptions}
            >
              <FitViewOnPersonCount personCount={document.persons.length} />
              <CenterPersonOnSave
                personId={personToCenter}
                surfaceRef={flowSurfaceRef}
                onCentered={handlePersonCentered}
              />
              <Background color="#d9d0c2" gap={24} size={1} />
              <Controls showInteractive={false} position="bottom-left" />
            </ReactFlow>
            {document.persons.length === 0 && (
              <div className="empty-canvas" aria-live="polite">
                <div className="empty-canvas-icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                  <p className="empty-canvas-title">Keine Personen</p>
                <p className="empty-canvas-copy">
                  Erste Person anlegen.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="inspector-panel" aria-label="Detailinspektor">
          {isCreatingPerson || selection?.type === 'person' ? (
            <PersonInspector
              person={isCreatingPerson ? null : selectedPerson}
              onSave={handlePersonSave}
              onCancel={handlePersonCancel}
            />
          ) : connectionDraft || selection?.type === 'relationship' ? (
            <RelationshipInspector
              relationship={inspectorRelationship}
              sourcePerson={sourcePerson}
              targetPerson={targetPerson}
              onSave={handleRelationshipSave}
              onCancel={handleRelationshipCancel}
              onRemove={handleRelationshipRemove}
            />
          ) : selection ? (
            <div className="inspector-placeholder">
              <p className="section-label">Auswahl</p>
              <p>Details werden hier bearbeitet.</p>
            </div>
          ) : (
            <div className="inspector-placeholder inspector-placeholder--empty">
              <span className="inspector-kicker">Inspektor</span>
              <h2>Wähle ein Objekt</h2>
              <p>Personen und Beziehungen erscheinen hier mit ihren Details.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

export default App