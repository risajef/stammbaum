## Why

Geburts- und Todesdaten sind derzeit auf ganze Jahreszahlen beschraenkt. Historische Quellen enthalten jedoch oft einen bekannten Monat oder Tag, waehrend bei anderen Personen nur das Jahr oder gar kein Datum bekannt ist; die Anwendung soll diese Genauigkeit speichern und anzeigen koennen, ohne unbekannte Teile zu erfinden.

## What Changes

- Ersetze die bisherigen ganzzahligen Lebensjahre im Personenformular durch je ein optionales Datumsfeld.
- Erlaube `YYYY`, `YYYY-MM` und `YYYY-MM-DD`; leere Eingaben bleiben `null`.
- Behalte die bestehenden Felder `birthYear` und `deathYear` sowie schemaVersion 1 fuer Kompatibilitaet bei und normalisiere alte numerische YAML-Jahreswerte zu vierstelligen Jahresstrings.
- Validiere Monate, Tage und Kalenderdaten einschliesslich Schaltjahren sowie die Reihenfolge von Geburt und Tod, soweit sie mit den bekannten Komponenten sicher vergleichbar ist.
- Zeige Teil-Datumswerte auf den Personenknoten an und verwende sie in der zeitlichen Inferenz, ohne fehlende Komponenten als bekannt zu behandeln.
- Ergaenze Unit-, Komponenten- und Persistence-Tests fuer vollstaendige, teilweise, leere und ungueltige Datumswerte sowie fuer den YAML-Roundtrip.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-editor`: Personen koennen optionale Teil-Datumswerte fuer Geburt und Tod erfassen, validieren, anzeigen und als YAML roundtrippen.
- `family-tree-automation`: Die zeitliche Auswahl fuer automatisch abgeleitete Elternschaften vergleicht bekannte Datumskomponenten und behandelt fehlende Genauigkeit als unbekannt.

## Impact

Betroffen sind die Personentypen und -operationen, der Personeninspektor, die Dokument- und YAML-Validierung, die graphische Datumsanzeige, die automatische Beziehungsinferenz sowie die zugehoerigen Tests. Es werden keine neuen Abhaengigkeiten benoetigt; Dokumentmodellstruktur, Beziehungen, Layout und bestehende Jahr-only-Dateien bleiben kompatibel.

## Constraints and Acceptance Criteria

- Eine Person kann mit `YYYY`, `YYYY-MM`, `YYYY-MM-DD` oder ohne Geburt/Tod angelegt und bearbeitet werden.
- Ungueltige Monats-, Tages- und Kalenderwerte werden am jeweiligen Feld abgelehnt; vorhandene gueltige Daten bleiben bei einem Fehler unveraendert.
- Ein YAML-Roundtrip erhaelt die eingegebene Genauigkeit; alte numerische Jahreswerte bleiben importierbar.
- Eine sicher vor dem Geburtsdatum liegende Todesangabe wird bei der Inferenz ausgeschlossen; unbekannte Komponenten verhindern keine sichere Entscheidung, werden aber nicht geschaetzt.
- Die bestehende Unit- und E2E-Suite sowie Build und OpenSpec-Validierung bleiben gruen.
