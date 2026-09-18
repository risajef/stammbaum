## 1. Anzeige-Klassifikation

- [x] 1.1 Ergänze fehlschlagende Graph-Projektionstests für ein Todesalter von 17 Jahren, genau 18 Jahren sowie fehlende oder ungültige Lebensdaten; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die Tests zunächst wegen des fehlenden Minderjährigen-Merkmals fehlschlagen.
- [x] 1.2 Ergänze die bestehende Personen-Knoten-Projektion um die deterministische `isMinor`-Klassifikation aus den Jahreskomponenten und behandle fehlende bzw. nicht auswertbare Daten als volljährig; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die neuen Tests grün sind und das Eingabedokument unverändert bleibt.

## 2. Farbige Personen-Knoten

- [x] 2.1 Ergänze einen fehlschlagenden Anwendungstest für Frauen-, Männer-, Minderjährigen- und neutrale Knotenklassen einschließlich der unveränderten Handle-Darstellung; verifiziere mit `npm test -- src/App.test.tsx`, dass der Test zunächst wegen der fehlenden Darstellungsklassen fehlschlägt.
- [x] 2.2 Implementiere die geschlechtsabhängigen Grundfarben, helleren Minderjährigen-Varianten und die neutrale Darstellung über `PersonNode`-Klassen und zentrale CSS-Regeln; verifiziere mit `npm test -- src/App.test.tsx` und `npm run build`, dass Darstellung und Typprüfung grün sind.

## 3. Abschlussprüfung

- [x] 3.1 Führe die betroffenen Graph- und Anwendungstests gemeinsam aus und verifiziere mit `npm test -- src/graph/graph-projection.test.ts src/App.test.tsx`, dass alle Szenarien einschließlich bestehender Interaktionen grün sind.
- [x] 3.2 Führe den vollständigen Testbestand und die OpenSpec-Validierung aus und verifiziere mit `npm test`, `npm run build` und `openspec validate "color-person-nodes-by-gender-age" --type change --strict --no-interactive`, dass keine Regressionen oder inkonsistenten Änderungsartefakte verbleiben.
