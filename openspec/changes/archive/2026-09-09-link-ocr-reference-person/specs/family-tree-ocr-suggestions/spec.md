## Purpose

Diese Fähigkeit verbindet OCR-Vorschläge mit dem vorhandenen Stammbaum, damit die genannte Bezugsperson ohne erneute Suche geprüft und im Kontext bearbeitet werden kann.

## ADDED Requirements

### Requirement: Bezugspersonen eines OCR-Vorschlags sind direkt erreichbar

Die Anwendung MUST den Namen einer im Stammbaum vorhandenen Bezugsperson in der OCR-Vorschlagskarte als zugängliche Aktion anzeigen. Wird diese Aktion ausgelöst, MUSS die Anwendung genau die durch die Vorschlagsreferenz bestimmte Person auswählen, ihren sichtbaren Stammbaumknoten fokussieren und den bestehenden Personen-Inspector für diese Person anzeigen. Die Aktion MUST eine reine Navigation bleiben und darf weder den Dokumentinhalt noch den Dirty-State verändern.

#### Scenario: Bezugsperson aus einer Vorschlagskarte öffnen

- **GIVEN** eine OCR-Vorschlagskarte verweist über ihre stabile Personenreferenz auf `Anna Weber`
- **WHEN** die Benutzerin den klickbaren Namen `Anna Weber` in der Karte auslöst
- **THEN** wird `Anna Weber` im Stammbaum ausgewählt, die Arbeitsfläche auf ihren Knoten fokussiert und ihr Personen-Inspector angezeigt

#### Scenario: Gleichnamige Bezugspersonen bleiben eindeutig

- **GIVEN** zwei vorhandene Personen denselben angezeigten Namen haben und zwei Vorschläge jeweils auf eine andere stabile Personenreferenz zeigen
- **WHEN** die Benutzerin den Namen in einer der Karten auslöst
- **THEN** wird die zur Karte gehörende Personenreferenz ausgewählt und nicht lediglich ein gleichnamiger Treffer anhand des Namens

#### Scenario: Unbekannte Bezugsperson ist nicht navigierbar

- **GIVEN** die Personenliste enthält keine Person zur Bezugsperson-Referenz eines Vorschlags
- **WHEN** die Vorschlagskarte dargestellt wird
- **THEN** zeigt sie den bisherigen Hinweis auf eine unbekannte Bezugsperson ohne klickbare Aktion zu einer falschen Person

#### Scenario: Navigation verändert keine OCR- oder Fachdaten

- **GIVEN** eine OCR-Vorschlagskarte und ein unveränderter geladener Stammbaum werden angezeigt
- **WHEN** die Benutzerin die Bezugsperson öffnet
- **THEN** bleiben Vorschlagskarte, Personenanzahl, Beziehungen, OCR-Daten und Speichern-Status unverändert
