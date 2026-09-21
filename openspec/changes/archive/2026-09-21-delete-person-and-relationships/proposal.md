## Why

Personen können derzeit bearbeitet oder fusioniert, aber nicht direkt aus dem Stammbaum entfernt werden. Dadurch bleiben fehlerhafte oder doppelt erfasste Personen nur über eine Fusion handhabbar.

## What Changes

- Der Personen-Inspektor erhält bei bestehenden Personen einen sichtbaren Button „Person entfernen“, analog zum Entfernen einer Beziehung.
- Vor dem Löschen wird der bestehende Bestätigungsdialog verwendet.
- Das Löschen entfernt die ausgewählte Person und automatisch alle Ehe- und Eltern-Kind-Beziehungen, die auf sie verweisen.
- Nach dem Löschen wird die Auswahl aufgehoben, die Ansicht aktualisiert und der Stammbaum als ungespeichert markiert.
- Das Löschen einer unbekannten Person wird als Domänenfehler abgelehnt.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-editor`: Personen können über den Inspektor gelöscht werden; zugehörige Beziehungen werden kaskadierend entfernt.

## Impact

- Betroffen sind die Personen-Domainoperationen, der Personen-Inspektor und die App-Verarbeitung der Löschaktion.
- Die YAML-Struktur bleibt unverändert; das Löschen wird erst durch Speichern dauerhaft exportiert.
- Es werden keine neuen Abhängigkeiten benötigt.
