## Why

Die automatisch berechnete Familienansicht ist als Orientierung hilfreich, aber beim Erstellen von Beziehungen muessen Personen voruebergehend besser zueinander positioniert werden koennen. Ausserdem soll die gesamte Struktur auch bei vielen oder weit auseinanderliegenden Personen erreichbar bleiben. Diese Arbeitspositionen sind reine Ansichtszustandsdaten und duerfen nicht in die fachliche YAML-Datei gelangen.

## What Changes

- Das automatische Layout bleibt die Ausgangsbasis, wird kompakter und horizontal um die Mitte der Arbeitsflaeche zentriert.
- Personenkoordinaten koennen waehrend der aktuellen Sitzung temporaer per Drag angepasst werden, damit Verbindungen leichter erstellt und geprueft werden koennen.
- Temporaere Node-Positionen werden ausschliesslich im UI-Zustand gehalten, nicht in `FamilyTreeDocument` uebernommen und niemals als gespeicherte Personenpositionen exportiert.
- Beim Ersetzen oder Importieren eines Dokuments werden temporaere Positionen verworfen; fachliche Dokumentaenderungen berechnen die Ansicht neu.
- View-Panning bleibt moeglich, ohne dass das Ziehen eines Nodes gleichzeitig die Arbeitsflaeche verschiebt.
- React Flow und Fit-View erlauben einen deutlich staerkeren Zoom-Out bis zu `0.01`.

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `family-tree-automation`: Kompakte, zentrierte Ausgangspositionen und getrennte temporaere Positions-Overrides fuer die Arbeitsflaeche.
- `family-tree-editor`: Nodes sind waehrend der Sitzung beweglich, ohne fachliche Daten oder YAML zu veraendern; Import und Dokumentwechsel verwerfen diese Overrides.

## Impact

- `src/graph/graph-projection.ts` akzeptiert temporaere Positions-Overrides und liefert die kompakten, zentrierten Ausgangspositionen.
- `src/App.tsx` verwaltet Overrides getrennt vom `FamilyTreeDocument`, verarbeitet ausschliesslich Position-Aenderungen und setzt die Zoomgrenzen.
- `src/components/PersonNode.tsx` behaelt die Trennung zwischen Node-Dragging und View-Panning ueber `nopan`.
- Graph- und End-to-End-Tests decken Layout, Dragging, Zoom und den unveraenderten YAML-Export ab.
- Das versionierte YAML-Schema und die fachliche Dokumentstruktur bleiben unveraendert; es gibt keine neue Abhaengigkeit und keine serverseitige Persistenz.
