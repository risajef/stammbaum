## Why

Eine OCR-Vorschlagskarte nennt bereits die vorhandene Bezugsperson, bietet aber keinen direkten Weg zu ihr im Stammbaum. Bei wiederkehrenden Namen muss die Benutzerin die Person deshalb selbst suchen und kann den Kontext der vorgeschlagenen Beziehung nur umständlich prüfen.

## What Changes

- Die angezeigte Bezugsperson eines OCR-Vorschlags wird als zugängliches Navigationselement dargestellt.
- Ein Klick auf die Bezugsperson wählt die vorhandene Person im Stammbaum aus, fokussiert sie in der Arbeitsfläche und öffnet ihren bestehenden Personen-Inspector.
- Der Klick verwendet die stabile Personen-ID des Vorschlags; gleichnamige Personen werden dadurch eindeutig unterschieden.
- Für eine nicht mehr auflösbare Bezugsperson bleibt die bisherige Fallback-Anzeige erhalten und es wird kein ungültiges Navigationselement angeboten.
- Vorschlag bearbeiten, Vorschlag ablehnen, OCR-Quelllink und der Dokumentzustand bleiben unverändert.

## Capabilities

### New Capabilities

- `family-tree-ocr-suggestions`: Direkte Navigation von einer OCR-Vorschlagskarte zur vorhandenen Bezugsperson.

### Modified Capabilities

Keine Hauptspezifikation wird direkt geändert; die bestehende OCR-Vorschlagsfähigkeit wird um die Navigation zur bereits vorhandenen Bezugsperson ergänzt.

## Impact

- Betroffen sind `OcrSuggestionsPanel`, die App-Auswahl-/Fokussteuerung und deren UI-Tests.
- Es wird keine neue Abhängigkeit und keine Änderung am OCR- oder YAML-Datenmodell benötigt.
- Die Aktion darf keinen neuen Datensatz erzeugen, keine OCR-Karte entfernen und den Dirty-State nicht verändern.

## Acceptance Criteria

- Eine Vorschlagskarte mit einer bekannten Bezugsperson zeigt deren Namen als klickbares, zugängliches Element.
- Der Klick auf dieses Element selektiert genau die per `existingPersonId` referenzierte Person, fokussiert ihren Node und zeigt deren bestehende Personmaske.
- Zwei gleichnamige Personen führen über ihre jeweilige Karte zur jeweils richtigen stabilen ID.
- Eine unbekannte Bezugsperson wird nicht als klickbarer Link zu einer falschen Person dargestellt.
- Bestehende OCR-Vorschlags- und Suchfunktionen bleiben erfolgreich testbar.

## Assumptions

- „Ähnlich wie bei der Suche“ bedeutet, dass Auswahl, Arbeitsflächen-Fokus und Personen-Inspector gemeinsam ausgelöst werden.
- Die Bezugsperson ist eine bereits im geladenen Stammbaum vorhandene Person; die Aktion ist nur Navigation und keine Bearbeitung.
