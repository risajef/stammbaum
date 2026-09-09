## Why

Die OCR-Bewertung kann derzeit einen Vorschlag mit einem unplausiblen Eltern-Kind-Altersabstand sehr hoch bewerten. Ein Kind mit Geburtsjahr 1790 und eine Bezugsperson mit Geburtsjahr 1684 dürfen deshalb nicht als `98/100` erscheinen, wenn die zeitliche Beziehung nicht plausibel ist. Zusätzlich fehlt eine umgekehrte Recherche, mit der bereits vorhandene Stammbaumpersonen in den geladenen OCR-Seiten gesucht und geprüft werden können.

## What Changes

- Die Eltern-Kind-Bewertung vergleicht bekannte Geburtsjahre von neuer Person und vorhandener Bezugsperson; das Geburtsjahr der neuen Person wird dabei nicht als Identitätsübereinstimmung gewertet.
- Ein Elternalter von 20 bis 45 Jahren erhält die normale zeitliche Bewertung. Außergewöhnliche, aber mögliche Abstände werden abgewertet und extreme Abstände wie 106 Jahre aus der normalen Vorschlagsliste unterdrückt. Fehlt ein Geburtsjahr, bleibt die Altersprüfung neutral.
- Die Score-Begründung macht eine ungewöhnliche oder nicht plausible zeitliche Beziehung nachvollziehbar.
- Eine ausgewählte Person kann über eine explizite OCR-Suchaktion in allen geladenen OCR-Seiten gesucht werden. Kleine OCR-Schreibfehler werden toleriert.
- Die Treffer der Personensuche werden mit derselben 0–100-Metrik sortiert und zeigen Score, Begründung, OCR-Ausschnitt sowie Quelle und Seite.
- Personensuche und Trefferanzeige bleiben lesend; sie erzeugen, ändern oder entfernen keine Stammbaumdaten und ersetzen keine neuen Personenvorschläge.

## Capabilities

### New Capabilities

Keine neue Hauptfähigkeit.

### Modified Capabilities

- `family-tree-ocr-suggestions`: Alters-Plausibilität bei Eltern-Kind-Vorschlägen und lesende OCR-Suche für eine ausgewählte vorhandene Person.

## Impact

- Betroffen sind die OCR-Erkennung und Score-Berechnung unter `src/ocr/`, der OCR-Panel-Zustand in `src/App.tsx`, die Darstellung im OCR-Panel sowie die zugehörigen Unit-, Komponenten- und App-Tests.
- Die lokale OCR-Quelle und das YAML-Datenmodell bleiben unverändert; es werden keine neuen Laufzeitabhängigkeiten benötigt.
- Die Suche arbeitet auf den bereits geladenen OCR-Seiten und darf die Quelle weiterhin nur lesen.

## Acceptance Criteria

- Ein Kind mit Geburtsjahr 1790 und einer Bezugsperson mit Geburtsjahr 1684 wird nicht als normaler OCR-Vorschlag mit hohem Score angezeigt.
- Ein bekannter Elternabstand von 20 bis 45 Jahren wird als zeitlich plausibel behandelt; fehlende Jahreswerte führen nicht zu einer erfundenen Bewertung.
- Das Geburtsdatum der neuen Person erhält Punkte für seine erkannte Genauigkeit, aber nicht für eine vermeintliche Übereinstimmung mit der eigenen noch nicht vorhandenen Person.
- Eine ausgewählte Stammbaumperson kann alle passenden OCR-Stellen anzeigen lassen; die Ergebnisse sind fehlertolerant, sortiert und mit Quelle und Ausschnitt prüfbar.
- Die Recherche verändert weder Personen, Beziehungen, OCR-Vorschläge noch den Dirty-State.
- Bestehende OCR-Annahme, Ablehnung, Ranking, Quelllinks und Personensuche im Stammbaum bleiben funktionsfähig.

## Assumptions

- Ein Elternalter unter 12 oder über 70 Jahren gilt als extrem unplausibel und wird aus der normalen Vorschlagsliste ausgeschlossen; Zwischenbereiche werden nur abgewertet. Diese konservative Grenze verhindert den konkreten 106-Jahre-Fehler, ohne jede historische Ausnahme zu verwerfen.
- Die Personensuche wird als explizite Aktion im OCR-Bereich ausgelöst, damit die OCR-Seiten nicht bei jedem Node-Klick vollständig neu durchsucht werden.
- Für die Personensuche werden alle bereits geladenen OCR-Seiten berücksichtigt; dieselbe Abschnitts- und Quellenpriorität bleibt für die Sortierung erhalten.
