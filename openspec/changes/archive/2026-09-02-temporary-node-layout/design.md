## Context

`FamilyTreeDocument` ist die fachliche Quelle fuer Personen, Beziehungen und YAML-Roundtrips. Die React-Flow-Ansicht wird aus diesem Dokument projiziert; gespeicherte `Person.position`-Werte sollen dabei nicht die automatische Familienanordnung bestimmen. Die neue Bedienung braucht zusaetzlich verschiebbare Nodes, ohne aus der Projektion eine zweite persistente Datenquelle zu machen.

## Goals / Non-Goals

### Goals

- Eine kompakte, deterministische und horizontal zentrierte Ausgangsanordnung fuer Personen und Familienkomponenten liefern.
- Temporaere Positionsaenderungen waehrend der aktuellen Sitzung sichtbar halten.
- Fachliche Dokumentaenderungen, Imports und neue Dokumente von den temporaeren Positionsdaten trennen.
- Dragging von Nodes und Panning der Arbeitsflaeche gleichzeitig verstaendlich bedienen.
- Einen Zoom-Out bis zur gemeinsamen Untergrenze `0.01` fuer React Flow und Fit View anbieten.
- Den bestehenden YAML-Workflow und die bestehende Inferenzlogik unveraendert lassen.

### Non-Goals

- Keine Speicherung manueller Layoutpositionen im YAML.
- Kein eigener Layout-Editor, kein Undo/Redo fuer temporaere Positionen und keine serverseitige Sitzungsspeicherung.
- Keine Aenderung an Personen-, Beziehungs- oder Inferenzregeln.
- Keine neue Abhaengigkeit.

## Decisions

### 1. Positions-Overrides bleiben im App-State

`App` verwaltet eine `Map<string, Position>` als temporaeren UI-State. `onNodesChange` uebernimmt ausschliesslich `position`-Changes und schreibt deren Werte in eine neue Map. Es ruft weder `setDocument` noch `setIsDirty(true)` auf. Dadurch bleibt `serializeFamilyTreeYaml(document)` automatisch frei von Drag-Positionen.

Bei einer erfolgreichen fachlichen Personen-/Beziehungsoperation, bei einem neuen Dokument und nach einem validierten Import wird die Map geleert. Eine blosse Auswahl- oder View-Aenderung leert sie nicht, damit die aktuelle Arbeitsansicht fuer das Erstellen einer Beziehung erhalten bleibt.

### 2. Die Graph-Projektion akzeptiert Overrides explizit

`projectFamilyTree` erhaelt einen optionalen `ReadonlyMap<string, Position>`-Parameter. Fuer jeden Node gilt: Override, falls vorhanden; sonst deterministische automatische Position; gespeicherte `Person.position` wird weiterhin ignoriert. Die Projektion bleibt damit frameworkarm und testbar, waehrend der App-State die einzige temporaere UI-Quelle bleibt.

Die Ausgangspositionen werden auf Basis der bestehenden Familienkomponenten- und Generationenlogik mit kleinerem Komponentenabstand berechnet und anschliessend horizontal um die Mitte der Gesamtbreite verschoben.

### 3. Gemeinsame Zoomgrenzen

Die Projektion stellt `padding: 0.2`, `minZoom: 0.01` und `maxZoom: 1.4` als Fit-View-Optionen bereit. `ReactFlow` erhaelt dieselben Min-/Max-Werte explizit, damit manuelles Herauszoomen und automatisches Fit View nicht unterschiedliche Grenzen verwenden.

### 4. Node-Dragging und View-Panning bleiben getrennt

`nodesDraggable` wird aktiviert und `panOnDrag` bleibt aktiviert. Das vorhandene `nopan` am Root von `PersonNode` verhindert, dass ein Drag auf dem Node gleichzeitig als Pane-Drag behandelt wird. Andere `NodeChange`-Typen werden nicht verarbeitet, damit keine unbeabsichtigten Fach- oder Layoutaenderungen entstehen.

## Risks / Trade-offs

- Die temporaere Map wird bei jeder Positionsaenderung kopiert und die Projektion neu berechnet. Das ist fuer den lokalen MVP mit der vorhandenen Baumgroesse einfach und ausreichend; ein skalierbarer inkrementeller Layoutpfad ist bewusst nicht Teil dieser Aenderung.
- Die Overrides gelten nur bis zur naechsten fachlichen Dokumentaenderung oder zum Dokumentwechsel. Das ist erwartbar, weil eine neue automatische Anordnung sonst mit veralteten manuellen Positionen vermischt wuerde.
- React Flow kann beim kontrollierten Dragging Entwicklungswarnungen zu Zwischenpositionen oder `ResizeObserver` ausgeben; die fachliche Kontrolle bleibt dennoch deterministisch und wird durch E2E-Dragging verifiziert.
