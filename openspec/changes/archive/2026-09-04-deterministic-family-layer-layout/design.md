## Context

Die Graph-Projektion erzeugt aktuell Ehe- und Eltern-Kind-Komponenten mit einer impliziten Generation ab allen Komponenten ohne Eltern. Die horizontale Platzierung berücksichtigt nur die Eigenbreite einer Komponente, und die Reihenfolge innerhalb einer Ehegruppe folgt der YAML-Reihenfolge. Dadurch sind die fachliche Root, die Geschlechterrichtung und der Platzbedarf tieferer Kinderbereiche nicht zuverlässig sichtbar.

## Goals / Non-Goals

**Goals:**

- Eine deterministische Root und daraus abgeleitete Layer berechnen, ohne das Domain-Modell oder YAML zu erweitern.
- Die bisherige Gruppierung verheirateter Personen und gemeinsamer Eltern beibehalten und um eine stabile Geschlechterreihenfolge ergänzen.
- Bottom-up-Teilbaumhöhen und die längste Nachfahrenstrecke eines DAGs für die vertikale Layerberechnung verwenden.
- Für jede Gruppe tatsächliche Ebenenkonturen ihrer direkten und tieferen Kinderbereiche berechnen und nur bei einer Konturkollision auf derselben Ebene Platz reservieren.
- Die bestehende `projectFamilyTree`-Schnittstelle und automatische Neuberechnung nach Dokumentänderungen weiterverwenden.
- Beim Anlegen einer Person den aktuellen Viewport unverändert lassen, bestehende sichtbare Positionen bewahren und den neuen Node im aktuellen Sichtbereich zentrieren.

**Non-Goals:**

- Keine manuelle Root-Auswahl und kein neues Root- oder Layer-Feld im YAML.
- Keine Änderung an fachlichen Beziehungen, Beziehungsvalidierung, Handles oder Beziehungsmetadaten.
- Keine vollständige Optimierung aller Kantenkreuzungen in beliebigen Graphen.
- Keine erfundenen Geburtsdaten für Personen mit unbekanntem Datum.

## Decisions

### Root und Layer

Die bestehende Komponentengraph-Berechnung bleibt die Grundlage. Nach dem Aufbau der gerichteten Eltern-Kind-Komponenten wird die älteste Person mit sicher vergleichbarem Geburtsdatum gesucht. Der Vergleich wertet Jahr, dann gemeinsam bekannte Monate und Tage aus; wenn eine Komponente nicht sicher vergleichbar ist, gilt sie als Gleichstand und die ursprüngliche YAML-Reihenfolge entscheidet. Fehlt allen Personen ein Geburtsdatum, wird die erste YAML-Person als deterministischer Fallback verwendet.

Die Komponenten erhalten zunächst von unten nach oben eine Höhe: Ein Blatt hat Höhe `0`, ein Elternblock erhält die maximale Kinderhöhe plus eins. Die Layer einer zusammenhängenden Familie entstehen, indem die Höhe des gewählten Layoutankers als Basis verwendet wird. Danach werden alle Komponenten mit Eltern in Höhenreihenfolge auf die frühestmögliche Ebene `max(parentLayer) + 1` komprimiert. So liegen Eltern oberhalb ihrer Kinder, Geschwister eines gemeinsamen Elternblocks auf derselben Ebene und direkte Eltern-Kind-Kanten überspringen keine Ebene, sofern kein anderer Elternpfad eine höhere Ebene erzwingt.

Für voneinander getrennte Familien wird der gleiche Berechnungsweg je unabhängiger Komponente mit ihrem ältesten bekannten Mitglied als lokaler Layoutanker verwendet. Diese Anker sind reine Layoutentscheidungen und werden nicht persistiert; die verbundene Familie der global ältesten Person besitzt weiterhin die einzige globale Root.

### Ehegruppen und horizontale Breite

