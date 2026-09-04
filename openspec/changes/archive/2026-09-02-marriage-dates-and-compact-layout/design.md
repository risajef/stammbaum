## Context

Die Anwendung verwendet eine kontrollierte React-Flow-Projektion aus `FamilyTreeDocument`. Personenpositionen werden bereits deterministisch aus Ehe- und Eltern-Kind-Beziehungen erzeugt; gespeicherte Positionen sind nur Legacy-Daten und temporaere Verschiebungen gehoeren nicht in das YAML. Ehebeziehungen besitzen bislang nur Typ, Status, Quelle und Kommentar. Die yFiles-TreeLayout-Dokumentation bestaetigt hierarchische Generationen, konfigurierbare Knotenabstaende und kompakte Teilbaeume als geeignete Leitideen. Die Anwendung hat aber auch symmetrische Ehen und damit keine reine Baumstruktur, weshalb eine weitere Layout-Abhaengigkeit fuer diesen kleinen Graphen nicht gerechtfertigt ist.

## Goals / Non-Goals

**Goals:**

- Ehe-Startdaten an der bestehenden Relationship-Grenze validieren, speichern, importieren und im Inspektor anzeigen.
- Implizite Ehe-Enden aus Partner-Todesdaten sicher und ohne zusaetzliche Persistenz ableiten.
- Ehe- und Eltern-Kind-Kanten weich, farblich und durch Richtung unterscheidbar darstellen.
- Die vorhandene deterministische Layoutlogik in kompakte Generationen und Familienbloecke ueberfuehren.
- Neue Personen nach dem Speichern in Flow-Koordinaten auf die Mitte des aktuell sichtbaren Canvas abbilden.

**Non-Goals:**

- Keine neue Schema-Version und keine Umbenennung bestehender Personenfelder.
- Kein editierbares oder persistiertes Ehe-Enddatum.
- Keine vollstaendige yFiles-Integration und keine serverseitige Layoutberechnung.
- Keine Speicherung temporaerer Node-Positionen.

## Decisions

### 1. `startDate` bleibt ein optionales Beziehungsfeld

`Relationship` erhaelt `startDate?: PartialDate | null`; beim Erzeugen und Aktualisieren wird der Wert normalisiert und mit der vorhandenen Partial-Date-Utility validiert. YAML akzeptiert das optionale Stringfeld, normalisiert es auf `null` oder den kanonischen String und laesst alte Beziehungen ohne Feld unveraendert importierbar. Ein neues Pflichtfeld oder eine Schema-Migration waere fuer bestehende Dateien unverhaeltnismaessig.

### 2. Das Ehe-Ende wird nur sicher aus beiden Todesdaten berechnet

Eine kleine Beziehungshilfe sucht die beiden Partner und verwendet nur vollstaendig sichere Teilvergleiche. Wenn beide Todeswerte gleich sind, wird dieser Wert verwendet; wenn ein sicherer Vergleich ein frueheres Datum bestimmt, wird dieses verwendet; bei fehlendem oder unentscheidbarem Wert bleibt das Ende offen. Das vermeidet die falsche Behauptung, ein einzelner bekannter Tod oder ein unsicherer Teilvergleich sei das exakte Eheende.

### 3. React-Flow bleibt die Darstellungsschicht

Ehen und Eltern-Kind-Beziehungen werden als weiche `simplebezier`-Kurven projiziert. Koralle und das Label `Ehe` kennzeichnen Ehen ohne Marker; Teal, das Label `Eltern-Kind` und ein Marker zum Kind kennzeichnen Elternschaften. Ein gestrichelter Status fuer `inferred` macht abgeleitete Beziehungen zusaetzlich sichtbar. Ein eigener Edge-Typ oder yFiles wird nicht eingefuehrt, weil diese React-Flow-Einstellungen die beobachtbare Unterscheidung abdecken.

### 4. Kompakte Layoutzeilen statt globaler Personenindizes

Ehepartner und Co-Eltern werden weiterhin zu gleichrangigen Familienbloecken vereinigt; Eltern-Kind-Beziehungen verbinden nur Generationen, nicht deren Knoten in einem horizontalen Block. Die Generation wird pro Block als maximale Elterngeneration plus eins berechnet. Innerhalb einer Zeile werden Bloecke nach stabiler Reihenfolge und Elternmittelpunkt sortiert, mit engeren Partner-/Geschwisterabstaenden kollisionsfrei gepackt und anschliessend um den gewuenschten Zeilenmittelpunkt verschoben. Globale Personenindizes erzeugen keine kuenstlichen Leerraeume mehr.

### 5. Neue Personen werden nach dem sichtbaren Viewport zentriert

Die App fuehrt die React-Flow-Instanz ueber einen Provider bis zur Workbench und markiert beim erfolgreichen Erzeugen einer Person deren ID als Zentrierauftrag. Nach dem Rendern wird der Mittelpunkt des `.flow-surface` in Flow-Koordinaten umgerechnet und als temporaere Node-Position gesetzt. Die fachliche Person bleibt ohne Position im Dokument; beim naechsten fachlichen Layoutwechsel werden die temporaeren Overrides wie bisher verworfen.

## Risks / Trade-offs

- **Teilweise Todesdaten koennen kein exaktes Eheende liefern** -> Das UI zeigt in diesem Fall offen/unbestimmt und erfindet keine Komponenten.
- **Kantenlabels koennen bei starkem Zoom eng stehen** -> Labels bleiben kurz, erhalten einen opaken Hintergrund und die Typunterscheidung wird zusaetzlich durch Form, Farbe und Marker getragen.
- **Ueberlappende Elternbeziehungen koennen die ideale Zentrierung begrenzen** -> Die Layoutzeile wird zuerst kollisionsfrei gepackt und erst danach als Ganzes verschoben; deterministische Abstaende haben Vorrang.
- **Viewport-Zentrierung haengt von gemessener Canvas-Groesse ab** -> Die Position wird erst nach dem DOM-Rendern berechnet; fehlt die Messung, bleibt der bestehende automatische Fallback aktiv.

## Migration Plan

1. Rote Domain-, YAML-, Inspector- und Graphprojektionstests fuer Ehe-Start/Ende und Kantensemantik ergaenzen.
2. Relationship-Typen, Validierung, Persistence und Inspector um `startDate` und die implizite Endeanzeige erweitern.
3. Kompakte Layoutzeilen und die Viewport-Zentrierung implementieren; fokussierte Layout-/App-/E2E-Tests gruen machen.
4. Vollsuite, E2E-Suite, Build, Editor-Diagnosen, OpenSpec-Validierung und Whitespace-Pruefung ausfuehren.
5. Delta-Specs in die Haupt-Specs synchronisieren und den Change archivieren.

## Open Questions

Keine. Die Format-, Persistenz-, Darstellungs- und Layoutentscheidungen sind durch die Benutzerbestaetigung festgelegt.
