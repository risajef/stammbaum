## 1. Regressionstest

- [x] 1.1 Einen fehlschlagenden Statistiktest ergänzen, der eine historische Person ohne Todesdatum und eine verstorbene Person enthält und erwartet, dass nur das belegte Todesalter sowie die dazugehörige Altersklasse im HTML erscheinen; mit `node scripts/generate-family-statistics.test.mjs` den beabsichtigten Fehlschlag beobachten.

## 2. Berechnung korrigieren

- [x] 2.1 Die Personenalter-Auswertung so ändern, dass ein fehlendes oder ungültiges Todesdatum keine Beobachtung erzeugt und das Auswertungsdatum nicht als Ersatz-Ende verwendet wird; den Regressionstest aus 1.1 grün machen.
- [x] 2.2 Die Beschreibung im erzeugten HTML auf „Alter beim Tod“ aktualisieren und verifizieren, dass die vorhandene dynamische x-Achse keine Klassen für ausgeschlossene Ausreißer mehr erzeugt.

## 3. Verifikation und Ausgabe

- [x] 3.1 Die Statistiktests, die vollständige Testsuite und den Build ausführen: `node scripts/generate-family-statistics.test.mjs`, `npm test` und `npm run build` müssen erfolgreich sein.
- [x] 3.2 Die Statistik-HTML für die vorhandene Stammbaumdatei neu erzeugen und mit `git diff --check` prüfen, dass die Ausgabe keine unrealistischen Altersklassen aus unbekannten Todesdaten enthält.
- [x] 3.3 Den Change mit `openspec validate correct-person-age-statistics --type change --strict` validieren.
