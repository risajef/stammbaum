## Context

Die bestehende OCR-Erkennung erzeugt neue Personenvorschläge aus Familienmustern. `scoreBreakdownFor` bewertet dabei Name, erkannte Datumspräzision, Geschlecht, Beziehungstyp und Quelle; die Eltern-Kind-Beziehungsdimension ist derzeit unabhängig vom Altersabstand pauschal. Die geladenen OCR-Seiten liegen bereits im `OcrImportViewState`, während `OcrSuggestionsPanel` aktuell nur offene Vorschläge darstellt.

## Goals / Non-Goals

**Goals:**

- Eltern-Kind-Vorschläge anhand bekannter Geburtsjahre richtungsrichtig zeitlich plausibilisieren und extreme Abstände aus der normalen Vorschlagsliste entfernen.
- Die Bedeutung des neuen Personendatums als erkannte OCR-Präzision und als Altersvergleich klar trennen.
- Eine wiederverwendbare, testbare OCR-Personensuche mit Score und Quellenbeleg bereitstellen.
- Die Suche sichtbar, explizit auslösbar und ohne fachliche Seiteneffekte in das vorhandene OCR-Panel integrieren.

**Non-Goals:**

- Keine automatische Korrektur oder Zusammenführung bestehender Personen.
- Keine Änderung am OCR-Backend, an der Dateiauswahl oder am YAML-Schema.
- Keine statistische Namens- oder Alterswahrscheinlichkeit und keine automatische Übernahme eines OCR-Treffers.

## Decisions

### Altersprüfung bleibt in der bestehenden Score-Dimension für Beziehung/Plausibilität

Die Richtung wird aus dem Vorschlagstyp abgeleitet: Bei `candidate-child` ist die vorhandene Person der Elternteil, bei `candidate-parent` die neue Person. Nur bekannte Geburtsjahre werden verglichen. Für Eltern-Kind-Beziehungen erhält ein Abstand von 20–45 zehn Punkte; 15–19 beziehungsweise 46–60 erhalten fünf Punkte; 12–14 beziehungsweise 61–70 erhalten zwei Punkte. Abstände unter 12 oder über 70 liefern einen harten Ausschluss. Bei fehlenden Jahren bleibt die bisherige Beziehungsevidenz neutral. Ehevorschläge werden nicht mit dieser Elternaltersregel bewertet.

Diese Abstufung bewahrt seltene historische Ausnahmen als schwächere Treffer, verhindert aber den konkreten 106-Jahre-Fehler. Eine reine Punktabwertung wäre bei der bestehenden Mindestschwelle nicht ausreichend, weil Name, OCR-Datumspräzision und Quelle auch bei einem unplausiblen Elternteil noch einen hohen Score erzeugen könnten.

### OCR-Datumspräzision und Altersvergleich werden getrennt erklärt

Die Datumsdimension bleibt die Bewertung dafür, wie präzise ein OCR-Geburtsdatum erkannt wurde beziehungsweise wie gut ein vorhandener Vergleich passt. Die Beziehungsdimension enthält die zeitliche Eltern-Kind-Plausibilität. Die lesbaren Score-Gründe nennen den Altersabstand beziehungsweise `unbekannt`, ohne ein fehlendes Datum zu erfinden.

### Personensuche erhält einen eigenen Treffer-Typ

Die Suche verwendet einen separaten `OcrPersonMatch` statt `OcrSuggestion`. Ein Personentreffer darf keine Annahme-/Ablehnungsaktionen oder neue Person repräsentieren. Er enthält die vorhandene Personen-ID, den OCR-Namen, Score-Aufschlüsselung, OCR-Ausschnitt, Quelle und Review-Link. So bleiben bestehende offene Vorschläge und deren Übernahme-Workflow unverändert.

### Die Suche arbeitet zeilenbezogen auf allen geladenen OCR-Seiten

Die Suche verwendet die vorhandene fehlertolerante Namensnormalisierung und untersucht jede geladene Seite zeilenweise. Nahe erkannte Datumsangaben und Familienmarker liefern Datums- beziehungsweise Beziehungsevidenz; die Quelle erhält dieselbe Modellpriorität wie bei Vorschlägen. Die Aktion wird erst auf Benutzeranstoß ausgeführt, um nicht bei jedem Node-Klick alle Seiten erneut zu scannen.

### Das OCR-Panel bleibt die gemeinsame Rechercheoberfläche

Wenn eine Person ausgewählt ist und OCR-Seiten geladen sind, zeigt das Panel eine aktivierbare Aktion mit dem Namen der Person. Die Ergebnisse erscheinen in einem getrennten Bereich neben den offenen neuen Personenvorschlägen. Ohne Auswahl oder geladene Seiten bleibt die Aktion deaktiviert oder erklärt den fehlenden Zustand.

## Risks / Trade-offs

- [Risiko] Historische Eltern außerhalb der Standardspanne werden zu stark abgewertet. → Nur extreme Abstände unter 12 oder über 70 werden unterdrückt; Zwischenbereiche bleiben als schwächere, erklärbare Treffer sichtbar.
- [Risiko] Eine zeilenweise OCR-Suche kann viele ähnliche Namenszeilen finden. → Mindestähnlichkeit, Score-Sortierung und sichtbare Quellen-/Ausschnittbelege machen die Prüfung kontrollierbar; die Suche wird nicht automatisch übernommen.
- [Risiko] Viele geladene Seiten verlängern eine Suche. → Die Berechnung läuft nur auf explizite Aktion und verwendet keine neue externe Abhängigkeit.

## Migration Plan

Keine Datenmigration. Die neue Trefferstruktur ist flüchtig und wird nicht exportiert. Bestehende OCR-Vorschläge und gespeicherte YAML-Dateien bleiben kompatibel.
