## 1. Regressionstest zuerst

- [x] 1.1 Erweitere den bestehenden Graph-Projektions-Test um die erwarteten semantischen Endpunkte: Eltern-Kind verwendet `source-bottom` nach `target-top`, Ehe verwendet `marriage-side` nach `marriage-side`; verifiziere zuerst den roten Lauf mit `npm test -- --run src/graph/graph-projection.test.ts`.

## 2. Explizite Kantenendpunkte

- [x] 2.1 Ergänze die Projektion gespeicherter Beziehungen um explizite `sourceHandle`- und `targetHandle`-Zuordnungen abhängig vom Beziehungstyp; verifiziere mit `npm test -- --run src/graph/graph-projection.test.ts`.
- [x] 2.2 Verifiziere die Korrektur im bestehenden Beziehungsfluss und im Produktionsbuild mit `npm test`, `npm run test:e2e -- e2e/handle-connections.spec.ts e2e/relationships.spec.ts` und `npm run build`.
