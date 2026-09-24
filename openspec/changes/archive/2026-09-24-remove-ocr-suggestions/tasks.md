## 1. Rote Regressionstests

- [x] 1.1 Einen App-Test für fehlenden OCR-Bereich und Duplikatbereich am Ende des Arbeitsbereichs schreiben und mit `npx vitest run src/App.test.tsx -t "OCR|Duplikatbereich"` zunächst rot ausführen
- [x] 1.2 YAML- und Domaintests für die Legacy-Normalisierung `ocr-suggestion` zu `manual` anpassen oder ergänzen und den roten Zustand mit `npx vitest run src/persistence/yaml.test.ts src/domain/relationship.test.ts` beobachten

## 2. OCR vollständig entfernen

- [x] 2.1 OCR-Zustand, Imports, Handler und Panel aus `src/App.tsx` entfernen; den App-Test grün machen
- [x] 2.2 OCR-Komponenten, Frontend-Module, Server, Servertests, OCR-Unit-Tests, E2E-Test und Fixtures entfernen und das `backend`-Skript löschen; mit `rg -n -i "ocr|ocr-suggestion" src server e2e package.json` prüfen, dass keine aktiven Laufzeitstellen verbleiben
- [x] 2.3 Den Beziehungsursprung auf `manual` und `automatic-inference` reduzieren und alte YAML-OCR-Werte beim Laden als `manual` normalisieren; `npx vitest run src/persistence/yaml.test.ts src/domain/relationship.test.ts src/graph/graph-projection.test.ts` muss grün sein

## 3. Duplikate und Spezifikationen

- [x] 3.1 Den Duplikatbereich unterhalb von Canvas und Inspektor rendern und die Position im App-Test prüfen
- [x] 3.2 Die OpenSpec-Deltas synchronisieren, die OCR-Fähigkeit aus den Hauptspezifikationen entfernen und mit `openspec validate --specs --strict` prüfen

## 4. Verifikation und Abschluss

- [x] 4.1 `npm test` und `npm run build` erfolgreich ausführen
- [x] 4.2 Verbleibende E2E-Tests mit `npm run test:e2e` ausführen, OpenSpec-Change archivieren und mit `openspec list --json` verifizieren, dass kein aktiver Change offen ist
