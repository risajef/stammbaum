## Context

Die bestehende `projectFamilyTree`-Projektion liefert bereits den vollständigen Anzeigegraphen: gefilterte Personen, virtuelle Kindergruppen, stabile Beziehungs-IDs und die vorhandenen Darstellungsdaten. `App` hält Auswahl, Filter und temporäre Positionen als View-State, während das `FamilyTreeDocument` die alleinige Quelle für speicherbare Fachdaten bleibt. Die neue Ansicht soll diese Trennung beibehalten und keine zweite Graphsemantik einführen.

## Goals / Non-Goals

**Goals:**

- Den vorhandenen Anzeigegraphen mit einer separaten, testbaren Force-Layout-Schicht darstellen.
- Die Simulation und die React-Flow-Darstellung so koppeln, dass laufende Ticks sichtbar werden und ein manueller Node-Drag nicht gegen die Simulation arbeitet.
- Die bestehende Arbeitsfläche mit einem kleinen View-Modus-Umschalter erweitern und die Bearbeitungsinteraktionen im Force-View sicher deaktivieren.
- Manuelle Force-Positionen nur für die aktuelle Sitzung und den jeweiligen Anzeigegraphen halten.

**Non-Goals:**

- Keine Änderung am deterministischen Layout der bestehenden Übersicht.
- Keine Speicherung oder Migration von Force-Positionen im YAML und keine Änderung am `FamilyTreeDocument`.
- Keine zweite fachliche Auswahl-, Inspector- oder Verbindungslogik für die schreibgeschützte Ansicht.
- Keine konfigurierbaren Simulationsparameter oder Reset-/Pin-Verwaltung im ersten Umfang.

## Decisions

### Ein eigener Force-View verwendet weiterhin die bestehende Projektion

`App` berechnet weiterhin genau eine `GraphProjection` aus Dokument, Filtern und aktiven Kindergruppen. Die neue Ansicht erhält diese Projektion und ersetzt nur die Positionierung sowie die React-Flow-Interaktionskonfiguration. Dadurch bleiben Kanten-IDs, Beziehungstypen, Herkunftskennzeichnungen und virtuelle Gruppen identisch.

Alternative: Eine zweite Projektion direkt aus dem Dokument würde die Filter- und Gruppierungslogik duplizieren und könnte zwischen den Ansichten unterschiedliche Kanten anzeigen. Das wird ausgeschlossen.

### `d3-force` bildet die Standardsimulation

Ein kleiner Adapter in `src/graph/force-layout.ts` erstellt aus den Projektionsnodes interne Simulationsknoten mit einer stabilen ID und aus den Projektionskanten Linkobjekte. Er kombiniert:

- `forceLink` mit den Anzeigeendpunkten als IDs,
- `forceManyBody` mit moderater Abstoßung,
- `forceCenter` für die Mitte der Arbeitsfläche,
- `forceCollide` mit einem Radius, der die vorhandenen Node-Abmessungen approximiert.

Die initialen Mittelpunkte kommen aus den deterministischen Projektionspositionen oder aus noch gültigen manuellen Force-Positionen. Die interne Simulation arbeitet mit Mittelpunkten; beim Übergang zu React Flow werden Node-Breite und -Höhe wieder abgezogen, damit die gespeicherte Position die linke obere Ecke beschreibt.

Alternative: Eine selbst implementierte Federungsschleife würde eine eigene Physik-, Takt- und Stabilitätslogik erfordern. Die zusätzliche Abhängigkeit ist hier kleiner und standardnäher als eine zweite Simulationsimplementierung.

### Simulation und React Flow werden über einen lokalen View-Adapter synchronisiert

`ForceTreeView` hält die aktuell gerenderten React-Flow-Nodes lokal. Jeder Simulationstakt schreibt nur die berechneten Positionen in diesen lokalen Zustand. React-Flow-Drag-Callbacks aktualisieren den passenden Simulationsknoten sofort; beim Drag-Start wird er mit `fx`/`fy` an die Maus gebunden, beim Drag-Ende bleibt er an der zuletzt gesetzten Position fixiert. Die übrigen Knoten bleiben frei und reagieren weiter auf die Kräfte.

