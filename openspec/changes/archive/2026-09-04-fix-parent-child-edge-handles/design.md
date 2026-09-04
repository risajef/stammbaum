## Context

Die Person-Nodes stellen mehrere semantische Handles bereit. Die Graph-Projektion erzeugt gespeicherte React-Flow-Kanten bisher nur mit Personen-IDs. Ohne explizite Handle-Referenzen waehlt React Flow den ersten passenden Handle, wodurch eine Eltern-Kind-Kante am seitlichen Ehe-Handle starten kann.

## Goals / Non-Goals

**Goals:**

- Gespeicherte Kanten an dieselben semantischen Handles binden, die beim Erstellen der Beziehung verwendet werden.
- Eltern-Kind-Kanten vom unteren Eltern-Handle zum oberen Kind-Handle rendern.
- Ehekanten an den seitlichen Ehe-Handles rendern.
- Die Korrektur durch einen Graph-Projektions-Regressionstest absichern.

**Non-Goals:**

- Keine Aenderung an Domain-Beziehungen, IDs, YAML oder Layoutberechnung.
- Keine neue Kantenform und keine neue Handle-Art.
- Keine Aenderung an der Validierung oder am Bestätigungsfluss.

## Decisions

Die Graph-Projektion setzt bei jeder erzeugten Kante `sourceHandle` und `targetHandle` explizit anhand des gespeicherten Beziehungstyps. Fuer `parent-child` werden der bestehende untere Source-Handle und der obere Target-Handle verwendet. Fuer `marriage` werden die bestehenden seitlichen Ehe-Handles auf beiden Seiten verwendet.

Diese Zuordnung wird in der Projektion vorgenommen, weil dort das persistierte Domain-Modell in die sichtbare React-Flow-Darstellung uebersetzt wird. Eine Aenderung der Node-DOM-Reihenfolge oder der automatischen React-Flow-Auswahl kann damit die fachliche Kantenrichtung nicht mehr beeinflussen.

Als Alternative wurde die automatische Handle-Auswahl beibehalten verworfen: Sie ist genau die Ursache des Bugs und bleibt bei mehreren Source-Handles instabil. Ein eigener Edge-Typ waere fuer die reine Endpunktzuordnung unnoetig komplex.

## Risks / Trade-offs

- [Risiko] Eine bereits gespeicherte Beziehung kann auf eine Person ohne passenden Handle zeigen, wenn das Geschlecht nachtraeglich geaendert oder alte Daten importiert wurden. -> [Mitigation] Die bestehende Domain-Validierung verhindert ungueltige Ehen; fuer Eltern-Kind-Beziehungen bleiben obere und untere Handles immer vorhanden.
- [Risiko] Die sichtbare Geometrie aendert sich bei bestehenden Kanten. -> [Mitigation] Das entspricht der fachlichen Semantik; Beziehungstyp, Richtung und Layoutpositionen bleiben unveraendert.

