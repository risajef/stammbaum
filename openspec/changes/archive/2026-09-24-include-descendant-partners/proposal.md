## Why

Der direkte Nachkommenfilter zeigt bisher nur die blutsverwandten Nachkommen. Dadurch fehlen die Partner des ausgewählten Ankers und die direkten Partner der angezeigten Nachkommen, obwohl diese für die Interpretation des Stammbaums unmittelbar relevant sind.

## What Changes

- Die Ansicht „Nachkommen“ zeigt zusätzlich den Partner des Ankers und die direkten Partner aller angezeigten Nachkommen.
- Die Ansicht „Erweiterte Nachkommen“ übernimmt diese Partner und erweitert weiterhin nur die Familienlinien der Partner tatsächlicher Nachkommen; Partnerketten und die eigene Familienlinie des Ankerpartners werden nicht verfolgt.
- Die kombinierten Vor- und Nachkommenfilter übernehmen dieselbe Partnerregel entsprechend ihrer direkten oder erweiterten Nachkommenansicht.

## Capabilities

### New Capabilities

Keine neuen Fähigkeiten.

### Modified Capabilities

- `family-tree-views`: Nachkommenansichten und kombinierte Ansichten enthalten die relevanten direkten Partner, ohne zusätzliche Partnerfamilien im direkten Modus oder Partnerketten einzublenden.

## Impact

- Die Filterprojektion in `src/graph/graph-view.ts` und ihre Regressionstests werden angepasst.
- Bestehende Filterbedienung, Persistenz und Exportformate bleiben unverändert.
- Es werden keine neuen Abhängigkeiten oder öffentlichen APIs benötigt.
