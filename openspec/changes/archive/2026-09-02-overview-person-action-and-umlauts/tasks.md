## 1. Personenerstellung in der Uebersicht

- [x] 1.1 Einen roten App-/Komponententest fuer einen `Person anlegen`-Button in der Uebersichtszeile und das Fehlen der Werkzeug-Rail ergaenzen; mit `npm test -- src/App.test.tsx --run` als erwartungsgemaess fehlgeschlagenem Test beobachten.
- [x] 1.2 Den bestehenden Erstellungs-Handler ueber den Plus-Button in `.canvas-heading` ausloesen, die linke Rail entfernen und die Grid-/Responsive-Regeln auf zwei Spalten umstellen; mit `npm test -- src/App.test.tsx --run` und `npm run test:e2e -- e2e/responsive-workbench.spec.ts` verifizieren.

## 2. Deutsche UI-Texte

- [x] 2.1 Aktuelle deutschsprachige String-Literale in UI, Domain-Fehlern, Persistence-Fehlern und zugreifbaren E2E-Texten auf echte `ae`/`oe`/`ue`-Umlaute umstellen, ohne interne Identifier oder historische Dokumentation zu verändern; mit einer gezielten Suche nach verbliebenen ausgeschriebenen Umlauten in `src` und `e2e` prüfen.
- [x] 2.2 Sichtbare Texte und Accessibility-Locators in den bestehenden Tests anpassen und die vollständige Unit- sowie E2E-Suite ausführen; mit `npm test -- --run` und `npm run test:e2e` verifizieren.

## 3. Abschluss

- [x] 3.1 Produktionsbuild, Editor-Diagnosen, OpenSpec-Validierung und Whitespace prüfen; mit `npm run build`, `openspec validate overview-person-action-and-umlauts --type change --no-interactive` und `git diff --check` verifizieren.
