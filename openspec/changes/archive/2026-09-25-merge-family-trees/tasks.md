## 1. ID-basierte Dokumentfusion

- [x] 1.1 Schreibe zuerst fehlschlagende Unit-Tests für die reine Fusionsfunktion: Union von Personen und Beziehungen, Deduplizierung identischer IDs, Erhalt nur in einer Quelle vorkommender Einträge, Trennung namensgleicher Personen mit verschiedenen IDs sowie Konfliktmeldungen mit Entitätsart, ID und Quelldateien; verifiziere den beabsichtigten roten Zustand mit `npm test -- src/domain/family-tree-merge.test.ts`.
- [x] 1.2 Implementiere die typisierte, nebenwirkungsfreie ID-Union für normalisierte `FamilyTreeDocument`-Quellen mit strukturiertem Erfolgs- und Konfliktergebnis; verifiziere die fokussierten Fusions-Unit-Tests mit `npm test -- src/domain/family-tree-merge.test.ts`.
- [x] 1.3 Ergänze Regressionstests für die Gesamtdokumentvalidierung nach der ID-Union, einschließlich nicht auflösbarer Personenreferenzen und unzulässiger doppelter Beziehungen mit unterschiedlichen IDs; verifiziere sie mit `npm test -- src/domain/family-tree-merge.test.ts`.

## 2. Mehrdatei-Dateiport

- [x] 2.1 Ergänze zuerst fehlschlagende Dateiport-Tests für native Mehrfachauswahl, Upload-Fallback mit mehreren YAML-Dateien, Dateinamen-/Inhaltszuordnung und Abbruch ohne Ergebnis; verifiziere den roten Zustand mit `npm test -- src/persistence/file-port-multiple.test.ts`.
- [x] 2.2 Ergänze die separate Mehrdatei-Öffnenoperation im Browser-Dateiport, ohne den bestehenden Einzeldatei-`open()`-Vertrag zu verändern; verifiziere native und Fallback-Szenarien mit `npm test -- src/persistence/file-port-multiple.test.ts`.

## 3. Atomare App-Fusion

- [x] 3.1 Schreibe zuerst fehlschlagende App-Tests für den zugänglichen Button „Stammbäume fusionieren“, die Auswahl beliebig vieler Quellen, das erfolgreiche Öffnen eines neuen ungespeicherten Vereinigungsdokuments und das Zurücksetzen von Auswahl, Ansichtsfiltern und temporären Zuständen; verifiziere den roten Zustand mit `npm test -- src/App.merge.test.tsx src/App.merge-validation.test.tsx src/App.test.tsx`.
- [x] 3.2 Schreibe zuerst fehlschlagende App-Tests für die Dirty-State-Warnung, ihre Ablehnung, Dateiauswahl-Abbruch sowie Parse-, Validierungs- und ID-Konflikte; jeder Fehler muss den bestehenden Stammbaum einschließlich Dirty-State unverändert lassen; verifiziere den roten Zustand mit `npm test -- src/App.merge.test.tsx src/App.merge-validation.test.tsx src/App.test.tsx`.
- [x] 3.3 Implementiere den separaten Fusionshandler in `App`: Dirty-State-Bestätigung vor der Dateiauswahl, vollständiges Parsen aller Quellen, ID-Fusion, Validierung und Inferenz-Synchronisierung vor jedem State-Update, verständliche Fehleranzeige, anschließender Dokumentwechsel mit neutralem Dateinamen und „Ungespeichert“-Status; verifiziere die fokussierten App-Tests mit `npm test -- src/App.merge.test.tsx src/App.merge-validation.test.tsx src/App.test.tsx`.
- [x] 3.4 Ergänze die sichtbare Dateiaktion in der bestehenden Toolbar und stelle sicher, dass Einzeldatei-Öffnen, normales Speichern und gefilterter Export ihren bisherigen Vertrag behalten; verifiziere dies mit `npm test -- src/App.merge.test.tsx src/App.merge-validation.test.tsx src/App.test.tsx` und den bestehenden Persistenztests.

## 4. Integration und Abschlussprüfung

- [x] 4.1 Ergänze einen realitätsnahen Workflow-Test für zwei oder mehr gefilterte YAML-Teilstämme mit gemeinsamen IDs, der den fusionierten Personen-/Beziehungsbestand und das erneute Speichern beziehungsweise Öffnen des Ergebnisses prüft; verifiziere ihn mit dem fokussierten App-/Persistenztestlauf.
- [x] 4.2 Führe die vollständige Unit-/Komponententestsuite mit `npm test` aus und behebe nur regressionsrelevante Fehler dieses Changes.
- [x] 4.3 Führe `npm run build` und `git diff --check` aus; verifiziere damit TypeScript-/Build-Konsistenz und eine whitespace-saubere Änderung ohne neue Schema- oder Abhängigkeitsänderung.

