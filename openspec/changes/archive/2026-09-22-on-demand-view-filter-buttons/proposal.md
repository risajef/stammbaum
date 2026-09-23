## Why

Die Blutlinien- und Vorfahrenfilter reagieren derzeit automatisch auf jede neue Personenauswahl, weil ihr Anker direkt aus der aktuellen Auswahl abgeleitet wird. Dadurch springt eine bereits bewusst gefilterte Ansicht beim Wechsel zu einer anderen Person unerwartet um; außerdem verschwinden neu angelegte Personen sofort wieder, wenn sie den aktuellen Filterkriterien nicht entsprechen.

## What Changes

- Die Optionen „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“ und „Erweiterte direkte Vorfahren“ werden als auslösende Buttons dargestellt.
- Ein Klick auf einen personenbezogenen Filter übernimmt die aktuell ausgewählte Person als Filteranker und wendet den Filter genau in diesem Moment an.
- Ein erneuter Klick auf denselben Button wendet denselben Filter erneut auf die dann ausgewählte Person an.
- Das Auswählen einer anderen sichtbaren Person ändert die bestehende Filterprojektion nicht; nur der Inspektor wechselt.
- Die Buttons erhalten keinen dauerhaften Auswahl- oder Checked-Zustand.
- Neu angelegte Personen bleiben bis zum erfolgreichen YAML-Speichern unabhängig von den aktiven Ansichtsfiltern sichtbar. Danach werden sie wie alle anderen Personen gefiltert.
- Lokale Ansicht, Leaf-Filter, bestehende Filterlogik, Layout, Dokumentdaten und YAML-Inhalt bleiben ansonsten unverändert.

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `family-tree-views`: Filteraktionen werden explizit ausgelöst und neu angelegte Personen werden bis zum YAML-Speichern von Ansichtsfiltern ausgenommen.

## Impact

- Betroffen sind die Filterzustände und die Filtersteuerung in `src/App.tsx` sowie die View-Projektion in `src/graph/graph-view.ts` und deren Tests.
- Es werden keine neuen Abhängigkeiten, Persistenzfelder oder YAML-Schlüssel eingeführt.
- Der relevante Testbefehl ist `npm test`; zusätzlich soll der TypeScript-/Vite-Build mit `npm run build` verifiziert werden.
- Annahme: Ohne ausgewählte Person haben personenbezogene Blutlinienbuttons keinen Anker und ändern die Ansicht nicht; „Alle Personen“ kann den Blutlinienfilter jederzeit zurücksetzen. Andere aktive Filter bleiben dabei bestehen.
