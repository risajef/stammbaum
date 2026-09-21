## Why

Das Histogramm „Alter der Personen“ wertet Personen ohne Todesdatum derzeit ersatzweise bis zum Auswertungsdatum aus. Bei historischen Geburtsjahren entstehen dadurch unrealistische Alterswerte und eine x-Achse, die bis weit über 100 Jahre reicht.

## What Changes

- Für das Personenalter werden nur Personen mit auswertbarem Geburts- und Todesdatum berücksichtigt.
- Personen ohne Todesdatum werden aus dem Personenalter-Histogramm ausgeschlossen; das Auswertungsdatum dient dafür nicht mehr als Ersatz-Ende.
- Die x-Achse des Histogramms reicht weiterhin dynamisch nur bis zur höchsten tatsächlich vorhandenen Altersklasse.
- Die Beschriftung der Statistik wird an „Alter beim Tod“ angepasst.
- Die Heiratsalter- und Wiederheiratsstatistiken bleiben unverändert.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-statistics`: Die Definition des auswertbaren Personenalters wird auf bekannte Todesdaten beschränkt.

## Impact

- Betroffen ist die Berechnung und Darstellung in `scripts/generate-family-statistics.mjs` sowie deren Tests.
- Bestehende HTML-Ausgaben müssen nach der Änderung neu erzeugt werden.
- Es sind keine neuen Abhängigkeiten und keine Änderungen an der YAML-Datenstruktur erforderlich.
