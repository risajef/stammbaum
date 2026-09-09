## Context

Die OCR-Karte kennt die stabile `existingPersonId` bereits und erhält die Personenliste zur Beschriftung. Die Auswahl, der Arbeitsflächen-Fokus und die Anzeige des Inspectors liegen dagegen im App-Zustand; die vorhandene Personensuche setzt diese Zustände bereits gemeinsam.

## Goals / Non-Goals

**Goals:**

- Die Karte stellt die bekannte Bezugsperson als zugänglichen internen Navigationsbutton dar.
- Die App übernimmt die Personen-ID und verwendet denselben Auswahl-/Fokusablauf wie die Suche.
- Ein fehlender Personen-Datensatz bleibt eine nicht interaktive Fallback-Anzeige.

**Non-Goals:**

- Keine Änderung an OCR-Erkennung, Ranking, Datenmodell, Beziehungen oder Speicherung.
- Keine externe URL und kein neuer Suchindex für die Bezugsperson.

## Decisions

### Navigation wird als Callback zwischen Karte und App geführt

`OcrSuggestionsPanel` erhält einen Callback für die vorhandene Personen-ID. Damit bleibt die Karte für Darstellung und zugängliche Interaktion zuständig, während nur die App den globalen Auswahl- und Fokuszustand ändern darf. Eine direkte Manipulation des React-Flow-Zustands im Panel würde die bestehende Zustandsgrenze umgehen.

### Ein Button ist passender als ein Link

Die Aktion navigiert innerhalb des aktuellen Editors und hat keine URL. Ein typischer Button kommuniziert diese Zustandsänderung korrekt für Tastatur- und Screenreader-Bedienung; der sichtbare Name bleibt der Personenname.

### Auswahl und Fokus verwenden den bestehenden Suchablauf

Die App setzt die Bearbeitung einer neuen Person und eine offene Beziehungsverbindung zurück, selektiert die referenzierte Person und erhöht die bestehende Fokus-Anforderung. Falls ein OCR-Editor geöffnet war, wird dessen temporärer Vorschlagskontext geschlossen, damit der Inspector eindeutig die ausgewählte vorhandene Person bearbeitet. Vor dem Setzen der Auswahl wird geprüft, dass die ID im aktuellen Dokument existiert.

### Fallback bleibt statisch

Wenn `existingPersonId` nicht in `persons` gefunden wird, rendert die Karte weiterhin den verständlichen Fallback-Text. Es wird kein Button ohne gültiges Ziel erzeugt.

## Risks / Trade-offs

- [Risiko] Ein Klick während einer laufenden OCR-Bearbeitung könnte den offenen Entwurf verlassen. → Die Navigation behandelt die vorhandene Person wie die Suche und verwirft nur den nicht gespeicherten temporären OCR-Editor; der Vorschlag und das Dokument bleiben unverändert.
- [Risiko] Ein Button könnte durch globale Button-Stile zu breit oder optisch unpassend erscheinen. → Eine kleine, lokale Inline-Klasse übernimmt die vorhandene Typografie und erhält sichtbare Hover-/Focus-Zustände.

## Migration Plan

Keine Datenmigration erforderlich. Die Änderung wird mit UI- und App-Regressionstests ausgerollt; ein Rückbau entfernt ausschließlich Callback, Button-Markup und die zugehörigen Fokus-Tests.
