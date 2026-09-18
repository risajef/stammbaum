## Why

Bei einem grossen Stammbaum sind Geschlecht und ein sehr frühes Todesalter derzeit nicht auf einen Blick erkennbar. Eine abgestufte Farbgebung soll die visuelle Orientierung verbessern, ohne die gespeicherten Personendaten oder Beziehungen zu verändern.

## What Changes

- Personen-Knoten erhalten abhängig vom Geschlecht eine konsistente Grundfarbe: Frauen einen Korallton, Männer einen Türkiston.
- Personen, die nach den bekannten Jahresangaben vor ihrem 18. Geburtstag starben, erhalten jeweils eine hellere Variante ihrer Geschlechtsfarbe.
- Fehlt das Geburts- oder Todesjahr, wird die Person für die Farbklassifikation wie volljährig behandelt.
- Personen ohne Geschlechtsangabe behalten eine neutrale Darstellung.
- Die Farbgebung betrifft ausschließlich die visuelle Darstellung der Personen-Knoten; Beziehungen, Handles, Speicherung und Export bleiben unverändert.

## Capabilities

### New Capabilities

<!-- None: the behavior extends the existing person-node presentation. -->

### Modified Capabilities

- `family-tree-editor`: Die visuelle Darstellung von Personen-Knoten unterscheidet Geschlecht und Personen mit einem Todesalter unter 18 Jahren durch Farben.

## Impact

- Betroffen sind die React-Flow-Personenprojektion bzw. der `PersonNode` und die zugehörigen CSS-Regeln.
- Es werden keine neuen Abhängigkeiten, Datenfelder, APIs oder YAML-Eigenschaften benötigt.
- Die Altersklassifikation verwendet die Jahreskomponenten der bestehenden `birthYear`- und `deathYear`-Werte. Die bestätigte Annahme ist: eine Differenz kleiner als 18 gilt als unter 18; fehlende Jahreskomponenten gelten als volljährig.
- Akzeptanz: Frauen- und Männerknoten sind jeweils unterscheidbar eingefärbt; Minderjährige sind innerhalb ihrer Geschlechtsfarbe heller; unbekanntes Geschlecht bleibt neutral; gespeicherte Dokumentdaten und bestehende Interaktionen bleiben unverändert.
