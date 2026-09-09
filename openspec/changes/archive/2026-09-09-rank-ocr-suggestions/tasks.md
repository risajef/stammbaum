## 1. OCR-Evidenz und Datumsnormalisierung

- [x] 1.1 Schreibe zuerst fehlschlagende Erkennungstests für Geburtsjahr, Geburtsmonat und vollständiges Geburtsdatum aus typischen deutschen OCR-Datumsformen sowie für das Vorausfüllen von `newPerson.birthYear`; verifiziere den roten Zustand mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`.
- [x] 1.2 Implementiere die konservative Datumsnormalisierung und die Zuordnung von Datumskomponenten zu begrenzten Familienregister-/Zeilenkontexten; verifiziere mit den fokussierten Erkennungstests.
- [x] 1.3 Schreibe zuerst fehlschlagende Tests für fehlertolerante Vor- und Nachnamen, den falschen gleichnamigen Elternteil sowie einen Gleichstand zwischen gleichnamigen Bezugspersonen; verifiziere den roten Zustand mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`.
- [x] 1.4 Implementiere den getrennten Fuzzy-Vergleich von Vor- und Nachnamen, das Ranking aller passenden vorhandenen Bezugspersonen und die konservative Mindest-/Abstandsschwelle; verifiziere mit den fokussierten Erkennungstests.

## 2. Qualitätsmetrik und Vorschlagsmenge

- [x] 2.1 Schreibe zuerst fehlschlagende Tests für die fünf Score-Dimensionen, die Rangfolge vollständiges Datum > Jahr/Monat > Jahr, die Unterdrückung schwacher Treffer und die sichtbare Teilbewertung; verifiziere den roten Zustand mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`.
- [x] 2.2 Implementiere die deterministische 100-Punkte-Metrik, lesbare Bewertungsgründe und die absteigende, stabile Sortierung der Vorschläge; verifiziere mit den fokussierten Erkennungstests.
- [x] 2.3 Schreibe zuerst fehlschlagende Tests für die Zusammenfassung wiederholter Evidenz aus mehreren Seiten/Modellen, die bestehende Modellpriorität und unterschiedliche Geburtsdaten bei gleichem Namen; verifiziere den roten Zustand mit `npm exec vitest run src/ocr/ocr-suggestions.test.ts`.
- [x] 2.4 Implementiere Evidenzzusammenfassung, Beleganzahl, primäre Quelle und eine stabile Vorschlagsidentität, die das erkannte Geburtsdatum berücksichtigt; verifiziere mit den fokussierten Erkennungstests und `npm run build`.

## 3. Atomare Domänenübernahme mit korrigiertem Entwurf

- [x] 3.1 Schreibe zuerst fehlschlagende Domänentests für die Übernahme eines korrigierten `PersonDraft`, eine gleichnamige neue Person mit anderem Geburtsdatum, die Ablehnung eines identischen Namens mit identischem Datum und atomare Fehlerbehandlung; verifiziere den roten Zustand mit `npm exec vitest run src/ocr/ocr-suggestion-actions.test.ts`.
- [x] 3.2 Erweitere die OCR-Übernahme um den korrigierten Entwurf und passe die Doppelprüfung auf Name plus Geburtsdatum sowie die unveränderte `ocr-suggestion`-Herkunft an; verifiziere mit den fokussierten Domänentests und `npm run build`.

## 4. Personenmaske für OCR-Vorschläge

- [x] 4.1 Schreibe zuerst fehlschlagende Komponententests für initiale OCR-Werte in der Erstellmaske, editierbare Felder und Abbrechen ohne Save-Aufruf; verifiziere den roten Zustand mit `npm exec vitest run src/components/person-inspector.test.tsx`.
- [x] 4.2 Ergänze eine optionale Initialisierung eines neuen `PersonDraft` im `PersonInspector`, ohne den manuellen Erstell- und Bearbeitungsworkflow zu verändern; verifiziere mit dem fokussierten Komponententest.
- [x] 4.3 Schreibe zuerst fehlschlagende Paneltests für Score, Teilbegründung, Belegzusammenfassung und die Aktion zum Öffnen der korrigierbaren Personenmaske; verifiziere den roten Zustand mit `npm exec vitest run src/components/OcrSuggestionsPanel.test.tsx`.
- [x] 4.4 Implementiere die sichtbare Qualitätsdarstellung, deterministische Kartenreihenfolge und die neue Öffnen-/Ablehnen-Aktion im OCR-Panel; verifiziere mit dem fokussierten Paneltest und `npm run build`.

## 5. App-Workflow und Statusübergänge

- [x] 5.1 Schreibe zuerst fehlschlagende App-Tests für Vorschlag öffnen, vorausgefülltes Korrigieren, Abbrechen ohne Änderung, fehlerhaftes Speichern mit offenem Vorschlag und erfolgreiches Speichern mit Dirty-State; verifiziere den roten Zustand mit `npm exec vitest run src/App.ocr.test.tsx`.
- [x] 5.2 Implementiere den flüchtigen Pending-OCR-Zustand, die Übergabe des korrigierten Entwurfs an die atomare Domänenoperation und die Rückkehr zum normalen Inspector nach Save oder Abbrechen; verifiziere mit den fokussierten App-Tests.
- [x] 5.3 Aktualisiere zuerst den Playwright-Happy-Path für Scoreanzeige, Sortierung, Öffnen der Maske, Korrektur, Abbrechen und Speichern; verifiziere den zunächst erwarteten Fehlschlag mit `npm run test:e2e -- e2e/ocr-suggestions.spec.ts`.
- [x] 5.4 Vervollständige die E2E-Integration einschließlich lokalem OCR-Backend und prüfe, dass nur Speichern Person, Beziehung und Dirty-State verändert; verifiziere mit `npm run test:e2e -- e2e/ocr-suggestions.spec.ts`.

## 6. Regressionen und Kompatibilität

- [x] 6.1 Ergänze Regressionstests dafür, dass bestehende klare Eltern-Kind-, Kinderlisten- und Ehe-Muster, Quellenlinks, Ablehnen und alte YAML-Dateien unverändert funktionieren; verifiziere mit `npm test`.
- [x] 6.2 Prüfe die Verarbeitung großer OCR-Mengen mit dem vorhandenen lokalen Fixture-/Backend-Workflow und stelle sicher, dass keine Originaldaten oder neue Laufzeitabhängigkeiten in den Repository-Diff gelangen; verifiziere mit `git diff --stat`, `git status --short` und `npm run build`.

## 7. Abschlussprüfung

- [x] 7.1 Führe die vollständige Testsuite aus und behebe nur regressionsbezogene Fehler; verifiziere mit `npm test`.
- [x] 7.2 Führe den lieferbaren Build und die vollständigen End-to-End-Tests mit lokalem OCR-Backend aus; verifiziere mit `npm run build` und `npm run test:e2e`.
- [x] 7.3 Validiere die OpenSpec-Artefakte und prüfe den abschließenden Diff auf die vereinbarte Ranking-/Erfassungsänderung; verifiziere mit `openspec validate rank-ocr-suggestions --type change --strict` und `git diff --check`.
