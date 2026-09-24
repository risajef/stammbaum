## 1. Testfälle zuerst

- [x] 1.1 Graph-View-Tests für die beiden kombinierten Filtermengen und die anschließende Verwendung des bestehenden Layoutalgorithmus ergänzen und mit `npm test -- src/graph/graph-view.test.ts` den erwarteten roten Lauf beobachten.
- [x] 1.2 Tests für gefilterte Exportprojektion, dangling Inferenzreferenzen und sprechende Dateinamen ergänzen und mit dem fokussierten Vitest-Lauf den erwarteten roten Lauf beobachten.
- [x] 1.3 Einen App- oder Playwright-Regressionstest für den Exportbutton, den vorgeschlagenen Dateinamen, den sichtbaren Teilbaum und den unveränderten Dirty-State ergänzen.

## 2. Kombinierte Ansichtsfilter

- [x] 2.1 Die beiden neuen `BloodlineMode`-Varianten und die Vereinigungslogik aus den bestehenden direkten und erweiterten Vorfahren-/Nachkommenmengen implementieren; die resultierende Projektion muss automatisch den bestehenden Layoutpfad verwenden und die Graph-View-Tests müssen grün werden.
- [x] 2.2 Die Buttons „Direkte Vor und Nachfahren“ und „Erweiterte direkte Vor und Nachfahren“ in die Toolbar aufnehmen und die bestehende On-Demand-Ankerlogik wiederverwenden; App-Filtertests und der Build müssen erfolgreich sein.
- [x] 2.3 Filterzusammensetzung mit lokaler Ansicht, Leaf-Filter, Auswahlwechsel und erneutem Buttonklick prüfen; `npm test -- src/App.test.tsx src/graph/graph-view.test.ts` muss grün sein.

## 3. Gefilterte YAML-Exportprojektion

- [x] 3.1 Eine getestete Exportprojektion aus dem aktuell sichtbaren Dokument erzeugen, die nur sichtbare Personen und Beziehungen mit zwei sichtbaren Endpunkten enthält und dangling automatische Herkunftsreferenzen für den eigenständigen Export normalisiert.
- [x] 3.2 Einen reinen Dateinamen-Helfer für Filterlabel, gespeicherten Filteranker, Sonderzeichenbereinigung und `.yaml`-Fallback implementieren; die Dateinamen- und Projektionstests müssen grün werden.
- [x] 3.3 Den bestehenden Browser-Dateiport um einen optionalen `suggestedName` für den nativen Save Picker erweitern und den bestehenden Download-Fallback unverändert weiterverwenden; `npm test -- src/persistence/file-port.test.ts` muss grün sein.

## 4. Export-UI und Integration

- [x] 4.1 Einen separaten `Exportieren`-Handler in `App` integrieren, der die sichtbare Projektion serialisiert und speichert, ohne Dokument, Filter, Auswahl, regulären Dateinamen, Dirty-State oder neue-Personen-Ausnahme zu verändern; der App-Regressionstest muss grün werden.
- [x] 4.2 Den zugänglichen Exportbutton in die Dateifunktionen aufnehmen und Fehler beim Abbruch/Fehlschlag über den bestehenden Workflow-Fehlerzustand anzeigen; der fokussierte Playwright-Exporttest muss grün werden.
- [x] 4.3 Die Toolbar für die zusätzlichen Filter- und Exportaktionen in Desktop- und schmalen Viewports prüfen; `npm run test:e2e -- e2e/responsive-workbench.spec.ts` muss grün sein.

## 5. Abschlussprüfung und Spezifikationsabgleich

- [x] 5.1 `npm test` und `npm run build` erfolgreich ausführen und verbleibende Warnungen dokumentieren.
- [x] 5.2 `npm run test:e2e` für die vollständige Browser-Suite ausführen und alle relevanten Tests erfolgreich abschließen.
- [x] 5.3 `openspec validate --strict` ausführen, den Change-Status aktualisieren und die geänderte Capability mit `openspec-sync-specs` in die Hauptspezifikation synchronisieren.
