## Why

Grosse Stammbäume sollen neben der bestehenden Vorfahren- und Blutsverwandtschaftsansicht auch gezielt von einer ausgewählten Person abwärts betrachtet werden können. Dafür fehlen bislang ein Nachkommenfilter und eine Variante, die die Partner der Nachkommen samt deren Kindern sichtbar macht.

## What Changes

- Einen Button „Nachkommen“ ergänzen, der die aktuell ausgewählte Person und alle ihre Nachkommen über beliebig viele Generationen anzeigt.
- Einen Button „Erweiterte Nachkommen“ ergänzen, der zusätzlich alle Partner der eingeschlossenen Nachkommen und deren Kinder einbezieht.
- Die neuen Buttons mit derselben On-demand-Bedienung wie die bestehenden Filter ausführen: Klick übernimmt den aktuellen Personenknoten als Anker; ein späterer Personenwechsel verändert die Projektion nicht; ein erneuter Klick wendet den Filter auf die neue Auswahl an.
- Partnerketten und die Familienlinien der Partner nicht rekursiv erweitern.
- Die bestehende Schnittmengenlogik mit lokaler Ansicht, Leaf-Filter und der Ausnahme für neu erstellte Nodes bis zum erfolgreichen YAML-Speichern beibehalten.

## Capabilities

### New Capabilities
- Keine.

### Modified Capabilities
- `family-tree-views`: Nachkommen- und erweiterte Nachkommenansichten als nicht persistierte, klickgebundene Filter ergänzen.

## Impact

- Betroffen sind die Filtermodi und die Button-Steuerung in `src/App.tsx` sowie die reine Graph-Projektion in `src/graph/graph-view.ts` und ihre Tests.
- Es werden keine neuen YAML-Felder, Persistenzdaten oder Abhängigkeiten eingeführt.
- Die fachlichen Beziehungen werden gemäß der vorhandenen parent-child- und Partnerkanten ausgewertet; Zyklen werden durch die bestehende besuchte-Mengen-Logik begrenzt.
- Verifikation: fokussierte Graph- und App-Tests, danach `npm test`, `npm run build` und OpenSpec-Validierung.
