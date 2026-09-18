import { useState } from 'react'

import type { Person } from '../domain/types'
import type { DuplicatePersonPair } from '../graph/graph-view'

interface DuplicatePairsPanelProps {
  pairs: readonly DuplicatePersonPair[]
  persons: readonly Person[]
  onPersonClick: (personId: string) => void
}

const personLabel = (person: Person) => `${person.firstName} ${person.lastName}`

function DuplicatePairsPanel({
  pairs,
  persons,
  onPersonClick,
}: DuplicatePairsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const personsById = new Map(persons.map((person) => [person.id, person]))
  const visiblePairs = pairs
    .map((pair) => ({
      pair,
      first: personsById.get(pair.firstPersonId),
      second: personsById.get(pair.secondPersonId),
    }))
    .filter((entry): entry is typeof entry & { first: Person; second: Person } =>
      Boolean(entry.first && entry.second))

  return (
    <section className="duplicate-panel" aria-label="Duplikate">
      <div className="duplicate-panel-header">
        <div>
          <p className="section-label">Duplikatsuche</p>
          <h2>Duplikate</h2>
        </div>
        <div className="panel-header-actions">
          <span className="form-badge">
            {visiblePairs.length} {visiblePairs.length === 1 ? 'Paar' : 'Paare'}
          </span>
          <button
            aria-controls="duplicate-panel-content"
            aria-expanded={isExpanded}
            className="toolbar-button panel-toggle"
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? 'Duplikate ausblenden' : 'Duplikate einblenden'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="duplicate-panel-content" id="duplicate-panel-content">
          {visiblePairs.length === 0 ? (
            <p className="duplicate-panel-empty">Keine möglichen Duplikate gefunden.</p>
          ) : (
            <ol className="duplicate-pair-list">
              {visiblePairs.map(({ pair, first, second }) => (
                <li className="duplicate-pair" key={`${pair.firstPersonId}:${pair.secondPersonId}`}>
                  <span className="duplicate-pair-priority">Priorität {pair.priority}</span>
                  <div className="duplicate-pair-people">
                    <button
                      className="duplicate-person-button"
                      type="button"
                      onClick={() => onPersonClick(first.id)}
                    >
                      {personLabel(first)}
                    </button>
                    <span aria-hidden="true">↔</span>
                    <button
                      className="duplicate-person-button"
                      type="button"
                      onClick={() => onPersonClick(second.id)}
                    >
                      {personLabel(second)}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}

export default DuplicatePairsPanel
