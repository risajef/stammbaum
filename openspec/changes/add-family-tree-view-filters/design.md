## Context

Der bestehende Graph wird in `src/graph/graph-projection.ts` aus einem `FamilyTreeDocument` erzeugt. Dort liegen sowohl die deterministische Layer-/Familienlayoutberechnung als auch die Projektion von Nodes und Kanten. `App.tsx` haelt Dokument, Auswahl und temporaere Nodepositionen in React-State. Siehe `proposal.md` und `specs/family-tree-views/spec.md` fuer Motivation und sichtbares Verhalten.

## Goals / Non-Goals

**Goals:**

- Eine kleine, pure View-Projektion fuer Suchraum, lokale Distanz, Blutsverwandtschaft und Leafs.
- Den bestehenden Layoutalgorithmus wiederverwenden, indem nur ein gefiltertes Dokument projiziert wird.
- Suchtreffer deterministisch nach bekannten Geburtsdatumskomponenten ordnen und die Auswahl auf einen sichtbaren Treffer bewegen.
- View-Zustaende lokal in der Arbeitsflaeche halten und aus dem YAML-Export heraushalten.
- Filterkombinationen, Kantenkonsistenz und Auswahlssynchronisation mit fokussierten Tests absichern.

**Non-Goals:**

- Keine Aenderung am YAML-Schema, an Personen- oder Beziehungstypen oder an der automatischen Beziehungsableitung.
- Keine neue Persistenz fuer Filter, Suche oder View-Positionen.
- Keine separate Layoutimplementierung fuer lokale Ansichten.
- Keine Suche in Kommentaren oder anderen Metadaten.

## Decisions

1. **Pure Filterprojektion vor dem Layout:** Eine Funktion nimmt Dokument und View-Optionen entgegen und liefert ein neues Dokument mit gefilterten Personen und nur Kanten zwischen sichtbaren Endpunkten. Das Original wird nicht mutiert. `projectFamilyTree` ruft diese Projektion vor `createGeneratedPositions` auf. Dadurch bleibt der Layoutalgorithmus die einzige Quelle fuer Positionen und Layer.

2. **BFS fuer lokale Distanz und gerichtete Blutverwandtschaft:** Fuer die lokale Ansicht wird eine Breitensuche auf einem ungerichteten Adjazenzgraphen aus allen Beziehungen verwendet. Fuer die Blutsverwandtschaft werden zuerst alle Vorfahren ueber eingehende `parent-child`-Kanten ermittelt und anschliessend von diesen Personen aus nur ausgehende Kanten zu Nachkommen verfolgt. Dadurch bleiben Wege mit Aufwaerts- und anschliessenden Abwaertsschritten erhalten, waehrend Wege mit Abwaerts- und anschliessenden Aufwaertsschritten, etwa zu einer anderen Elternperson, ausgeschlossen werden. Iterative Suchen vermeiden Rekursionstiefe bei grossen Stammbauemen und behandeln Zyklen stabil.

3. **Filter als Schnittmenge:** Distanz- und Blutsverwandtschaftsmenge sowie die Leaf-Menge werden auf Personen-IDs geschnitten. Die Leaf-Menge wird aus dem ungefilterten Eingabedokument ermittelt. Anschliessend werden Beziehungen auf die verbleibenden Endpunkte beschraenkt.

4. **Suchsortierung mit bestehender Datumssemantik:** Die Suche verwendet `parsePartialDate` und die bereits im Layout verwendete sichere Vergleichsregel. Wenn `comparePartialDates` wegen unbekannter Komponenten keinen Vergleich liefert, bleibt die Dokumentreihenfolge erhalten. Ein stabiler Originalindex verhindert engineabhaengige Sortierung.

5. **UI-State in `App`:** Suchtext, aktueller Trefferindex, Distanz, Filtermodi und die Such-Fokusanforderung bleiben React-State und werden nicht Teil von `FamilyTreeDocument`. Ein kleiner React-Flow-Helfer innerhalb des Canvas nutzt `setCenter`, um einen angesprungenen sichtbaren Node zu fokussieren. Wird ein Person- oder Beziehungsobjekt unsichtbar, bereinigt ein Effekt die Auswahl.

6. **Explizite, kompakte Filterleiste:** Die Canvas-Uebersicht erhaelt ein Suchfeld mit Trefferzaehler und Vor-/Naechster-Schaltflaechen sowie Select/Checkbox-Steuerungen fuer Distanz, Blutsverwandtschaft und Leafs. Die Distanzsteuerung bleibt ohne Personenanker deaktiviert; ohne Anker wird fuer die Projektion die volle Menge verwendet. Die bestehende responsive Arbeitsflaeche bleibt erhalten und die Leermeldung unterscheidet eine leere Ansicht von einem leeren Dokument.

## Risks / Trade-offs

- **[Risk]** Eine Filterkombination kann alle Personen entfernen und dadurch eine scheinbar leere Arbeitsflaeche erzeugen. **Mitigation:** Die UI zeigt eine eigene Meldung fuer eine leere Ansicht und hebt unsichtbare Auswahlen auf.
- **[Risk]** Eine aktive Leaf-Ansicht kann viele Kanten entfernen, weil Elternknoten ausgeblendet werden. **Mitigation:** Kanten werden konsequent nur mit sichtbaren Endpunkten projiziert; das Verhalten ist in Projektionstests festgelegt.
- **[Risk]** Die einfache `setCenter`-Fokussierung haengt von gemessenen Node-Abmessungen ab. **Mitigation:** React Flow erhaelt den Node als Ziel und verwendet einen festen Zoomrahmen; die UI-Verifikation prueft die Auswahl und den Fokusaufruf ueber den sichtbaren Zustand.
- **[Risk]** Bei unbekannten oder nur teilweise vergleichbaren Geburtsdaten ist die Sortierung nicht vollstaendig chronologisch. **Mitigation:** Unbekannte Komponenten werden nicht erfunden; die stabile Dokumentreihenfolge ist als Vertrag festgelegt.

## Migration Plan

Keine Datenmigration. Nach dem Update sind die Filter standardmaessig deaktiviert, sodass bestehende Dokumente und die Vollansicht unveraendert bleiben. Ein Rollback entfernt nur die neue View-Projektion und ihre UI-Tests; YAML-Dateien bleiben kompatibel.
