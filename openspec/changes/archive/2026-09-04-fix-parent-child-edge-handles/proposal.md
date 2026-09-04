## Why

Gespeicherte Eltern-Kind-Kanten werden aktuell nicht an ihre semantischen Handles gebunden. Dadurch kann eine ausgehende Eltern-Kind-Kante am seitlichen Ehe-Handle eines Person-Nodes beginnen und die fachliche Richtung visuell falsch darstellen.

## What Changes

- Eltern-Kind-Kanten verwenden beim Rendern explizit den unteren Handle der Elternperson als Start und den oberen Handle der Kindperson als Ziel.
- Ehekanten verwenden explizit die seitlichen Ehe-Handles beider Personen.
- Ein Regressionstest stellt sicher, dass die Kantenendpunkte auch bei Nodes mit seitlichen Ehe-Handles korrekt bleiben.
- Die fachlichen Beziehungen, das YAML-Format und das automatische Layout bleiben unverändert.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-editor`: Sichtbare Beziehungskanten müssen an den zur Beziehung passenden Handles starten und enden.

## Impact

- Die Graph-Projektion erhält explizite Handle-Zuordnungen für gespeicherte Kanten.
- Die bestehenden React-Flow-Nodes und Beziehungstypen werden weiterverwendet.
- Es sind keine neuen Abhängigkeiten, Datenmigrationen oder Änderungen an Domain-IDs erforderlich.

