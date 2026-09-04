## Why

Die automatische Anordnung stellt Geschwister derzeit nicht zuverlässig nach ihrem Geburtsdatum auf. Dadurch sammeln sich viele Nachfahren auf einer Seite und der Stammbaum bekommt eine stark nach links verzerrte Form. Eine chronologische Reihenfolge macht Familienzweige lesbarer und die Ausgangsanordnung räumlich ausgewogener.

## What Changes

- Geschwister werden innerhalb ihrer Familiengruppe von links nach rechts nach Geburtsdatum aufsteigend angeordnet: das älteste Kind zuerst.
- Halbgeschwister werden in derselben chronologischen Geschwisterlogik behandelt.
- Geburtsdaten werden anhand ihrer bekannten Komponenten chronologisch angeordnet; Personen ohne Geburtsdatum werden ans Ende der Gruppe gesetzt, ohne fehlende Komponenten zu ergänzen.
- Bei gleichen oder anderweitig nicht unterscheidbaren Daten wird eine deterministische Reihenfolge verwendet.
- Nur die automatisch berechnete Ausgangsanordnung wird angepasst. Gespeicherte Positionen, temporäres Verschieben, Ehepartner-Blöcke und Generationshöhen bleiben unverändert.
- Eine ausführbare Regression deckt die Reihenfolge und die Behandlung unbekannter Daten ab.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-automation`: Die Anforderung an die automatische, deterministische Anordnung wird um eine chronologische Reihenfolge für Geschwistergruppen ergänzt.

## Impact

- Betroffen ist die Layout-Berechnung der Arbeitsfläche und ihr bestehender Test-Seam.
- Es werden keine öffentlichen Datenformate, Beziehungen oder Abhängigkeiten geändert.
- Die Änderung bleibt auf die automatische Ausgangsposition beschränkt und erfordert keine Migration gespeicherter Dokumente.
- Abnahme: fokussierte Layout-Regression, anschließend `npm test` und `npm run build`.
