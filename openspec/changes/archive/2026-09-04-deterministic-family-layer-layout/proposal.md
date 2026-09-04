## Why

Das automatische Layout ordnet Familiengruppen aktuell nicht zuverlässig nach fachlicher Generation und kann Eltern – wie im Fall von Maria Schelling – auf einer unpassenden Ebene anzeigen. Außerdem kann die aktuelle horizontale Packung Kinder unter Geschwistern oder anderen Familiengruppen platzieren, und Ehepartner werden nicht konsequent als Mann links und Frau rechts dargestellt.

## What Changes

- Die älteste bekannte Person anhand des Geburtsdatums wird automatisch als einzige globale Root für die Layer-Berechnung verwendet; bei gleichen Geburtsdaten entscheidet die Reihenfolge im YAML.
- Die Root wird nicht im YAML gespeichert, sondern bei jeder Layoutberechnung aus den Personendaten ermittelt.
- Die Root liegt auf Layer `0`, ihre Eltern auf negativen Layern und ihre Kinder auf positiven Layern. Die Layer werden ausgehend von den Blättern berechnet und anschließend auf die frühestmögliche gültige Ebene komprimiert, sodass jedes Kind unter allen Eltern liegt.
- Alle Personen eines Layers werden auf derselben horizontalen Linie angezeigt. Eltern werden oberhalb der zugehörigen Kinder angeordnet.
- Verheiratete Personen werden als zusammenhängende Ehegruppe behandelt. Innerhalb einer Gruppe steht der Mann links von der Frau; bei mehreren Ehen bleibt die gesamte Gruppe zusammen.
- Die horizontale Platzierung baut Teilbäume von unten nach oben als Ebenenkonturen auf und verschiebt einen rechten Teilbaum nur bis zur ersten tatsächlichen Kollision auf derselben Ebene.
- Unverbundene Familien erhalten weiterhin eine deterministische eigene Ausgangsposition; fehlende Geburtsdaten werden nicht als bekanntes Alter erfunden.
- Beim Anlegen einer Person bleibt der aktuelle React-Flow-Viewport unverändert; bestehende sichtbare Nodes behalten ihre Position und die neue Person wird in der Mitte des aktuellen Sichtbereichs platziert.
- Nach dem Speichern einer Beziehung wird das automatische Layout neu berechnet und an den bisherigen Mittelpunkt der verbundenen Personen verschoben, damit die Verbindung im unveränderten Viewport weiterbearbeitbar bleibt.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-editor`: Das automatische Familienbaum-Layout muss Root, Layer, Ehegruppen und horizontale Familienbereiche deterministisch und fachlich nachvollziehbar anordnen.

## Impact

- Der Layout-Teil der Graph-Projektion wird um eine deterministische Layer- und Familiengruppenberechnung erweitert.
- Die Domain-Daten und das YAML-Format bleiben unverändert; insbesondere wird keine Root- oder Layer-Information persistiert.
- Die sichtbaren Node-Positionen ändern sich nach der Layoutberechnung, während Beziehungen, Handles und Beziehungsmetadaten unverändert bleiben.
- Die Graph-Projektions- und End-to-End-Tests müssen Generationen, Ehegruppen, direkte Eltern-Kind-Nachbarschaft und kompakte Geschwisterabstände abdecken.
- Die End-to-End-Tests müssen außerdem die Viewport-Erhaltung beim Anlegen und anschließenden Verbinden von Personen abdecken.

## Scope and Constraints

- Die Layer-Logik basiert auf gerichteten Eltern-Kind-Beziehungen; Ehebeziehungen verbinden Personen horizontal auf demselben Layer.
- Die bereits bestehende automatische Layoutanpassung nach Änderungen bleibt erhalten.
- Eine automatische Anpassung des Kamerablicks erfolgt nur bei einem expliziten Dateiimport; Personen- und Beziehungsänderungen verändern den aktuellen Viewport nicht.
- Eine direkte, manuelle Speicherung von Node-Positionen oder einer Root ist nicht Teil dieses Changes.

## Acceptance Criteria

- Maria Schellings Eltern werden oberhalb von Maria und auf der fachlich vorherigen Ebene angezeigt.
- Die älteste bekannte Person ist der einzige globale Layer-0-Anker; ihre bekannten Eltern liegen auf Layer `-1`.
- Personen mit identischem Geburtsdatum werden in YAML-Reihenfolge bewertet.
- Bei einem DAG mit mehreren Pfaden bleibt die Layerberechnung deterministisch und jede Eltern-Kind-Kante zeigt abwärts; tiefe Teilbäume dürfen die horizontale Position ihrer Eltern nicht unnötig vergrößern.
- Ein Ehetrio bleibt als ein horizontaler Block erhalten, Männer stehen links von Frauen, und gleichrangige Teilbäume überschneiden sich nicht.

## Assumptions

- Wenn keine Person ein bekanntes Geburtsdatum besitzt, wird als deterministischer Fallback die erste Person im YAML als Root verwendet.
- Bei unvollständig vergleichbaren Geburtsdaten wird nur sicher Vergleichbares berücksichtigt; bei Gleichstand bleibt die YAML-Reihenfolge maßgeblich.

