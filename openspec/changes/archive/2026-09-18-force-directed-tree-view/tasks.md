## 1. Verhalten test-first festschreiben

- [x] 1.1 Schreibe einen fehlschlagenden Graph-Test für die öffentliche Force-Layout-Funktion: stabile Node-IDs, Beziehungskanten als Links, finite Positionen nach Ticks, Abstoßung/Kollision und Verwendung vorhandener Startpositionen; verifiziere mit `npm test -- src/graph/force-layout.test.ts`, dass die fehlende Layout-Schicht zuerst erwartungsgemäß scheitert.
- [x] 1.2 Schreibe fehlschlagende Anwendungstests für den Umschalter, die gemeinsame Sichtbarkeit des Anzeigegraphen, den schreibgeschützten Force-View und den unveränderten Dirty-/Dokumentzustand; verifiziere mit `npm test -- src/App.test.tsx`.
- [x] 1.3 Schreibe einen fehlschlagenden Verhaltenstest für das Ziehen eines Nodes im Force-View: die Position wird als flüchtige Force-Position gemeldet, die Dokumentdaten bleiben unverändert und die Position wird nicht als YAML-Dokumentposition exportiert; verifiziere mit `npm test -- src/components/ForceTreeView.test.tsx src/App.test.tsx`.

## 2. Force-Layout und schreibgeschützte Zusatzansicht

- [x] 2.1 Ergänze `d3-force` und die zugehörigen TypeScript-Typen als begründete Abhängigkeiten und stelle sicher, dass der fokussierte Layout-Test die Bibliothek laden kann; verifiziere mit `npm test -- src/graph/force-layout.test.ts`.
- [x] 2.2 Implementiere den kleinsten testbaren Force-Layout-Adapter mit Link-, Many-Body-, Center- und Collision-Kräften, deterministischen Startpositionen und einer ID-basierten Projektion zurück auf React-Flow-Positionen; verifiziere mit `npm test -- src/graph/force-layout.test.ts`.
- [x] 2.3 Implementiere `ForceTreeView` mit lokalem Simulationszustand, Takt-Lifecycle, sichtbarer Node-Aktualisierung und Maus-Drag inklusive `fx`/`fy`-Fixierung; verifiziere mit `npm test -- src/components/ForceTreeView.test.tsx`.

## 3. In die Arbeitsfläche integrieren

- [x] 3.1 Integriere den View-Modus-Umschalter in `App`, übergebe die bestehende Projektion und Filter an die Zusatzansicht und halte Force-Positionen getrennt von den bisherigen temporären Übersichtpositionen; verifiziere mit `npm test -- src/App.test.tsx src/graph/graph-projection.test.ts`.
- [x] 3.2 Deaktiviere im Force-Modus Verbindungen, Auswahl und alle fachlichen Inspector-/Mutationseinstiege, halte Dateioperationen verfügbar und ergänze die nötigen deutschsprachigen Status- und Leertexte; verifiziere mit `npm test -- src/App.test.tsx`.
- [x] 3.3 Ergänze die Force-View-Klassen und responsive Darstellung, ohne die bestehende Übersicht visuell oder interaktiv zu regressieren; verifiziere mit `npm run build`.

## 4. Abschlussprüfung

- [x] 4.1 Führe die vollständige Test-Suite mit `npm test` aus.
- [x] 4.2 Führe `npm run build`, `openspec validate force-directed-tree-view --type change --strict` und `git diff --check` aus; prüfe zusätzlich, dass keine Force-Position oder virtuelle Ansichtsdaten in den Persistenzpfad gelangen.
