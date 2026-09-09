import type {
  OcrImportIssue,
  OcrImportStats,
  OcrPage,
  OcrRun,
} from '../ocr/ocr-file-adapter'
import type { OcrSuggestion } from '../ocr/ocr-suggestions'
import type { Person } from '../domain/types'
import {
  relationshipOriginClassName,
  relationshipOriginLabel,
} from '../domain/relationship-origin'

export type OcrImportStatus = 'idle' | 'loading' | 'loaded' | 'error'
export type OcrBackendStatus = 'unknown' | 'connecting' | 'connected' | 'unreachable'

export interface OcrImportViewState {
  status: OcrImportStatus
  backendStatus?: OcrBackendStatus
  runs: OcrRun[]
  pages: OcrPage[]
  errors: OcrImportIssue[]
  stats?: OcrImportStats
}

interface OcrSuggestionsPanelProps {
  importState: OcrImportViewState
  suggestions: readonly OcrSuggestion[]
  persons?: readonly Person[]
  ocrPath: string
  onPathChange: (path: string) => void
  onImport: () => void
  onOpen?: (suggestion: OcrSuggestion) => void
  onReferencePersonClick?: (personId: string) => void
  /** Kept for callers that render the panel without suggestion actions. */
  onAccept?: (suggestion: OcrSuggestion) => void
  onReject: (suggestion: OcrSuggestion) => void
}

const pageLabel = (count: number) => `${count} ${count === 1 ? 'Seite' : 'Seiten'}`

const modelLabel = (modelId: string) =>
  modelId === 'kraken-pp-ocrv6-medium'
    ? 'PP-OCRv6'
    : modelId === 'kraken-german-handwriting-zenodo-7933463'
      ? 'Deutsche Handschrift'
      : modelId

const importIssueLabel = (count: number) =>
  count === 1
    ? '1 OCR-Datei konnte nicht gelesen werden und wurde übersprungen.'
    : `${count} OCR-Dateien konnten nicht gelesen werden und wurden übersprungen.`

