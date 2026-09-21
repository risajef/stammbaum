## Why

Das Projekt braucht ein reproduzierbares, lokales Statistik-Tool für eine YAML-Stammbaumdatei. Bisher führt der erwartete Aufruf `generate-family-statistics.mjs` zu `MODULE_NOT_FOUND`, sodass die gewünschten Alters-, Heirats- und Wiederheiratsauswertungen nicht erzeugt werden können.

## What Changes

- Füge ein Node-Script hinzu, das eine Stammbaum-YAML einliest und eine eigenständige HTML-Datei mit drei Histogrammen erzeugt.
- Werte das Alter der Personen beim Tod beziehungsweise am Auswertungsdatum für lebende Personen aus.
- Werte das Heiratsalter je Person nach der gemeinsamen Kinderzahl der Ehe aus.
- Werte die Zeit zwischen aufeinanderfolgenden datierten Eheschließungen derselben Person aus.
- Berücksichtige Teil-Datumsangaben über das bekannte Jahr und kennzeichne daraus entstehende Näherungen.
- Ändere die eingelesene YAML-Datei nicht und benötige keine externe Laufzeitabhängigkeit im erzeugten HTML.

## Capabilities

### New Capabilities

- `family-statistics`: Lokale Erzeugung einer HTML-Statistik aus einer Stammbaum-YAML.

### Modified Capabilities

- Keine.

## Impact

- Neues Script `scripts/generate-family-statistics.mjs` und zugehörige Node-Tests.
- Keine Änderungen an der React-Anwendung oder am YAML-Datenmodell.
- Die Auswertung nutzt die vorhandenen `persons`, `parent-child`- und `marriage`-Einträge sowie `birthYear`, `deathYear` und `startDate`.
