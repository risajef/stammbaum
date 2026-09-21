## Why

Die bestehende Ansicht „Nur Blutsverwandte“ zeigt die gesamte gerichtete Blutslinie und ist bei grossen Stammbäumen mit vielen Generationen zu umfangreich. Für die Orientierung soll die Benutzerin stattdessen entweder nur die direkte Vorfahrenlinie oder diese Linie mit den zugehörigen Geschwistern und Partnern anzeigen können.

## What Changes

- Einen Ansichtsmodus „Direkte Vorfahren“ neben „Nur Blutsverwandte“ anbieten.
- Im Modus „Direkte Vorfahren“ die ausgewählte Person, alle direkten Vorfahren über beliebig viele Generationen und deren Partner anzeigen.
- Einen Ansichtsmodus „Erweiterte direkte Vorfahren“ anbieten.
- Im erweiterten Modus zusätzlich die Geschwister jedes direkten Vorfahren und deren Partner anzeigen.
- Kinder der Geschwister direkter Vorfahren vollständig ausschliessen, auch wenn sie über weitere Generationen erreichbar wären.
- Die Modi als reine, nicht persistierte Ansichtsfilter behandeln; Personen, Beziehungen und Exporte bleiben unverändert.
- Die bestehenden lokalen, Leaf- und Blutsverwandtschaftsfilter sowie die Navigation ansonsten unverändert lassen.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-views`: Die Ansichtsfilter werden um die direkte und erweiterte Vorfahrenansicht mit den beschriebenen Einschluss- und Ausschlussregeln ergänzt.

## Impact

- `src/graph/graph-view.ts`: neue reine Filterberechnung und View-Optionen.
- `src/App.tsx`: zusätzlicher Ansichtsstatus und Bedienelemente; der Anker bleibt die aktuell ausgewählte Person.
- `src/graph/graph-view.test.ts` und App-Tests: ausführbare Szenarien für Vorfahren, Partner, Geschwister und ausgeschlossene Geschwisterkinder.
- Keine Änderungen am Datenmodell, an der YAML-Persistenz oder an externen Abhängigkeiten.

## Assumptions

- Die ausgewählte Person bleibt in beiden neuen Ansichten sichtbar.
- „Direkte Vorfahren“ umfasst keine Geschwister der ausgewählten Person, ausser sie sind zugleich über eine andere Regel direkte Vorfahren.
- Ein Partner eines eingeschlossenen Vorfahren oder Geschwisters wird eingeschlossen, aber dessen eigene Familienlinie wird nicht rekursiv erweitert.
- Die drei Blutlinien-Modi sind alternativ: Beim Aktivieren eines neuen Modus wird der bisherige Blutlinienmodus ersetzt.
