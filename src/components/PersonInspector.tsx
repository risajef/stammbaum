import { useEffect, useState } from 'react'

import type { DomainError, Person, PersonDraft } from '../domain/types'

interface PersonInspectorProps {
  person: Person | null
  onSave: (draft: PersonDraft) => DomainError | null | undefined
  onCancel: () => void
  onMerge?: () => void
  onRemove?: () => void
  mergeMode?: boolean
}

interface PersonFormValues {
  firstName: string
  lastName: string
  gender: '' | Person['gender']
  birthYear: string
  deathYear: string
  comment: string
}

const valuesFromPerson = (person: Pick<PersonDraft, 'firstName' | 'lastName' | 'gender' | 'birthYear' | 'deathYear' | 'comment'> | null): PersonFormValues => ({
  firstName: person?.firstName ?? '',
  lastName: person?.lastName ?? '',
  gender: person?.gender ?? '',
  birthYear: person?.birthYear?.toString() ?? '',
  deathYear: person?.deathYear?.toString() ?? '',
  comment: person?.comment ?? '',
})

const dateFromValue = (value: string): string | null => value.trim() || null

function PersonInspector({
  person,
  onSave,
  onCancel,
  onMerge,
  onRemove,
  mergeMode = false,
}: PersonInspectorProps) {
  const [values, setValues] = useState(() => valuesFromPerson(person))
  const [error, setError] = useState<DomainError | null>(null)

  useEffect(() => {
    setValues(valuesFromPerson(person))
    setError(null)
  }, [person])

  const updateValue = (field: keyof PersonFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (error?.field === field) {
      setError(null)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: PersonDraft = {
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender || null,
      birthYear: dateFromValue(values.birthYear),
      deathYear: dateFromValue(values.deathYear),
      position: person?.position ?? null,
      comment: values.comment.trim() || null,
    }
    const saveError = onSave(draft)

    if (saveError) {
      setError(saveError)
      return
    }

    setError(null)
  }

  const inputError = (field: string) => (error?.field === field ? error.message : undefined)

  return (
    <form className="person-form" onSubmit={handleSubmit} noValidate>
      <div className="inspector-header">
        <div>
          <p className="section-label">Person</p>
          <h2>{person ? 'Person bearbeiten' : 'Neue Person'}</h2>
        </div>
        <span className="form-badge">Pflichtfelder *</span>
      </div>

      {mergeMode && (
        <p className="form-hint" role="status">
          Wähle die zweite Person für die Fusion aus.
        </p>
      )}

      <div className="form-fields">
        <label className="form-field">
          <span>Vorname *</span>
          <input
            aria-invalid={Boolean(inputError('firstName'))}
            aria-label="Vorname"
            value={values.firstName}
            onChange={(event) => updateValue('firstName', event.target.value)}
            autoComplete="given-name"
          />
          {inputError('firstName') && <small className="field-error">{inputError('firstName')}</small>}
        </label>

        <label className="form-field">
          <span>Nachname *</span>
          <input
            aria-invalid={Boolean(inputError('lastName'))}
            aria-label="Nachname"
            value={values.lastName}
            onChange={(event) => updateValue('lastName', event.target.value)}
            autoComplete="family-name"
          />
          {inputError('lastName') && <small className="field-error">{inputError('lastName')}</small>}
        </label>

        <label className="form-field">
          <span>Geschlecht</span>
          <select
            aria-invalid={Boolean(inputError('gender'))}
            aria-label="Geschlecht"
            value={values.gender ?? ''}
            onChange={(event) => updateValue('gender', event.target.value)}
          >
            <option value="">Nicht angegeben</option>
            <option value="woman">Frau</option>
            <option value="man">Mann</option>
          </select>
          {inputError('gender') && <small className="field-error">{inputError('gender')}</small>}
        </label>

        <div className="form-row">
          <label className="form-field">
            <span>Geburtsdatum</span>
            <input
              aria-invalid={Boolean(inputError('birthYear'))}
              aria-label="Geburtsdatum"
              inputMode="numeric"
              maxLength={10}
              placeholder="YYYY-MM-DD"
              value={values.birthYear}
              onChange={(event) => updateValue('birthYear', event.target.value)}
            />
            {inputError('birthYear') && <small className="field-error">{inputError('birthYear')}</small>}
          </label>
          <label className="form-field">
            <span>Todesdatum</span>
            <input
              aria-invalid={Boolean(inputError('deathYear'))}
              aria-label="Todesdatum"
              inputMode="numeric"
              maxLength={10}
              placeholder="YYYY-MM-DD"
              value={values.deathYear}
              onChange={(event) => updateValue('deathYear', event.target.value)}
            />
            {inputError('deathYear') && <small className="field-error">{inputError('deathYear')}</small>}
          </label>
        </div>

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
        {person && onMerge && !mergeMode && (
          <button
            aria-label="Mit anderer Person fusionieren"
            className="danger-action"
            type="button"
            onClick={onMerge}
          >
            Fusionieren
          </button>
        )}
        {person && onRemove && !mergeMode && (
          <button
            aria-label="Person entfernen"
            className="danger-action"
            type="button"
            onClick={onRemove}
          >
            Entfernen
          </button>
        )}
        <button className="secondary-action" type="button" onClick={onCancel}>
          Verwerfen
        </button>
        <button aria-label="Person speichern" className="primary-action" type="submit">
          Speichern
        </button>
      </div>
    </form>
  )
}

export default PersonInspector
