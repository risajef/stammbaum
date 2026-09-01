import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
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
    void fitView({ padding: 0.2, minZoom: 0.25, maxZoom: 1.4 })
  }, [fitView, personCount])

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

  const projection = useMemo(
    () => projectFamilyTree(document, selection),
    [document, selection],
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
  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) {
      return
    }

    setIsCreatingPerson(false)
    setSelection(undefined)
    setConnectionDraft({ sourceId: connection.source, targetId: connection.target })
  }

  const handlePersonSave = (draft: PersonDraft): DomainError | null => {
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
    !isDirty || window.confirm('Ungespeicherte Aenderungen verwerfen?')

  const handleNewDocument = () => {
    if (!canReplaceDocument()) {
      return
    }

    setDocument(createEmptyDocument())
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
      clearTransientState()
      setIsDirty(false)
      setFileName(openedFile.name)
      setSaveState(`Geoeffnet: ${openedFile.name}`)
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
            Oeffnen
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
        <aside className="left-rail" aria-label="Arbeitsbereich">
          <div className="rail-section">
            <p className="section-label">Werkzeuge</p>
            <button
              aria-label="Person anlegen"
              className="add-person-button"
              type="button"
              onClick={() => {
                setSelection(undefined)
                setConnectionDraft(null)
                setIsCreatingPerson(true)
              }}
            >
              <span aria-hidden="true">+</span>
              Person
            </button>
          </div>
          <div className="rail-section rail-section--lower">
            <p className="section-label">Legende</p>
            <div className="legend-row">
              <span className="legend-line legend-line--solid" aria-hidden="true" />
              <span>Explizit</span>
            </div>
            <div className="legend-row">
              <span className="legend-line legend-line--dashed" aria-hidden="true" />
              <span>Geschlussfolgert</span>
            </div>
          </div>
        </aside>

        <section className="canvas-panel" aria-label="Stammbaum-Arbeitsflaeche">
          <div className="canvas-heading">
            <div>
              <p className="section-label">Uebersicht</p>
              <p className="canvas-caption">
                {document.persons.length === 0
                  ? 'Leer'
                  : `${document.persons.length} ${document.persons.length === 1 ? 'Person' : 'Personen'}`}
              </p>
            </div>
            <span className="canvas-status">
              <span className="status-dot" aria-hidden="true" />
              Lokal
            </span>
          </div>
          <div className="flow-surface">
            <ReactFlow
              nodes={projection.nodes}
              edges={projection.edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={projection.fitViewOptions}
              nodesConnectable
              nodesDraggable={false}
              panOnDrag={[1, 2]}
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
              <Background color="#d9d0c2" gap={24} size={1} />
              <Controls showInteractive={false} position="bottom-left" />
              <MiniMap
                nodeColor="#c6654c"
                maskColor="rgba(244, 240, 232, 0.72)"
                position="bottom-right"
              />
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
              <h2>Waehle ein Objekt</h2>
              <p>Personen und Beziehungen erscheinen hier mit ihren Details.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

export default App