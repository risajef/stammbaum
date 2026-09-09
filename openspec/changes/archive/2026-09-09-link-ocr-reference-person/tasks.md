## 1. Red: Interaktionsverträge festhalten

- [x] 1.1 Einen fehlschlagenden `OcrSuggestionsPanel`-Test für den klickbaren Namen der bekannten Bezugsperson ergänzen und prüfen mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx`
- [x] 1.2 Einen fehlschlagenden `App`-OCR-Test für die Auswahl der per `existingPersonId` referenzierten Person, den Personen-Inspector und den unveränderten Dirty-State ergänzen und prüfen mit `npm exec vitest run src/App.ocr.test.tsx`
- [x] 1.3 Einen Testfall für eine unbekannte Bezugsperson ergänzen, der keine klickbare Navigation anbietet, und den erwarteten Fehlschlag mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx` beobachten

## 2. Green: Navigation implementieren

- [x] 2.1 `OcrSuggestionsPanel` um einen Callback für die stabile Bezugsperson-ID erweitern und den bekannten Namen als zugänglichen Inline-Button rendern; der neue Panel-Test muss grün werden mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx`
- [x] 2.2 Den vorhandenen Personen-Navigationsablauf der App für OCR-Bezugspersonen wiederverwenden: temporäre Editor-/Verbindungszustände schließen, ID validieren, Person auswählen und Fokus-Anforderung erhöhen; der App-OCR-Test muss grün werden mit `npm exec vitest run src/App.ocr.test.tsx`
- [x] 2.3 Den Callback im App-Rendering verdrahten und die Button-Darstellung mit sichtbarem Tastaturfokus ergänzen; die Panel- und App-Tests müssen gemeinsam grün werden mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx src/App.ocr.test.tsx`

## 3. Refactor und Regression

- [x] 3.1 Doppelte Auswahl-/Fokuslogik mit dem bestehenden Suchablauf abgleichen und nur bei tatsächlicher Duplizierung in eine kleine gemeinsame Funktion überführen; `npm test` muss vollständig grün bleiben
- [x] 3.2 Build, Änderungsvalidierung und bestehende Browser-Abläufe prüfen mit `npm run build`, `openspec validate link-ocr-reference-person --type change --strict` und `npm run test:e2e -- e2e/ocr-suggestions.spec.ts`
- [x] 3.3 Arbeitsbaum auf Formatierungsfehler prüfen mit `git diff --check` und die umgesetzte Änderung in den OpenSpec-Aufgaben als vollständig markieren
