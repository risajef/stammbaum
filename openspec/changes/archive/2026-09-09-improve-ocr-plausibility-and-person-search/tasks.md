## 1. Red: Plausibilität und Personensuche festlegen

- [x] 1.1 Ergänze fehlschlagende OCR-Unit-Tests für normales Elternalter, extreme Abstände wie 106 Jahre, umgekehrte Elternrichtung und fehlende Geburtsjahre; verifiziere den roten Zustand mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`
- [x] 1.2 Ergänze fehlschlagende OCR-Unit-Tests für die Suche einer vorhandenen Person mit OCR-Schreibfehler, Datumsrangfolge, Score-Begründung und Quellenbeleg; verifiziere mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`
- [x] 1.3 Ergänze einen fehlschlagenden Panel-Test für die explizite OCR-Suchaktion, getrennte Trefferanzeige und deaktivierten Zustand ohne Auswahl oder OCR-Seiten; verifiziere mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx`
- [x] 1.4 Ergänze einen fehlschlagenden App-Test, der eine Stammbaumperson auswählt, OCR-Stellen sucht und unveränderte Personen-/Beziehungszahl, offene Vorschläge und Dirty-State prüft; verifiziere mit `npm exec vitest run src/App.ocr.test.tsx`

## 2. Green: Metrik und Recherchefunktion implementieren

- [x] 2.1 Implementiere die richtungsabhängige Eltern-Kind-Altersbewertung mit den abgestuften Bereichen und dem Extremwert-Ausschluss; die OCR-Unit-Tests müssen grün werden mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`
- [x] 2.2 Implementiere den separaten `OcrPersonMatch`-Treffertyp und die zeilenbezogene Suche auf allen geladenen OCR-Seiten mit fehlertolerantem Namen, Datum, Beziehungskontext, Score, Sortierung und Quelle; die OCR-Unit-Tests müssen grün werden mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`
- [x] 2.3 Verdrahte ausgewählte Person, explizite Suchaktion und flüchtige Treffer im App-Zustand, ohne den Dokument- oder Vorschlagszustand zu verändern; der App-Test muss grün werden mit `npm exec vitest run src/App.ocr.test.tsx`
- [x] 2.4 Erweitere das OCR-Panel um die Suchaktion, getrennte Trefferkarten, Score-/Quellenanzeige und zugängliche Zustände; der Panel-Test und die fokussierten App-/Panel-Tests müssen grün werden mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx src/App.ocr.test.tsx`

## 3. Refactor und Regression

- [x] 3.1 Gleiche gemeinsame Name-, Datums- und Quellenlogik ab, entferne nur tatsächlich doppelte Hilfslogik und lasse die vollständige Testsuite grün werden mit `npm test`
- [x] 3.2 Prüfe Build, strikte OpenSpec-Validierung und bestehende OCR-Browserabläufe mit `npm run build`, `openspec validate improve-ocr-plausibility-and-person-search --type change --strict` und `npm run test:e2e -- e2e/ocr-suggestions.spec.ts`
- [x] 3.3 Prüfe den finalen Arbeitsbaum mit `git diff --check` und stelle sicher, dass alle OpenSpec-Aufgaben vollständig markiert sind
