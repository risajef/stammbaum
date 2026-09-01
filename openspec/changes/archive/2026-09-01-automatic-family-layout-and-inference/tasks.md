## 1. Kommentare und automatische Herkunft im Dokumentmodell

- [x] 1.1 Fehlende Domain- und YAML-Tests fuer optionale Personen-/Beziehungskommentare, `inferredFrom` und stabile automatische Beziehungs-IDs schreiben und mit `npm test -- src/domain src/persistence/yaml.test.ts` als rote Tests beobachten.
- [x] 1.2 `Person` und `Relationship` um normalisierte Kommentare sowie die validierte automatische Herkunft erweitern und den YAML-Roundtrip anpassen; mit `npm test -- src/domain src/persistence/yaml.test.ts` verifizieren.

## 2. Automatische Elternschaftsableitung

- [x] 2.1 Rote Domain-Tests fuer einen einzigen Ehepartner, mehrere Ehepartner mit fehlenden Todesdaten, genau einen zeitlich passenden Ehepartner, mehrere passende Ehepartner, fehlendes Geburtsjahr und das Entfernen veralteter automatischer Beziehungen schreiben; mit `npm test -- src/domain/inference.test.ts` als roten Lauf beobachten.
- [x] 2.2 Eine frameworkfreie Synchronisierung fuer `spouse-parent`-Beziehungen implementieren, die nur automatisch erzeugte Kanten entfernt/neu berechnet, manuelle Kanten und Kommentare bewahrt und `status: inferred` setzt; mit `npm test -- src/domain/inference.test.ts src/domain/relationship.test.ts` verifizieren.
- [x] 2.3 Die Synchronisierung nach erfolgreichen Personen-/Beziehungsoperationen sowie nach validiertem YAML-Import in den Dokumentzustand integrieren; mit `npm test -- src/domain src/persistence/yaml.test.ts` und einem atomaren Importtest verifizieren.

## 3. Automatisches Familienlayout

- [x] 3.1 Rote Projektionstests fuer Ehepartner-Nachbarschaft auf gleicher Hoehe, Kinder unter Eltern, Geschwister auf gleicher Hoehe, deterministische Einzelpersonenpositionen und das Ignorieren gespeicherter Positionen schreiben; mit `npm test -- src/graph/graph-projection.test.ts` als roten Lauf beobachten.
- [x] 3.2 Die Layoutprojektion auf Ehekomponenten und Generationen umstellen, Elternmittelpunkte fuer Kinderpositionen nutzen, Kollisionen deterministisch packen und feste Partner-/Generationsabstaende definieren; mit `npm test -- src/graph/graph-projection.test.ts` verifizieren.
- [x] 3.3 React Flow so konfigurieren, dass Personen nicht verschiebbar sind und keine Drag-Positionen mehr in das Dokument geschrieben werden; mit `npm test -- src/graph/graph-projection.test.ts` und einem Browser-Check auf unveraenderte Positionen verifizieren.

## 4. Kommentare und automatische Beziehungen in der Bedienoberflaeche

- [x] 4.1 Komponententests fuer das Anzeigen, Speichern und Verwerfen von Personen- und Beziehungskommentaren sowie die schreibgeschuetzte automatische Herkunft schreiben; mit `npm test -- src/components` als roten Lauf beobachten.
- [x] 4.2 Kommentarfelder in beide Inspektoren integrieren, automatische Beziehungshinweise anzeigen und erfolgreiche Formulareingaben ueber den zentralen Dokumentfluss synchronisieren; mit `npm test -- src/components` verifizieren.
- [x] 4.3 Den Import-/Export- und Beziehungsworkflow um automatische Ableitungen, sichtbare Kommentare und deaktiviertes Dragging erweitern; mit `npm run test:e2e -- e2e/automation.spec.ts` verifizieren.

## 5. Integration und Regression

- [x] 5.1 Bestehende direkte Beziehungs-, Datei- und Responsive-Workflows an die automatische Anordnung und neuen Accessible-Namen anpassen, ohne bestehende Fachlogik zu verlieren; mit `npm run test:e2e` verifizieren.
- [x] 5.2 Vollstaendige Unit-/Komponenten-Suite, Playwright-Suite, Produktionsbuild, OpenSpec-Validierung und Whitespace-Pruefung ausfuehren; mit `npm test`, `npm run test:e2e`, `npm run build`, `openspec validate --all --json --no-interactive` und `git diff --check` verifizieren.