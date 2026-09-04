## 1. Layout-Regressionstests zuerst

- [x] 1.1 Ergänze am öffentlichen `projectFamilyTree`-Seam fehlschlagende Tests für die automatisch älteste Root, YAML-Reihenfolge bei Gleichstand, direkte Eltern auf `Kind - 1`, Geschwister auf derselben Ebene und die DAG-Ausnahme; verifiziere den roten Lauf mit `npm test -- --run src/graph/graph-projection.test.ts`.
- [x] 1.2 Ergänze fehlschlagende Graph-Projektions-Tests für Mann-links-von-Frau, Ehepartner auf derselben Ebene auch bei tieferer Ahnenlinie, zusammenhängende Mehrfachheiratsgruppen sowie kompakte Ebenenkonturen bei unterschiedlich tiefen Teilbäumen; verifiziere den roten Lauf mit `npm test -- --run src/graph/graph-projection.test.ts`.

## 2. Root- und Layer-Berechnung

- [x] 2.1 Implementiere die deterministische Root-Auswahl aus dem frühesten sicher vergleichbaren Geburtsdatum mit YAML-Reihenfolge als Tie-Breaker, berechne Teilbaumhöhen von unten nach oben und komprimiere die Layer auf die frühestmögliche gültige Eltern-Kind-Ebene, ohne Root- oder Layer-Daten zu persistieren; verifiziere mit den Tests aus 1.1.
- [x] 2.2 Bewahre Ehegruppen und gemeinsame Eltern auf demselben Layer und stelle sicher, dass Eltern vor und Kinder nach der zugehörigen Gruppe liegen; verifiziere mit `npm test -- --run src/graph/graph-projection.test.ts`.

## 3. Horizontale Familiengruppen

- [x] 3.1 Ordne die Mitglieder von Ehegruppen deterministisch mit Männern links von Frauen an und berechne pro Teilbaum Ebenenkonturen von unten nach oben; verifiziere mit den Tests aus 1.2.
- [x] 3.2 Platziere Teilbäume kollisionsfrei mit minimaler Verschiebung bis zur ersten tatsächlichen Ebenenkollision, ohne die automatische Neuberechnung oder temporäre Positionen zu verändern; verifiziere mit `npm test -- --run src/graph/graph-projection.test.ts` und `npm run build`.
- [x] 3.3 Bewahre beim Anlegen einer Person den aktuellen Viewport und bestehende sichtbare Positionen, zentriere den neuen Node im Sichtbereich und verankere nach dem Speichern einer Beziehung das neu berechnete Layout an den verbundenen Personen; verifiziere mit `npm run test:e2e -- e2e/automation.spec.ts -g "behält den aktuellen Viewport|ordnet Familie automatisch" --workers=1`.

## 4. Gesamtverifikation

- [x] 4.1 Führe die vollständige Vitest-Suite und die relevanten Familienfluss-E2E-Tests aus und prüfe den Produktionsbuild: `npm test`, `npm run test:e2e -- e2e/handle-connections.spec.ts e2e/relationships.spec.ts e2e/relationship-details.spec.ts` und `npm run build`.
