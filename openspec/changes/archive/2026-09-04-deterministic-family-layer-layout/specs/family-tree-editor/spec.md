## ADDED Requirements

### Requirement: Das automatische Layout ordnet Familiengruppen deterministisch nach Layern an

Das System MUST die sichtbaren Personen eines Stammbaums anhand der bekannten Eltern-Kind-Beziehungen und Ehegruppen deterministisch auf Generationen-Layer verteilen. Die älteste Person mit bekanntem Geburtsdatum MUSS als einzige globale Root auf Layer `0` dienen; bei gleichen oder nicht sicher vergleichbaren Geburtsdaten entscheidet die Reihenfolge der Personen im YAML. Eine bekannte Elternperson der Root MUSS auf dem vorherigen Layer liegen, ein Kind auf dem nächsten Layer. Die Root- und Layer-Informationen DÜRFEN nicht als zusätzliche Fachdaten im YAML gespeichert werden.

Alle Personen desselben Layers MUESSEN dieselbe horizontale Linie teilen. Eine Ehegruppe MUSS auf einem gemeinsamen Layer als zusammenhängender horizontaler Block erscheinen. Innerhalb einer Ehegruppe MUSS ein Mann links von einer Frau stehen; eine durch Mehrfachheirat verbundene Gruppe MUSS als ein Block behandelt werden. Für eine direkte Eltern-Kind-Beziehung MUSS der Elternblock genau eine Ebene oberhalb des Kindes liegen, sofern die Beziehung nicht Teil eines DAGs mit unterschiedlich langen Elternpfaden ist; in diesem Fall MUSS jeder Elternblock lediglich oberhalb des Kindes liegen. Geschwisterblöcke MUESSEN auf derselben Ebene liegen. Ehepartner MUESSEN auf derselben Ebene liegen, sofern keine widersprüchliche Eltern-Kind-Bedingung dies unmöglich macht.

Die horizontale Anordnung MUSS für jede Familiengruppe die tatsächlich belegten Ebenenkonturen ihrer Kinder berücksichtigen. Ein rechter Teilbaum DARF nur so weit verschoben werden, bis er auf einer tatsächlich gemeinsam belegten Ebene mit einem bestehenden Teilbaum kollisionsfrei liegt; tiefe Ebenen DÜRFEN keine zusätzlichen Abstände auf nicht belegten Elternzeilen erzwingen. Eltern MUESSEN oberhalb ihrer Kinder angeordnet werden.

Wenn ein Knoten in einem gerichteten azyklischen Beziehungsgraphen über mehrere Eltern-Kind-Wege erreichbar ist, MUSS seine Ebene so gewählt werden, dass er oberhalb aller Eltern liegt; bei mehreren möglichen Ebenen wird die frühestmögliche gültige Ebene verwendet. Die Layerberechnung MUSS von unten nach oben deterministische Teilbaumhöhen berücksichtigen. Unverbundene Familiengruppen MUESSEN weiterhin deterministisch und ohne erfundene Geburtsdaten platziert werden.

#### Scenario: Älteste bekannte Person bestimmt die Root

- **GIVEN** mehrere Personen mit bekannten und unbekannten Geburtsdaten sind im Stammbaum vorhanden
- **WHEN** das automatische Layout berechnet wird
- **THEN** liegt die Person mit dem frühesten bekannten Geburtsdatum auf Layer `0`, bekannte Eltern dieser Person liegen auf Layer `-1` und ihre Kinder auf positiven Layern

#### Scenario: Gleichstand entscheidet sich nach YAML-Reihenfolge

- **GIVEN** zwei oder mehrere Personen haben dasselbe oder nicht sicher unterscheidbare älteste Geburtsdatum
- **WHEN** das automatische Layout die Root bestimmt
- **THEN** wird die zuerst im YAML aufgeführte Person als Root verwendet

Bei einer Personenerstellung MUSS der aktuelle React-Flow-Viewport unverändert bleiben. Bereits sichtbare Nodes MUESSEN ihre gerenderte Position behalten, und der neue Node MUSS im Mittelpunkt des aktuellen Sichtbereichs erscheinen. Das System DARF den Kamerablick bei Personen- oder Beziehungsänderungen nicht automatisch an den vollständigen Graphen anpassen; ein vollständiges `fitView` bleibt einem expliziten Dateiimport vorbehalten.

Nach dem Speichern einer Beziehung MUSS das automatische Layout weiterhin neu berechnet werden. Die neue Geometrie MUSS dabei am bisherigen Mittelpunkt der beiden verbundenen Personen verankert werden, damit die Verbindung im unveränderten Sichtbereich weiter bearbeitbar bleibt.

