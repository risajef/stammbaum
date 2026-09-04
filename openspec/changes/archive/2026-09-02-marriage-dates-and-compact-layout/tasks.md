## 1. Rote Tests

- [x] 1.1 Domain-Tests fuer `startDate`, ungueltige Ehe-Startdaten und die sichere Ableitung des impliziten Eheendes aus Partner-Todesdaten ergaenzen; mit `npm test -- src/domain/relationship.test.ts --run` als erwartungsgemaess fehlgeschlagenem Test beobachten.
- [x] 1.2 YAML- und Inspector-Tests fuer Ehe-Startdaten, alte Beziehungen ohne `startDate`, das schreibgeschuetzte implizite Ende und fehlerhafte Eingaben ergaenzen; mit `npm test -- src/persistence/yaml.test.ts src/components/relationship-inspector.test.tsx --run` als erwartungsgemaess fehlgeschlagenem Test beobachten.
- [x] 1.3 Graph- und Layouttests fuer weiche typgetrennte Kanten, kompakte Familienzeilen und neue Personen im aktuellen Sichtbereich ergaenzen; mit `npm test -- src/graph/graph-projection.test.ts src/App.test.tsx --run` als erwartungsgemaess fehlgeschlagenem Test beobachten.
- [x] 1.4 E2E-Szenarien fuer Ehezeitraum, Kantenunterscheidung, kompakte Familienanordnung und zentrierte Neuanlage ergaenzen; mit `npm run test:e2e -- e2e/relationships.spec.ts e2e/file-workflow.spec.ts --reporter=dot` als erwartungsgemaess fehlgeschlagenem Test beobachten.

## 2. Implementierung

- [x] 2.1 Relationship-Modell, Domain-Operationen und Dokumentvalidierung um das optionale Partial-Date-Startdatum und die sichere implizite Ende-Berechnung erweitern.
- [x] 2.2 YAML-Import/-Export und RelationshipInspector um `startDate`, Legacy-Kompatibilitaet, Feldvalidierung und Endeanzeige erweitern.
- [x] 2.3 React-Flow-Kanten mit weichen, typgetrennten Formen/Farben/Labels projizieren und die Layoutberechnung auf kompakte Familienbloecke mit engeren Generationenabstaenden umstellen.
- [x] 2.4 Die Workbench so anbinden, dass neu gespeicherte Personen in Flow-Koordinaten auf den Mittelpunkt des aktuellen sichtbaren Canvas gesetzt werden, ohne Positionen zu persistieren.
- [x] 2.5 Fokus- und Integrations-E2E-Tests gruen machen und abschliessend Unit-Suite, E2E-Suite, Build, Editor-Diagnosen, OpenSpec-Validierung, Spec-Sync und `git diff --check` ausfuehren.
