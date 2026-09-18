import type { ChildGroup } from '../graph/graph-projection'

interface ChildGroupInspectorProps {
  group: ChildGroup
  onExpand: () => void
}

function ChildGroupInspector({ group, onExpand }: ChildGroupInspectorProps) {
  return (
    <section className="child-group-inspector">
      <div className="inspector-header">
        <div>
          <p className="section-label">Kindergruppe</p>
          <h2>{group.childIds.length} Kinder</h2>
        </div>
        <span className="form-badge">Ansicht</span>
      </div>
      <p className="form-hint">
        Die gemeinsamen Kinder sind für diese Ansicht eingeklappt.
      </p>
      <div className="form-actions">
        <button
          aria-label="Kinder auffächern"
          className="primary-action"
          type="button"
          onClick={onExpand}
        >
          Kinder auffächern
        </button>
      </div>
    </section>
  )
}

export default ChildGroupInspector
