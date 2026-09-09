## 1. View-Projektion und Suchordnung

- [x] 1.1 Einen ausfuehrbaren Graph-Test fuer Suchmatches, Datumsordnung, ungerichtete Distanz, reine Eltern-Kind-Komponente, Leaf-Menge und Kantenendpunkte schreiben und mit `npm exec vitest run src/graph/graph-view.test.ts src/graph/graph-projection.test.ts` als erwarteten Fehlschlag ausfuehren.
- [x] 1.2 Eine pure View-Projektion mit stabiler Geburtsdatums-Sortierung, BFS-Distanz, gerichteter Blutverwandtschaft (zuerst hoch, danach runter) und Leaf-Auswertung implementieren; den fokussierten Graph-Test gruen ausfuehren.
- [x] 1.3 `projectFamilyTree` um die View-Optionen erweitern, die gefilterte Dokumentprojektion vor dem unveraenderten Layout verwenden und bestehende Projektionstests gruen ausfuehren.

## 2. Such- und Filterbedienung

- [x] 2.1 Einen UI-Test fuer Suche, Treffer-Navigation, Filterkombinationen und das Aufheben einer verdeckten Auswahl schreiben und zuerst mit `npm exec vitest run src/App.test.tsx` fehlschlagen lassen.
- [x] 2.2 Die Filterleiste, Trefferaktionen und den lokalen View-State in `App.tsx` integrieren; Suchnavigation waehlt sichtbare Nodes aus und fokussiert sie, und der fokussierte App-Test wird gruen.
- [x] 2.3 Responsive Styles und getrennte Leeransicht fuer Filterzustand ergaenzen; `npm exec vitest run src/App.test.tsx src/graph/graph-view.test.ts src/graph/graph-projection.test.ts` ausfuehren.

## 3. Gesamtverifikation

- [x] 3.1 Die vollstaendige Testsuite mit `npm test` ausfuehren und bestehende Layout-, Domain- und UI-Regressionsfreiheit bestaetigen.
- [x] 3.2 Den Produktions-Build mit `npm run build` ausfuehren und den fokussierten Diff sowie die OpenSpec-Artefakte auf Konsistenz pruefen.
