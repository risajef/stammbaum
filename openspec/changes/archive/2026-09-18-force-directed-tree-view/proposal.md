## Why

Die bestehende Übersicht ordnet den Stammbaum deterministisch nach Generationen und ist dadurch gut für die Bearbeitung geeignet. Bei größeren oder ungewöhnlich verknüpften Familien wird eine zusätzliche freie, physikalisch geführte Anordnung hilfreich, um Beziehungen visuell zu erkunden und Knoten selbst zu positionieren.

## What Changes

- Die Arbeitsfläche erhält einen Umschalter zwischen der bestehenden Übersicht und einer zusätzlichen Federungsansicht.
- Die Federungsansicht berechnet die aktuell sichtbaren Personen, virtuellen Kindergruppen und Beziehungen mit einer üblichen Force-Directed-Simulation aus Link-, Abstoßungs-, Zentrierungs- und Kollisionskräften.
- Nodes können in dieser Ansicht mit der Maus verschoben werden; die Positionen bleiben als flüchtiger Ansichtszustand sichtbar, werden aber nicht in das Familiendokument oder YAML geschrieben.
- Die Federungsansicht ist schreibgeschützt für den Stammbaum: keine Personen- oder Beziehungsbearbeitung, keine Verbindungen, kein Löschen, kein Zusammen- oder Auffächern von Kindergruppen.
- Bestehende Suche, Filter und die flüchtige Kindergruppen-Projektion bestimmen weiterhin, welche Objekte in beiden Ansichten sichtbar sind.
- Beim Zurückwechseln bleibt die bestehende Bearbeitungsansicht mit ihren bisherigen temporären Positionen und Bearbeitungsfunktionen erhalten.

## Capabilities

### New Capabilities

Keine. Die zusätzliche Darstellung erweitert die bestehende Arbeitsflächen- und Ansichtsinteraktion.

### Modified Capabilities

- `family-tree-editor`: Die Arbeitsfläche erhält eine schreibgeschützte, force-directed Zusatzansicht mit flüchtig verschiebbaren Nodes.

## Impact

- `App` und die Arbeitsflächen-UI erhalten einen View-Modus-Umschalter sowie eine getrennte, schreibgeschützte React-Flow-Konfiguration.
- Die Graph-Projektion beziehungsweise ein neuer Force-Layout-Baustein muss die bestehende Anzeigeprojektion als Eingabe verwenden und deren IDs, Kanten und Filtersemantik erhalten.
- Für die Standardsimulation wird die etablierte `d3-force`-Bibliothek einschließlich ihrer TypeScript-Typen als neue Laufzeit-/Entwicklungsabhängigkeit benötigt.
- Force-Positionen werden ausschließlich im lokalen View-State gehalten. Sie ändern weder `FamilyTreeDocument`, Dirty-State, YAML-Export noch die bestehenden Dokumentpositionen.
- Die Umsetzung wird test-first mit Layout-/Projektions-, Anwendungs- und Drag-Verhaltenstests durchgeführt und mit `npm test` sowie `npm run build` verifiziert.

## Scope and Acceptance Criteria

- Ein klar beschrifteter Umschalter macht beide Ansichten erreichbar; die bestehende Übersicht bleibt standardmäßig aktiv und vollständig bearbeitbar.
- Die Federungsansicht zeigt exakt den aktuell gefilterten Anzeigegraphen einschließlich aktiver virtueller Kindergruppen und behält die vorhandenen Beziehungsrichtungen, Beziehungstypen und Herkunftskennzeichnungen.
- Die Simulation verteilt verbundene Nodes durch Linkkräfte, hält sie vom Übereinanderliegen ab und stabilisiert den Graphen in der sichtbaren Arbeitsfläche.
- Das Ziehen eines Nodes bewegt ihn unmittelbar mit der Maus; nach dem Loslassen bleibt seine Position für die aktuelle Force-Ansicht als manuell gesetzte Position erhalten, während die übrigen Nodes weiter simuliert werden.
- Im Force-View können keine fachlichen Daten verändert werden. Insbesondere sind Handles/Verbindungen, Editoren, Löschaktionen, Merge-Aktionen sowie Collapse-/Expand-Aktionen dort deaktiviert oder nicht erreichbar.
- Das Wechseln der Ansicht, Simulieren und Ziehen verändert den Dirty-State nicht und verändert den YAML-Export nicht.
- Wechsel, Filteränderung oder Dokumentwechsel dürfen keine veralteten Force-Positionen auf nicht mehr sichtbare oder nicht mehr vorhandene Nodes anwenden; neue sichtbare Nodes erhalten wieder einen gültigen Simulationsstartpunkt.
- Leere Dokumente und Filter ohne Treffer bleiben ohne Fehler bedienbar und zeigen den bestehenden Leerzustand.

## Assumptions

- „Gebräuchliche Federungssimulation“ bedeutet eine Standardkonfiguration aus `d3-force`: Links für Beziehungen, Many-Body-Abstoßung, Zentrierung und Kollisionsradius passend zur Node-Größe.
- Die Force-Ansicht arbeitet mit demselben aktuell sichtbaren Anzeigegraphen wie die Übersicht; sie ist keine separate Datenabfrage und zeigt daher auch aktive Filter und virtuelle Kindergruppen.
- Nodes werden beim Draggen temporär fixiert und bleiben nach dem Loslassen an dieser Position, damit eine bewusste manuelle Anordnung sichtbar bleibt. Diese Fixierung ist ausschließlich View-State; eine spätere Reset-Funktion gehört nicht zum ersten Umfang.
- Dateioperationen im globalen Kopfbereich bleiben möglich, weil sie das Dokument und nicht die schreibgeschützte Darstellung verändern.
- Die vorhandene Test- und Build-Prüfung bleibt maßgeblich: `npm test` und `npm run build`.
