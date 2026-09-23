## 1. Graph-Projektionsgrenze

- [x] 1.1 Einen fehlschlagenden `graph-view`-Test für „Nachkommen“ mit Anker, mehreren Generationen, Ankerpartner und Partnerfamilie schreiben und den erwarteten Fehler mit `npx vitest run src/graph/graph-view.test.ts` beobachten.
- [x] 1.2 Den Modus `descendants` und die gerichtete Nachkommen-Suche implementieren; den fokussierten `graph-view`-Test erneut ausführen und grün machen.
- [x] 1.3 Einen fehlschlagenden `graph-view`-Test für „Erweiterte Nachkommen“ mit allen Partnern tatsächlicher Nachkommen, deren Kindern und einer ausgeschlossenen Partnerkette ergänzen; den erwarteten Fehler mit `npx vitest run src/graph/graph-view.test.ts` beobachten.
- [x] 1.4 Den Modus `extended-descendants` mit der zweistufigen Partner-/Kinder-Erweiterung implementieren und mit `npx vitest run src/graph/graph-view.test.ts` verifizieren.

## 2. Filter-Button-Bedienung

- [x] 2.1 Den bestehenden App-Test um fehlschlagende Erwartungen für die Buttons „Nachkommen“ und „Erweiterte Nachkommen“ sowie um die On-demand-Szenarien für Auswahlwechsel und erneuten Klick erweitern; die roten Tests mit `npx vitest run src/App.test.tsx` verifizieren.
- [x] 2.2 Die beiden neuen Buttons an den bestehenden klickgebundenen Filterzustand anschließen und die neuen Modi rendern; die fokussierten App-Tests mit `npx vitest run src/App.test.tsx` grün machen.

## 3. Regression und Abschlussprüfung

- [x] 3.1 Die vollständige Testsuite mit `npm test` ausführen und sicherstellen, dass bestehende lokale, Blutlinien-, Vorfahren-, Leaf-, Auswahl- und Speicherausnahmen grün bleiben.
- [x] 3.2 Den Produktionsbuild mit `npm run build` verifizieren.
- [x] 3.3 Den abgeschlossenen Change mit `openspec validate descendant-view-filters --type change --strict` validieren.
