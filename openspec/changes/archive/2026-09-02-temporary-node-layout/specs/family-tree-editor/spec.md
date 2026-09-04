## ADDED Requirements

### Requirement: Personen koennen temporaer fuer die Beziehungsarbeit verschoben werden

Das System MUST erlauben, sichtbare Personen waehrend der aktuellen Sitzung auf der Arbeitsflaeche zu verschieben, damit Beziehungen leichter erstellt und geprueft werden koennen. Eine solche Positionsaenderung MUST ausschliesslich die aktuelle Ansicht betreffen. Sie DARF keine fachliche Dokumentaenderung, keinen Dirty-State und keine gespeicherte Personenposition erzeugen. View-Panning MUSS weiterhin moeglich bleiben, ohne dass das Ziehen eines Nodes die Arbeitsflaeche gleichzeitig verschiebt.

#### Scenario: Node-Dragging aendert nur die aktuelle Ansicht

- **GIVEN** eine Person ist sichtbar und das Dokument ist gespeichert
- **WHEN** die Benutzerin den Node an eine andere Stelle zieht
- **THEN** wird der Node an der neuen temporaeren Stelle angezeigt, waehrend das Dokument unveraendert bleibt und der gespeicherte Zustand weiterhin als gespeichert gilt

#### Scenario: Temporaere Positionen werden nicht exportiert

- **GIVEN** eine Person wurde temporaer verschoben
- **WHEN** die Benutzerin den Stammbaum speichert
- **THEN** enthaelt der YAML-Export nicht die temporaere Position, sondern weiterhin nur die fachlichen Dokumentdaten

#### Scenario: Dokumentwechsel verwirft temporaere Positionen

- **GIVEN** mindestens ein Node wurde temporaer verschoben
- **WHEN** die Benutzerin ein neues Dokument anlegt oder ein anderes gueltiges Dokument importiert
- **THEN** werden die temporaeren Positionen verworfen und die Nodes erhalten die automatisch berechneten Positionen des neuen Dokuments
