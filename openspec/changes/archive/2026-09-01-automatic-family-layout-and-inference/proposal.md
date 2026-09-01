## Why

Die grafische Bearbeitung soll sich auf fachliche Eingaben konzentrieren, waehrend die Arbeitsflaeche die Familienstruktur selbst verstaendlich anordnet. Ehepartner sollen als Paar erscheinen, Kinder darunter; bekannte Ehen sollen ausserdem fehlende Eltern-Kind-Verbindungen sicher ergaenzen koennen, ohne dass dieselbe Verbindung manuell mehrfach gepflegt werden muss.

## What Changes

- Die Arbeitsflaeche berechnet Positionen automatisch; manuelles Verschieben von Personen ist nicht mehr moeglich.
- Ehebeziehungen werden fuer Layout und Fachlogik symmetrisch als Paar behandelt, unabhaengig von ihrer gespeicherten Frau-zu-Mann-Richtung.
- Ehepartner werden horizontal nebeneinander angeordnet, Kinder unter den beteiligten Eltern bzw. Ehepaaren und Geschwister nebeneinander.
- Aus einer Ehe und einer Eltern-Kind-Beziehung werden zusaetzliche Eltern-Kind-Beziehungen mit `status: inferred` abgeleitet.
- Bei genau einem Ehepartner reicht die bekannte Elternschaft fuer die Ableitung ohne Todesdatum; bei mehreren Ehepartnern wird nur bei vollstaendigen Todesdaten, bekanntem Geburtsjahr des Kindes und genau einem zeitlich passenden Ehepartner abgeleitet.
- Automatisch abgeleitete Beziehungen werden im Dokument gekennzeichnet, damit sie bei Aenderungen neu berechnet werden koennen, ohne manuell erfasste geschlussfolgerte Beziehungen zu loeschen.
- Personen und Beziehungen erhalten optionale Kommentare, die Annahmen und Unsicherheiten erklaeren koennen.
- YAML-Schema, Laufzeitvalidierung und Datei-Roundtrips werden um Kommentare und die Herkunft automatisch abgeleiteter Beziehungen erweitert.

## Capabilities

### New Capabilities

- `family-tree-automation`: Automatische Familienanordnung, symmetrische Ehebehandlung und regelbasierte Elternschaftsableitung mit Kommentaren.

### Modified Capabilities

- Keine; die bestehende Capability liegt nur im abgeschlossenen vorherigen Change und nicht als Haupt-Spec unter `openspec/specs/` vor.

## Impact

- `src/domain/types.ts`, `src/domain/person.ts`, `src/domain/relationship.ts` und eine neue bzw. erweiterte Ableitungsschicht fuer Dokumentaktualisierungen.
- `src/graph/graph-projection.ts` und `src/App.tsx` fuer automatische Positionen und deaktiviertes Node-Dragging.
- `src/components/PersonInspector.tsx` und `src/components/RelationshipInspector.tsx` fuer Kommentare.
- `src/persistence/yaml.ts` sowie bestehende Domain-, Komponenten- und End-to-End-Tests.
- Keine neuen Abhaengigkeiten, kein Server und keine Datenbank.