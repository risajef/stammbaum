## 1. Regressionstests

- [x] 1.1 Rote Projektionstests für Ankerpartner, Nachkommenpartner, ausgeschlossene Partnerfamilien und beide kombinierten Modi festhalten und mit `npx vitest run src/graph/graph-view.test.ts -t "descendant|combined"` verifizieren
- [x] 1.2 Den Bedienungsregressionstest für die Anwendung des Filters an der beim Klick ausgewählten Person aktualisieren und mit `npx vitest run src/App.test.tsx -t "applies descendant actions"` verifizieren

## 2. Filterprojektion

- [x] 2.1 Eine direkte Nachkommenmenge um die direkten Partner des Ankers und aller erreichten Nachkommen erweitern und die Projektionstests grün machen
- [x] 2.2 Die erweiterte Nachkommenmenge sowie die kombinierten Modi auf dieselbe Partnerregel aufbauen, ohne Partnerketten zu verfolgen

## 3. Spezifikation und Verifikation

- [x] 3.1 Die geänderte `family-tree-views`-Delta-Spezifikation in die Hauptspezifikation synchronisieren und mit `openspec validate --specs --strict` prüfen
- [x] 3.2 Alle Unit-Tests und den Produktionsbuild mit `npm test` und `npm run build` ausführen
- [x] 3.3 Den OpenSpec-Change nach vollständig grünen Prüfungen archivieren und mit `openspec list --json` sowie dem archivierten Aufgabenstand verifizieren, dass keine aktiven Artefakte verbleiben