Nur bewusst manuell gesetzte Positionen werden über einen kleinen Callback an `App` zurückgegeben. Dadurch verursacht der normale Simulationstakt keine App-weiten State-Updates. `App` verwirft diese Map bei erfolgreichen Dokumentänderungen und entfernt Einträge, deren Node-ID in der aktuellen Projektion nicht mehr vorkommt.

Alternative: Alle Simulationstakte in `App`-State zu schreiben würde den gesamten Inspektor und die Toolbar pro Frame neu rendern und die Verantwortungsgrenze unnötig vergrößern.

### Der View-Modus schaltet Interaktion explizit um

Die bestehende Übersicht bleibt der Standardmodus. Im Force-Modus rendert die Arbeitsfläche `ForceTreeView` mit `nodesConnectable={false}` und `elementsSelectable={false}`; Klick-, Kanten- und Verbindungs-Callbacks der editierbaren Ansicht werden nicht weitergereicht. Handles werden über eine Force-View-Klasse ausgeblendet. Nodes bleiben ausschließlich für Dragging aktiv.

Der Detailbereich zeigt im Force-Modus einen statischen Lesehinweis. Der globale Datei-Header bleibt aktiv, weil Öffnen, Neu und Speichern Dokumentoperationen sind und die Force-Ansicht selbst keine Datenänderung auslöst. Beim Zurückwechseln wird die bestehende Übersicht unverändert wieder gerendert.

### Der Anzeigegraph erhält einen stabilen Signaturschlüssel

Die Force-Ansicht startet eine neue Simulation, wenn sich die sichtbaren Node- oder Edge-IDs ändern. Der Schlüssel wird aus sortierten Anzeige-IDs gebildet; Positionsänderungen allein starten keine neue Simulation. Damit werden Filterwechsel, Collapse-/Expand-Zustände und Dokumentwechsel zuverlässig erkannt, ohne bei jedem Simulationstakt die Simulation neu aufzubauen.

## Risks / Trade-offs

- **[Viele Nodes können häufige React-Updates erzeugen]** → Die Simulation wird in einem lokalen Component-State gekapselt, beendet sich beim Unmount und nutzt die D3-Ticks; die vorhandene Übersicht wird nicht pro Tick neu gerendert.
- **[Node-Abmessungen sind vor dem ersten React-Flow-Messlauf nur Näherungen]** → Der Adapter verwendet die bestehenden festen Person-/Gruppengrößen als Kollisionsradius. Die Ansicht bleibt dadurch sofort berechenbar; exakte DOM-Maße sind für die erste Version nicht erforderlich.
- **[Fixierte, manuell gezogene Nodes können bei sehr großen Graphen die Simulation verspannen]** → Nur bewusst gezogene Nodes werden fixiert; neue/ungezogene Nodes bleiben frei. Ein Reset oder Entpinnen ist bewusst außerhalb des ersten Scopes.
- **[D3-Abhängigkeit vergrößert das Bundle]** → Nur das benötigte `d3-force`-Paket wird ergänzt; die Build-Prüfung beobachtet die bestehende Bundle-Warnung. Eine spätere Code-Splitting-Optimierung ist nicht Teil dieses Changes.
- **[Simulation kann bei fehlender Kante isolierte Personen nicht zielgerichtet anordnen]** → `forceCenter`, Abstoßung und Kollision halten auch isolierte Nodes sichtbar; Beziehungen sind nur für verbundene Nodes zusätzliche Struktur.

## Migration Plan

Es ist keine Datenmigration erforderlich. Die neue Ansicht wird standardmäßig nicht aktiviert, und bestehende YAML-Dateien sowie deren Export bleiben unverändert. Für einen Rollback genügt es, den View-Modus, den Force-Adapter und die zusätzliche Abhängigkeit zu entfernen; gespeicherte Daten müssen nicht angepasst werden.

## Open Questions

Keine. Die offenen Produktentscheidungen wurden als Annahmen im Proposal festgehalten und ändern den ersten Implementierungsumfang nicht.
