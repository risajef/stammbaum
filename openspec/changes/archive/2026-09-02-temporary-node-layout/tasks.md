## 1. Graphprojektion

- [x] 1.1 Rote Projektionstests fuer kompakte, horizontal zentrierte Positionen, ignorierte gespeicherte Positionen und temporaere Overrides schreiben und mit `npx vitest run src/graph/graph-projection.test.ts --reporter=dot` als erwartungsgemaess rote Tests beobachten.
- [x] 1.2 Die Projektion auf kompaktere, zentrierte Ausgangspositionen umstellen und eine optionale Override-Map verwenden, ohne `FamilyTreeDocument` zu veraendern; mit `npx vitest run src/graph/graph-projection.test.ts --reporter=dot` verifizieren.

## 2. Temporaere Arbeitspositionen und Zoom

- [x] 2.1 End-to-End-Szenarien fuer Node-Dragging ohne YAML-Persistenz und starkes Herauszoomen ergaenzen und die erwarteten Fehler vor der Implementierung beobachten; mit `npm run test:e2e -- e2e/automation.spec.ts` pruefen.
- [x] 2.2 Temporaere Positions-Overrides in `App` verwalten, nur Position-Changes verarbeiten und die Map bei fachlichen Dokumentaenderungen, neuem Dokument und Import leeren; mit `npm run test:e2e -- e2e/automation.spec.ts` verifizieren.
- [x] 2.3 React Flow fuer Node-Dragging, getrenntes View-Panning sowie `minZoom: 0.01` und `maxZoom: 1.4` konfigurieren; mit `npm run test:e2e -- e2e/automation.spec.ts` verifizieren.

## 3. Regression und Abschluss

- [x] 3.1 Bestehende Graph-, Datei- und Beziehungsworkflows an die neue temporaere Positionssemantik anpassen und den Export weiterhin ausschliesslich aus dem Dokument erzeugen; mit `npm test -- --run --reporter=dot` und `npm run test:e2e` verifizieren.
- [x] 3.2 Produktionsbuild und TypeScript-Pruefung ausfuehren; mit `npm run build` verifizieren.
- [x] 3.3 OpenSpec-Artefakte validieren und den Arbeitsbaum auf Whitespace-Fehler pruefen; mit `openspec validate temporary-node-layout --type change --no-interactive` und `git diff --check` verifizieren.
