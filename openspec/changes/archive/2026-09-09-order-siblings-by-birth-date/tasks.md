## 1. Regressionstest fuer vollstaendige Geburtsdaten

- [x] 1.1 Einen `projectFamilyTree`-Regressionstest mit absichtlich umgekehrter Dokumentreihenfolge und mehreren vollstaendig datierten Geschwistern anlegen; mit `npm exec vitest run src/graph/graph-projection.test.ts` ausfuehren und den erwarteten Fehlschlag wegen der bisherigen YAML-Reihenfolge beobachten.

## 2. Chronologische Kindkomponenten

- [x] 2.1 Die Sortierung der Kindkomponenten vor der Layoutplatzierung um den Vergleich bekannter Geburtsdatumskomponenten erweitern; den Test aus 1.1 mit `npm exec vitest run src/graph/graph-projection.test.ts` gruen ausfuehren.

## 3. Halbgeschwister und unsichere Daten

- [x] 3.1 Einen Projektionstest fuer Halbgeschwister sowie teilweise oder fehlende Geburtsdaten ergaenzen, der die gemeinsame Hoehe, die chronologische Reihenfolge bekannter Komponenten und den stabilen Rest verifiziert; den Test gezielt ausfuehren und den erwarteten Fehlschlag dokumentieren.
- [x] 3.2 Die Sortierlogik fuer Halbgeschwister, bekannte Teilangaben, fehlende Daten und gleiche bzw. nicht unterscheidbare Daten vervollstaendigen, ohne Ehepartner-Reihenfolge, Layer oder Zentrierung zu veraendern; den fokussierten Graph-Test gruen ausfuehren.

## 4. Gesamtverifikation

- [x] 4.1 Die relevante Testsuite mit `npm test` ausfuehren und alle bestehenden Layout-, Domain- und UI-Regressionen gruen bestaetigen.
- [x] 4.2 Den TypeScript-/Produktions-Build mit `npm run build` ausfuehren und die OpenSpec-Tasks sowie die Implementierung auf konsistenten, fokussierten Diff pruefen.
