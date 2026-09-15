## 1. Anzeigegraph und Gruppenkandidaten

- [ ] 1.1 Ergänze fehlschlagende Graph-Unit-Tests für die Schnittmenge der direkten Kinder beider Ehepartner, eindeutige Kinder-IDs, automatisch abgeleitete Elternschaften, die Mindestanzahl von zwei Kindern und die Ablehnung einseitig verbundener Kinder; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die neuen Tests zunächst wegen der fehlenden Gruppierungslogik fehlschlagen.
- [ ] 1.2 Implementiere die testbare Ermittlung gültiger gemeinsamer Kindergruppen einschließlich der Überschneidungsprüfung gegen bereits aktive Gruppen; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die Tests aus 1.1 grün sind.
- [ ] 1.3 Ergänze fehlschlagende Graph-Unit-Tests für den virtuellen Gruppenknoten, die Endpunkt-Umschreibung, erhaltene Beziehungs-IDs und parallele Kanten sowie das Ausblenden interner Beziehungen ohne Selbstkante; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die neuen Projektionstests rot sind.
- [ ] 1.4 Erweitere die Arbeitsflächenprojektion um einen rein visuellen Anzeigegraphen mit Gruppenknoten und remappten Kanten und binde ihn an das bestehende deterministische Layout an; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die Projektionstests grün sind und das Eingabedokument unverändert bleibt.

## 2. Auswahl und Inspector-Aktionen

- [ ] 2.1 Ergänze fehlschlagende Komponenten-Tests für die Einklappaktion im Beziehunginspektor ab zwei gemeinsamen Kindern, das Ausbleiben der Aktion bei zu wenigen oder überlappenden Gruppen sowie den virtuellen Gruppeninspektor; verifiziere mit `npm test -- src/components/relationship-inspector.test.tsx` und dem passenden neuen Gruppeninspektor-Test, dass die Tests zunächst fehlschlagen.
- [ ] 2.2 Implementiere die Inspector-Aktionen zum Einklappen und Auffächern sowie die Markierung der gemeinsamen Kinder; verifiziere mit `npm test -- src/components/relationship-inspector.test.tsx` und den Gruppeninspektor-Tests, dass die Tests grün sind.
- [ ] 2.3 Ergänze den virtuellen Gruppenauswahltyp und die Sichtbarkeitsprüfung für Gruppenknoten; verifiziere mit einem fokussierten Anwendungstest, dass ein ausgewählter Gruppenknoten den Gruppeninspektor öffnet und nach dem Auffächern die zugehörige Ehe wieder ausgewählt wird.

## 3. Flüchtiger App-Zustand, Filter und Suche

- [ ] 3.1 Ergänze fehlschlagende Anwendungstests für Einklappen und Auffächern, unveränderte Personen-/Beziehungsanzahl, unveränderten Dirty-State, einzeln anklickbare externe Kanten und das Zurücksetzen bei Dokument- oder Datenänderungen; verifiziere mit `npm test -- src/App.test.tsx`, dass die neuen Tests zunächst fehlschlagen.
- [ ] 3.2 Integriere den flüchtigen Gruppenzustand in `App`, den React-Flow-Klickfluss und die bestehenden Datenänderungs- und Dokumentwechselpfade; verifiziere mit `npm test -- src/App.test.tsx`, dass die Szenarien aus 3.1 grün sind.
- [ ] 3.3 Ergänze fehlschlagende Anwendungstests für Filter, die eine Gruppe bei unvollständiger Sichtbarkeit vorübergehend auffächern, die Rückkehr der Gruppe nach dem Filter sowie die automatische Auffächerung eines Gruppenkinds über die Personensuche; verifiziere mit `npm test -- src/App.test.tsx`, dass diese Tests zunächst fehlschlagen.
- [ ] 3.4 Implementiere die Filter- und Suchsynchronisierung einschließlich Auswahl eines realen Suchtreffers ohne unsichtbaren Personenknoten; verifiziere mit `npm test -- src/App.test.tsx`, dass die Szenarien aus 3.3 grün sind und die YAML-Serialisierung weiterhin nur das originale Dokument verwendet.

## 4. Abschlussprüfung

- [ ] 4.1 Führe die fokussierten Graph-, Komponenten- und Anwendungstests nach einem Red-Green-Refactor-Durchlauf aus und verifiziere mit `npm test -- src/graph/graph-projection.test.ts src/components/relationship-inspector.test.tsx src/App.test.tsx`, dass alle betroffenen Tests grün sind.
- [ ] 4.2 Führe den vollständigen Testbestand und den Produktionsbuild aus und verifiziere mit `npm test` sowie `npm run build`, dass keine Regressionen oder TypeScript-/Buildfehler verbleiben.
- [ ] 4.3 Prüfe die OpenSpec-Artefakte und ihre Konsistenz mit `openspec validate --change "collapse-family-children" --strict`.