Die Union-Find-Gruppen aus Ehepartnern und gemeinsamen Eltern bleiben erhalten. Mitglieder einer Gruppe werden für Gruppen mit Ehebeziehungen stabil nach `Mann`, `Frau` und anschließend unbekanntem Geschlecht sortiert; innerhalb derselben Kategorie bleibt die YAML-Reihenfolge erhalten. Damit werden auch durch Mehrfachheirat verbundene Personen als ein Block dargestellt und jeder unterstützte Mann-Frau-Eheeintrag zeigt den Mann links.

Für jede Gruppe wird rekursiv von den Blättern nach oben eine Ebenenkontur berechnet. Die direkten Kinder-Teilbäume werden mit ihren relativen Layern nebeneinander gestartet; ein späterer Teilbaum wird nur so weit nach rechts verschoben, bis seine Kontur auf einer belegten Ebene den bestehenden Teilbaum mit `COMPONENT_GAP` Abstand berührt. Der Elternblock wird anschließend über dem Mittelwert der direkten Kinderzentren platziert. Tiefere Ebenen reservieren dadurch keinen Platz auf einer Elternzeile, wenn dort keine tatsächliche Konturkollision vorliegt. Unabhängige Root-Blöcke werden mit demselben Verfahren gegen die bereits belegten absoluten Ebenen gepackt.

Als Alternative wurde ein vollständiger Graph-Layout-Algorithmus verworfen. Das Projekt benötigt weiterhin eine kleine, deterministische lokale Projektion ohne neue Abhängigkeit; die Anforderungen verlangen Layer, Gruppen und Abstände, aber keine globale Kreuzungsoptimierung.

### Viewport bei Änderungen

Der Kamerablick des React-Flow-Canvas bleibt bei Personen- und Beziehungsänderungen unverändert. Beim Anlegen einer Person werden die aktuell gerenderten Positionen der bestehenden Nodes als temporäre Overrides übernommen; die neue Person erhält nach dem Speichern eine Position in der Mitte des aktuellen Sichtbereichs. Ein Dateiimport löst weiterhin ausschließlich den explizit angeforderten vollständigen `fitView` aus.

Beim Speichern einer Beziehung wird die deterministische Projektion des aktualisierten Dokuments ohne Overrides berechnet. Ihre gesamte Geometrie wird anschließend so verschoben, dass der Mittelpunkt der beiden verbundenen Personen in Flow-Koordinaten an ihrem bisherigen Mittelpunkt bleibt. Dadurch bleibt das automatische Familienlayout aktiv, ohne den Kamerablick zu verändern oder die gerade bearbeiteten Handles aus dem aktuellen Sichtbereich zu verschieben.

## Risks / Trade-offs

- [Risiko] Ein DAG mit widersprüchlichen Wegen kann eine Kante über mehrere Layer spannen. -> [Mitigation] Die Layer werden nach der Bottom-up-Berechnung auf `max(parentLayer) + 1` komprimiert; die Kante bleibt gerichtet und die Berechnung deterministisch.
- [Risiko] Eine sehr breite tatsächlich überlappende Ebene erzeugt bei vielen Kindern oder Mehrfachheiraten horizontalen Platzbedarf. -> [Mitigation] Nur Konturen derselben belegten Ebene werden verglichen; unterschiedlich tiefe Bereiche vergrößern keine Elternzeile ohne Kollision.
- [Risiko] Unvollständig vergleichbare Geburtsdaten liefern keinen sicheren chronologischen Vergleich. -> [Mitigation] Nur sicher vergleichbare Komponenten werden ausgewertet, danach entscheidet die stabile YAML-Reihenfolge.
- [Risiko] Ein neu berechnetes Beziehungs-Layout könnte sichtbare Verbindungshandles aus dem aktuellen Bereich verschieben. -> [Mitigation] Die neue Layoutgeometrie wird am Mittelpunkt der verbundenen Personen verankert, während der Viewport unverändert bleibt.

## Migration Plan

Keine Datenmigration. Die Änderung betrifft ausschließlich die berechneten Ansichtspositionen; bestehende YAML-Dateien bleiben unverändert kompatibel. Ein Rollback besteht aus der Rückkehr zur bisherigen Generations- und Packlogik.