#### Scenario: Root und Layer werden nicht persistiert

- **GIVEN** ein Stammbaum wurde mit automatisch berechneten Layern dargestellt
- **WHEN** der Stammbaum exportiert wird
- **THEN** enthält das YAML keine Root- oder Layer-Felder, sondern weiterhin nur die bestehenden Personen- und Beziehungsdaten

#### Scenario: Alle Personen eines Layers liegen auf einer Linie

- **GIVEN** mehrere Familiengruppen gehören zur selben Generation
- **WHEN** das Layout berechnet wird
- **THEN** haben alle Nodes dieser Generation dieselbe vertikale Position

#### Scenario: Ehepartner und Mehrfachheirat bilden einen geordneten Block

- **GIVEN** ein Mann und eine Frau sind verheiratet und eine Person der Ehe hat eine weitere Ehe
- **WHEN** das Layout berechnet wird
- **THEN** bleiben alle durch die Ehen verbundenen Personen als ein zusammenhängender Block auf demselben Layer, wobei Männer links von Frauen stehen

#### Scenario: Eltern stehen oberhalb ihrer Kinder

- **GIVEN** eine Person oder Ehegruppe hat Eltern und eigene Kinder im Diagramm
- **WHEN** das Layout berechnet wird
- **THEN** liegen die Eltern auf dem vorherigen Layer, die Person oder Ehegruppe auf ihrem Layer und die Kinder auf nachfolgenden Layern

#### Scenario: Direkte Eltern liegen genau eine Ebene oberhalb

- **GIVEN** eine Familie ohne zusammenführende alternative Elternpfade hat zwei Eltern und ein Kind
- **WHEN** das automatische Layout die Layer berechnet
- **THEN** liegen beide Elternblöcke genau eine Ebene oberhalb des Kindes

#### Scenario: Geschwister teilen eine Ebene

- **GIVEN** ein Elternblock hat mehrere Kinder ohne unterschiedliche Elternpfade
- **WHEN** das automatische Layout die Layer berechnet
- **THEN** liegen alle Geschwister auf derselben Ebene

#### Scenario: Direkte Eltern bleiben trotz tiefer Ehepartner-Ahnenlinie oberhalb

- **GIVEN** eine Ehegruppe besitzt direkte Eltern auf einer Ebene und ein Ehepartner zusätzlich eine deutlich tiefere Ahnenlinie
- **WHEN** das Layout berechnet wird
- **THEN** liegt die Ehegruppe unter allen ihren Eltern, und kein Elternknoten wird durch die Layerberechnung unter das Kind verschoben

#### Scenario: Überlappende Ebenenkonturen verdrängen Geschwistergruppen horizontal

- **GIVEN** A und B sind verheiratet und haben die Kinder C, D, E und F, während A die Geschwister G und H hat
- **WHEN** das Layout berechnet wird
- **THEN** werden C, D, E und F als zusammenhängender Kinderbereich unter A und B angeordnet und die Teilbäume werden nur auf tatsächlich gemeinsam belegten Ebenen so weit verschoben, dass keine Nodes kollidieren

#### Scenario: Neue Person erscheint im aktuellen Sichtbereich

- **GIVEN** der Benutzer hat den Stammbaum verschoben oder gezoomt und mindestens eine Person ist sichtbar
- **WHEN** eine neue Person gespeichert wird
- **THEN** bleibt der Viewport unverändert, bestehende sichtbare Nodes behalten ihre Position und die neue Person erscheint in der Mitte des Sichtbereichs

#### Scenario: Beziehungsspeicherung hält die Verbindung bearbeitbar

- **GIVEN** zwei sichtbare Personen werden über ihre Handles verbunden
- **WHEN** die neue Beziehung gespeichert wird
- **THEN** bleibt der Viewport unverändert, das automatische Layout wird angewendet und die verbundenen Personen bleiben im aktuellen Sichtbereich an ihrem bisherigen Mittelpunkt verankert

#### Scenario: Bottom-up-Layer halten alle Eltern oberhalb des Kindes

- **GIVEN** ein gerichteter azyklischer Stammbaum enthält mehrere Wege von der Root zu einem Nachfahren
- **WHEN** das automatische Layout die Layer berechnet
- **THEN** erhält der Nachfahre die frühestmögliche Ebene unterhalb aller Eltern, der längere Elternpfad liegt genau eine Ebene darüber und ein kürzerer Alternativpfad darf weiter oben liegen

