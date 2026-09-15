## Why

Große Stammbäume werden unübersichtlich, wenn alle Kinder eines Ehepaars gleichzeitig als einzelne Knoten dargestellt werden. Die Benutzerin soll solche direkten gemeinsamen Kinder für die aktuelle Übersicht zu einer virtuellen Gruppe zusammenfassen können, ohne genealogische Daten zu verändern.

## What Changes

- Eine ausgewählte Ehebeziehung zeigt die direkten Kinder, die mit beiden Ehepartnern verbunden sind, visuell markiert an.
- Wenn mindestens zwei solche Kinder vorhanden sind, erscheint eine Aktion zum Einklappen aller dieser Kinder.
- Eingeklappte Kinder werden in der Arbeitsfläche durch einen virtuellen Knoten wie `3 Kinder` ersetzt.
- Jede externe Kante der gruppierten Kinder bleibt mit gleicher Richtung und als eigene anklickbare Kante erhalten; Kanten ausschließlich zwischen gruppierten Kindern werden nur visuell ausgeblendet.
- Ein virtueller Gruppenknoten kann ausgewählt und wieder aufgefächert werden.
- Bei aktiven Filtern werden Gruppen, deren Kinder nicht vollständig sichtbar sind, vorübergehend einzeln dargestellt. Die Personensuche fächert eine betroffene Gruppe automatisch auf.
- Der Einklappzustand ist flüchtiger View-Zustand: Er wird weder im YAML gespeichert noch als ungespeicherte Dokumentänderung markiert und wird bei einer Dokument- oder Datenänderung verworfen.
- Überlappende oder verschachtelte eingeklappte Gruppen werden nicht zugelassen.

### Scope

- Gruppiert werden ausschließlich direkte Kinder mit einer Eltern-Kind-Beziehung zu beiden Partnern der ausgewählten Ehe.
- Automatisch abgeleitete Eltern-Kind-Beziehungen zählen dabei wie explizite Beziehungen.
- Alle geeigneten Kinder werden gemeinsam gruppiert; eine Teilauswahl ist nicht vorgesehen.
- Die bestehende Suche, die Ansichtsfilter, die Beziehungsauswahl und die YAML-Daten bleiben ansonsten erhalten.

### Non-Goals

- Keine Änderung, Löschung oder dauerhafte Erweiterung von Personen- oder Beziehungsdaten.
- Keine Speicherung von Gruppenzuständen, virtuellen Personen oder zusätzlichen YAML-Feldern.
- Keine Gruppierung von Enkeln oder weiteren Nachfahren.
- Keine Auswahl einzelner Kinder innerhalb einer vorgeschlagenen Gruppe.
- Keine Aggregation mehrerer externer Kanten zu einer einzelnen Kante und keine besondere visuelle Auffächerung paralleler Kanten über die bestehende Anklickbarkeit hinaus.

## Capabilities

### New Capabilities

Keine. Das Verhalten erweitert die bestehende Arbeitsflächen- und Ansichtsinteraktion.

### Modified Capabilities

- `family-tree-editor`: Die Arbeitsfläche unterstützt das flüchtige Ein- und Auffächern gemeinsamer Kinder einer ausgewählten Ehebeziehung über einen virtuellen Gruppenknoten.

## Impact

- Die Graph-Projektion erhält einen rein visuellen Gruppenknoten sowie eine Abbildung gruppierter Personen auf externe Kanten.
- Der bestehende React-Flow-Klick- und Auswahlfluss sowie der Beziehunginspektor erhalten die Aktionen zum Einklappen und Auffächern.
- Der temporäre Ansichtsstatus muss mit automatischem Layout, Node-Positionen, Suche und bestehenden Filtern synchronisiert werden.
- Die Domänenmodelle, Inferenzregeln, YAML-Serialisierung und Persistenzschnittstellen bleiben unverändert.
- Es werden keine neuen Abhängigkeiten benötigt.
- Die Änderung wird mit fokussierten Graph- und Anwendungstests, anschließend mit `npm test` und `npm run build` verifiziert.

### Acceptance Criteria

- Das Anklicken einer Ehebeziehung markiert die gemeinsamen direkten Kinder und bietet ab zwei Kindern die Einklappaktion an.
- Nach dem Einklappen ist genau ein virtueller Gruppenknoten mit der korrekten Kinderanzahl sichtbar; externe Beziehungen bleiben einzeln auswählbar.
- Das Auswählen des virtuellen Knotens und die Auffächeraktion stellen alle zuvor gruppierten Kinder wieder her.
- Kein Einklappen, Auffächern, Filtern oder Suchen verändert das `FamilyTreeDocument`, den Export oder den Dirty-State.
- Filter und Suche verhalten sich auch bei eingeklappten Gruppen ohne Auswahl eines unsichtbaren Personenknotens.
- Eine zweite Gruppe mit überlappenden oder verschachtelten Kindern kann nicht eingeklappt werden.

### Assumptions and unresolved questions

Die Anforderungen wurden mit der Benutzerin geklärt. Die einzige bewusst festgehaltene Darstellungsannahme ist, dass parallele externe Kanten als getrennte, anklickbare Graph-Kanten bestehen bleiben; eine optische Verschiebung zur Trennung ist nicht Teil des Scopes.