function OcrSuggestionsPanel({
  importState,
  suggestions,
  persons = [],
  ocrPath,
  onPathChange,
  onImport,
  onOpen,
  onReferencePersonClick,
  onReject,
}: OcrSuggestionsPanelProps) {
  const summary = `${importState.runs.length} ${importState.runs.length === 1 ? 'Quelle' : 'Quellen'} · ${pageLabel(importState.pages.length)}`
  const backendStatus = importState.backendStatus ?? 'unknown'
  const backendLabel = backendStatus === 'connecting'
    ? 'OCR-Backend wird kontaktiert…'
    : backendStatus === 'connected'
      ? 'OCR-Backend verbunden'
      : backendStatus === 'unreachable'
        ? 'OCR-Backend nicht erreichbar'
        : 'OCR-Backend nicht geprüft'
  const personLabel = (personId: string) => {
    const person = persons.find((candidate) => candidate.id === personId)
    return person ? `${person.firstName} ${person.lastName}` : 'Unbekannte Bezugsperson'
  }
  const relationshipLabel = (suggestion: OcrSuggestion) =>
    suggestion.relationshipType === 'marriage'
      ? 'Ehe'
      : suggestion.direction === 'candidate-parent'
        ? 'Eltern-Kind · neue Bezugsperson als Elternteil'
        : 'Eltern-Kind · neue Person als Kind'

  return (
    <section className="ocr-panel" aria-label="OCR-Vorschläge">
      <div className="ocr-panel-header">
        <div>
          <p className="section-label">Quellenprüfung</p>
          <h2>OCR-Vorschläge</h2>
        </div>
      </div>

      <div className="ocr-import-controls">
        <label htmlFor="ocr-path">OCR-Pfad (Linux)</label>
        <input
          id="ocr-path"
          type="text"
          value={ocrPath}
          placeholder="/home/wer/Code/kirchenbücher/ocr-gpu-optimized"
          onChange={(event) => onPathChange(event.target.value)}
        />
        <button className="toolbar-button" type="button" onClick={onImport}>
          OCR-Pfad einlesen
        </button>
      </div>

      <div className="ocr-import-status" aria-live="polite">
        {importState.status === 'loading' && 'OCR wird geladen…'}
        {importState.status === 'loaded' && (
          <>
            {summary}
            {importState.stats && importState.stats.skippedPages > 0 && (
              ` · ${importState.stats.skippedPages} Seite(n) übersprungen`
            )}
          </>
        )}
        {importState.status === 'error' && 'OCR-Import fehlgeschlagen'}
        {importState.status === 'idle' && 'Noch keine OCR-Quellen geladen'}
        <span className={`ocr-backend-status ocr-backend-status--${backendStatus}`}>
          {backendLabel}
        </span>
      </div>

      {importState.errors.length > 0 && (
        <div className="ocr-import-errors" role="alert">
          <p>{importIssueLabel(importState.errors.length)}</p>
        </div>
      )}

      {importState.runs.length > 0 && (
        <div className="ocr-sources" aria-label="Geladene OCR-Quellen">
          {importState.runs.map((run) => (
            <div className="ocr-source" key={run.id}>
              <strong>{run.label}</strong>
              <span>{pageLabel(run.pageCount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="ocr-suggestion-list" aria-label="Offene OCR-Vorschläge">
        {suggestions.length === 0
          ? <p className="ocr-empty-state">Keine Vorschläge</p>
          : suggestions.map((suggestion) => {
              const newPersonLabel = `${suggestion.newPerson.firstName} ${suggestion.newPerson.lastName}`
              const referencePerson = persons.find((person) => person.id === suggestion.existingPersonId)
              const referencePersonLabel = personLabel(suggestion.existingPersonId)
              return (
                <article
                  aria-label={`Vorschlag: ${newPersonLabel}`}
                  className="ocr-suggestion-card"
                  key={suggestion.id}
                >
                  <div className="ocr-suggestion-card-header">
                    <div>
                      <p className="section-label">Neue Person</p>
                      <h3>{newPersonLabel}</h3>
                    </div>
                    <span className={`relationship-origin ${relationshipOriginClassName('ocr-suggestion')}`}>
                      {relationshipOriginLabel('ocr-suggestion')}
                    </span>
                  </div>
                  <dl className="ocr-suggestion-details">
                    <div>
                      <dt>Bezugsperson</dt>
                      <dd>
                        {referencePerson && onReferencePersonClick ? (
                          <button
                            className="ocr-suggestion-reference"
                            type="button"
                            onClick={() => onReferencePersonClick(referencePerson.id)}
                          >
                            {referencePersonLabel}
                          </button>
                        ) : (
                          referencePersonLabel
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Beziehung</dt>
                      <dd>{relationshipLabel(suggestion)}</dd>
                    </div>
                  </dl>
                  <div className="ocr-suggestion-score" aria-label="Qualitätsbewertung">
                    <strong>Bewertung {suggestion.score}/100</strong>
                    <span>{suggestion.evidence.count} {suggestion.evidence.count === 1 ? 'Beleg' : 'Belege'}</span>
                  </div>
                  <ul className="ocr-suggestion-score-reasons" aria-label="Bewertungsdetails">
                    {suggestion.scoreReasons.map((scoreReason) => <li key={scoreReason}>{scoreReason}</li>)}
                  </ul>
                  <p className="ocr-suggestion-reason">{suggestion.reason}</p>
                  <blockquote className="ocr-suggestion-excerpt">{suggestion.excerpt}</blockquote>
                  <a
                    className="ocr-suggestion-source-link"
                    href={suggestion.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Quelle im Review-Tool öffnen"
                  >
                    {(suggestion.source.bookLabel?.trim() || suggestion.source.bookId)} · {modelLabel(suggestion.source.modelId)} · Seite {suggestion.source.pageNumber}
                  </a>
                  <div className="ocr-suggestion-actions">
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={() => onReject(suggestion)}
                    >
                      Vorschlag ablehnen
                    </button>
                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => onOpen?.(suggestion)}
                    >
                      Vorschlag bearbeiten
                    </button>
                  </div>
                </article>
              )
            })}
      </div>
    </section>
  )
}

export default OcrSuggestionsPanel
