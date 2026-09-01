import { useEffect, useState } from 'react'

import type {
  DomainError,
  Person,
  Relationship,
  RelationshipStatus,
  RelationshipType,
} from '../domain/types'

export interface RelationshipFormDraft {
  relationshipType: RelationshipType
  status: RelationshipStatus
  sourceUrl: string
  comment: string
}

interface RelationshipInspectorProps {
  relationship: Relationship | null
  sourcePerson: Person | null
  targetPerson: Person | null
  onSave: (draft: RelationshipFormDraft) => DomainError | null
  onCancel: () => void
  onRemove?: () => void
}

const valuesFromRelationship = (
  relationship: Relationship | null,
): RelationshipFormDraft => ({
  relationshipType: relationship?.type ?? 'marriage',
  status: relationship?.status ?? 'explicit',
  sourceUrl: relationship?.sourceUrl ?? '',
  comment: relationship?.comment ?? '',
})

function RelationshipInspector({
  relationship,
  sourcePerson,
  targetPerson,
  onSave,
  onCancel,
  onRemove,
}: RelationshipInspectorProps) {
  const [values, setValues] = useState(() => valuesFromRelationship(relationship))
  const [error, setError] = useState<DomainError | null>(null)

  useEffect(() => {
    setValues(valuesFromRelationship(relationship))
    setError(null)
  }, [relationship])

  const updateValue = <Field extends keyof RelationshipFormDraft>(
    field: Field,
    value: RelationshipFormDraft[Field],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (error?.field === field) {
      setError(null)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const saveError = onSave({ ...values, comment: values.comment.trim() })

    if (saveError) {
      setError(saveError)
      return
    }

    setError(null)
  }

  const fieldError = (field: string) => (error?.field === field ? error.message : undefined)
  const personLabel = (person: Person | null) =>
    person ? `${person.firstName} ${person.lastName}` : 'Unbekannte Person'

  return (
    <form className="relationship-form" onSubmit={handleSubmit} noValidate>
      <div className="inspector-header">
        <div>
          <p className="section-label">Beziehung</p>
          <h2>{relationship ? 'Beziehung bearbeiten' : 'Beziehung anlegen'}</h2>
        </div>
        <span className="form-badge">Pruefen</span>
      </div>

      <p className="relationship-endpoints">
        <strong>{personLabel(sourcePerson)}</strong>
        <span aria-hidden="true">-&gt;</span>
        <strong>{personLabel(targetPerson)}</strong>
      </p>

      <div
        className={`relationship-status relationship-status--${values.status}`}
        role="status"
        aria-label={values.status === 'inferred' ? 'Geschlussfolgert' : 'Explizit'}
      >
        {values.status === 'inferred' ? 'Geschlussfolgert' : 'Explizit'}
      </div>

      {relationship?.comment && (
        <p className="relationship-comment">{relationship.comment}</p>
      )}

      <div className="form-fields">
        <label className="form-field">
          <span>Beziehungstyp</span>
          <select
            aria-invalid={Boolean(fieldError('relationshipType'))}
            aria-label="Beziehungstyp"
            value={values.relationshipType}
            disabled={Boolean(relationship)}
            onChange={(event) =>
              updateValue('relationshipType', event.target.value as RelationshipType)
            }
          >
            <option value="marriage">Ehe</option>
            <option value="parent-child">Eltern-Kind</option>
          </select>
          {fieldError('relationshipType') && (
            <small className="field-error">{fieldError('relationshipType')}</small>
          )}
        </label>

        <label className="form-field">
          <span>Status</span>
          <select
            aria-invalid={Boolean(fieldError('status'))}
            aria-label="Status"
            value={values.status}
            disabled={Boolean(relationship?.inferredFrom)}
            onChange={(event) =>
              updateValue('status', event.target.value as RelationshipStatus)
            }
          >
            <option value="explicit">Explizit</option>
            <option value="inferred">Geschlussfolgert</option>
          </select>
          {fieldError('status') && <small className="field-error">{fieldError('status')}</small>}
        </label>

        <label className="form-field">
          <span>Quelle</span>
          <input
            aria-invalid={Boolean(fieldError('sourceUrl'))}
            aria-label="Quelle (URL)"
            type="url"
            value={values.sourceUrl}
            onChange={(event) => updateValue('sourceUrl', event.target.value)}
            placeholder="https://..."
          />
          {fieldError('sourceUrl') && (
            <small className="field-error">{fieldError('sourceUrl')}</small>
          )}
        </label>

        <label className="form-field">
          <span>Kommentar</span>
          <textarea
            aria-label="Kommentar"
            rows={3}
            value={values.comment}
            onChange={(event) => updateValue('comment', event.target.value)}
          />
        </label>
      </div>

      {error && !error.field && <p className="form-error" role="alert">{error.message}</p>}

      <div className="form-actions">
        {relationship && !relationship.inferredFrom && onRemove && (
          <button aria-label="Beziehung entfernen" className="danger-action" type="button" onClick={onRemove}>
            Entfernen
          </button>
        )}
        <button className="secondary-action" type="button" onClick={onCancel}>
          Verwerfen
        </button>
        <button aria-label="Beziehung speichern" className="primary-action" type="submit">
          Speichern
        </button>
      </div>
    </form>
  )
}

export default RelationshipInspector