## Why

Die Arbeitsfläche verlangt aktuell nach dem Ziehen einer Verbindung noch die Auswahl des Beziehungstyps. Dadurch muss die Benutzerin die fachliche Bedeutung einer Verbindung zusätzlich im Inspektor festlegen und kann die visuelle Richtung der Verbindung leicht falsch interpretieren. Handle-basierte Endpunkte sollen die beiden häufigsten Beziehungstypen direkt ausdrücken und die manuelle Familienbaum-Erfassung schneller und eindeutiger machen.

## What Changes

- Ein seitlicher oranger Handle wird bei Männern rechts und bei Frauen links angezeigt.
- Eine Verbindung zwischen den seitlichen Handles wird als Ehe behandelt; ihre Ziehrichtung ändert die fachliche Paarung nicht.
- Eine Verbindung vom unteren Handle einer Person zum oberen Handle einer anderen Person wird als Eltern-Kind-Beziehung behandelt: die Person am unteren Handle ist Elternteil, die Person am oberen Handle ist Kind.
- Die Klassifikation verwendet ausschließlich die verbundenen Handles und nicht die aktuelle Höhe oder Position der Nodes. Das automatisch berechnete Layout darf sich nach dem Speichern an die neue Beziehung anpassen.
- Jede neue Verbindung muss weiterhin im Beziehunginspektor ausdrücklich bestätigt und gespeichert werden; ein Abbruch verändert das Dokument nicht.
- Kommentar und Quelle bleiben optionale Angaben im Inspektor.
- Der Beziehungstyp wird für neue Verbindungen durch die verwendeten Handles vorgegeben. Bestehende Beziehungen behalten ihre Bearbeitungs- und Validierungsregeln.
- Ungültige Handle-Kombinationen, unbekannte Geschlechter, Selbstbeziehungen und Duplikate werden ohne teilweise Datenänderung abgelehnt.

## Capabilities

### New Capabilities

Keine. Die Funktion erweitert eine bestehende Bearbeitungsfähigkeit.

### Modified Capabilities

- `family-tree-editor`: Direkte Verbindungen auf der Arbeitsfläche bestimmen Ehe oder Eltern-Kind anhand der verbundenen Handles und werden erst nach Bestätigung übernommen.

## Impact

- Die Person-Node-Darstellung und die React-Flow-Verbindungsbehandlung werden um typisierte seitliche Handles und handle-basierte Klassifikation erweitert.
- Der bestehende Beziehunginspektor wird für vorgegebene Beziehungstypen wiederverwendet; optionale Quellen- und Kommentarfelder sowie die fachliche Validierung bleiben erhalten.
- Die Domänenmodelle und das YAML-Format benötigen voraussichtlich keine neuen Felder oder Migrationen.
- Die bestehende automatische Anordnung verarbeitet die gespeicherte Beziehung wie bisher; gespeicherte oder temporäre Node-Positionen bestimmen die Beziehung nicht.
- Die relevanten Unit-, Komponenten- und End-to-End-Tests werden um die neuen Verbindungspfade und Abbruch-/Fehlerfälle ergänzt.
