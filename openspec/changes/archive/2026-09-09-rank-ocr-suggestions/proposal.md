## Why

Die OCR-Erkennung erzeugt derzeit bereits aus einem bloßen Namensfund einer bekannten Bezugsperson einen Vorschlag für eine neue Person. Bei wiederkehrenden Namen führt das zu falschen Beziehungen: Ein OCR-Eintrag wie „Georg Weber, Kind von Jacob Weber“ kann zu einer anderen Person namens Jacob Weber gehören, die im Stammbaum nicht vorhanden ist. Die Vorschläge brauchen deshalb eine nachvollziehbare Bewertung, die Namen, Geburtsdaten und die Beziehungskonstellation gemeinsam berücksichtigt.

## What Changes

- OCR-Einträge werden als strukturierte Evidenz für eine neue Person und ihre Bezugsperson ausgewertet; die Bezugsperson muss weiterhin im Stammbaum vorhanden sein.
- Vor- und Nachnamen der OCR-Bezugsperson werden fehlertolerant gegen vorhandene Stammbaum-Personen verglichen. Kleine OCR-Abweichungen wie „Hane“/„Hans“ oder „Grorg“/„Georg“ bleiben prüfbar.
- Aus OCR-Text und Seitenmetadaten werden Geburtsdatumskomponenten extrahiert, soweit sie zuverlässig erkennbar sind. Gleiches Datum erhält mehr Gewicht als gleiches Jahr und gleiches Jahr mehr als eine unbekannte oder abweichende Angabe.
- Jeder Vorschlag erhält eine erklärbare Punktzahl von 0 bis 100 und eine kurze Aufschlüsselung der relevanten Signale. Vorschläge werden absteigend nach ihrer Qualität sortiert.
- Schwache oder bei mehreren gleich guten Bezugspersonen nicht eindeutig zuordenbare Treffer werden nicht als normale neue Person vorgeschlagen. Wiederholte Evidenz für denselben Vorschlag wird zusammengefasst.
- Ein gleicher Name einer bereits vorhandenen Person verhindert einen Vorschlag nicht automatisch, wenn Datum und Beziehung deutlich auf eine andere neue Person hindeuten; ohne ausreichende zusätzliche Evidenz wird der Treffer unterdrückt.
- Das Annehmen eines Vorschlags öffnet die bestehende Maske zum Anlegen einer Person mit den OCR-Daten als Vorausfüllung. Erst das Speichern der korrigierten Maske übernimmt die neue Person und ihre Beziehung; Abbrechen lässt den Vorschlag offen.
- OCR-Originalname, OCR-Ausschnitt, Quelle und Score bleiben für die Prüfung sichtbar. Bestehende Ablehnungs-, Speicher- und Herkunftsregeln bleiben erhalten.

## Capabilities

### New Capabilities

- `family-tree-ocr-suggestions`: Qualitätsermittlung, Priorisierung und kontrollierte Erfassung von OCR-Vorschlägen für neue Personen.

### Modified Capabilities

Keine Hauptspezifikation wird direkt geändert. Die bestehende OCR-Vorschlagsfähigkeit wird in diesem neuen Änderungsartefakt um die Qualitätsbewertung und den Erfassungsdialog erweitert.

## Impact

- Betroffen sind die OCR-Erkennung und ihre testbare Datenstruktur unter `src/ocr/`, die Vorschlagsdarstellung sowie der Annahme-Workflow in `src/components/` und `src/App.tsx`.
- Wahrscheinlich werden Score, Evidenzdetails und optionale extrahierte Datumswerte am internen `OcrSuggestion` ergänzt; bestehende YAML-Dokumente und Beziehungen bleiben kompatibel.
- Die Metrik bleibt deterministisch und benötigt keine neue Laufzeitabhängigkeit, kein externes Matching- oder KI-System und keine Änderung am read-only OCR-Backend.
- Der reale OCR-Bestand und ein lokaler Stammbaum dienen nur zur Analyse und Kalibrierung. Originaldaten werden nicht in Tests oder ins Repository kopiert.
- Die Lösung muss die vorhandenen OCR-Mengen performant verarbeiten und bei unvollständigen oder fehlerhaften Datumsangaben konservativ bleiben.

## Acceptance Criteria

- Ein OCR-Eintrag mit einem nicht ausreichend passenden oder mehrdeutigen Elternteil erzeugt keinen normalen Vorschlag für das Kind.
- Bei gleichnamigen Bezugspersonen wird ein gleicher Tag höher bewertet als gleicher Monat und gleicher Monat höher als nur gleiches Jahr; ein passendes Geburtsjahr schlägt einen bloßen Namensgleichstand.
- Kleine OCR-Schreibfehler in Vor- und Nachnamen können passende Bezugspersonen finden, ohne den belegten OCR-Text zu verlieren.
- Die Vorschlagsliste ist deterministisch nach Score sortiert, zeigt Score und Begründung und bündelt wiederholte Evidenz.
- Das Öffnen, Korrigieren, Speichern und Abbrechen der Personmaske verhält sich wie beschrieben; nur Speichern verändert den Stammbaum.
- Die fokussierten Tests, die vollständige Testsuite, der Build und die bestehenden E2E-Abläufe bleiben erfolgreich.

## Assumptions

- Die Punktzahl wird als verständliche Heuristik mit festen Gewichten umgesetzt; sie ist keine statistisch kalibrierte Wahrscheinlichkeit.
- Fehlende Datumsbestandteile sind neutral beziehungsweise schwächer als passende Bestandteile und werden nicht künstlich ergänzt.
- Ein knapper Gleichstand zwischen möglichen Bezugspersonen führt zur Unterdrückung im normalen Vorschlagsstrom statt zu einer unmarkierten Identitätsentscheidung.
