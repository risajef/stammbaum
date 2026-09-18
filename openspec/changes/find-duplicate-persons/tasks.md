## 1. Gleichnamige Kandidatenpaare als reine View-Auswertung

- [x] 1.1 Ergänze ausführbare, zunächst fehlschlagende Tests für alle eindeutigen Paare mit gleichem normalisiertem Vor-/Nachnamen, kompatiblen vollständigen und unvollständigen Geburtsdaten, gemischten bekannten/unbekannten Daten, den Generationenabständen `0`, `1` und `2+`, vier Prioritätsstufen, stabiler Dokumentreihenfolge sowie dem Ausschluss inkompatibler Daten; verifiziere den roten Zustand mit `npm test -- src/graph/graph-view.test.ts src/graph/graph-projection.test.ts`.
- [x] 1.2 Stelle die bestehende semantische Layout-Generation als wiederverwendbare, nicht persistierte Auswertung für die View-Logik bereit, ohne manuelle oder Force-Positionen einzubeziehen; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass das bisherige Layout und seine Generationserwartungen unverändert grün bleiben.
- [x] 1.3 Implementiere die pure Paarprüfung auf Basis des vollständigen Dokuments, des bestehenden Teil-Datumsparsers und der Layout-Generation einschließlich Prioritätsberechnung und stabiler Sortierung; verifiziere mit `npm test -- src/graph/graph-view.test.ts src/graph/graph-projection.test.ts`, dass alle Paar-, Kompatibilitäts- und Rankingtests grün sind.

## 2. Duplikatbereich in der Arbeitsfläche

- [x] 2.1 Ergänze ausführbare, zunächst fehlschlagende Anwendungs- oder Komponententests für den Bereich „Duplikate“, die alle eindeutigen gleichnamigen Paare, ihre Prioritätsreihenfolge, beide anklickbaren Personen, die stabile Reihenfolge und den Leerzustand prüfen; verifiziere den roten Zustand mit `npm test -- src/App.test.tsx`.
- [x] 2.2 Implementiere den readonly Duplikatbereich neben der bestehenden Personensuche und leite seine bewerteten Paare aus dem vollständigen aktuellen Dokument samt Layout-Generation ab; verifiziere mit `npm test -- src/App.test.tsx`, dass die Liste nach Import, Bearbeitung, Fusion und Löschung automatisch den aktuellen Zustand widerspiegelt.

## 3. Navigation aus Duplikatpaaren

- [x] 3.1 Ergänze ausführbare, zunächst fehlschlagende Anwendungstests für den Klick auf eine Person aus einem Duplikatpaar im Übersicht-Graphen, die Auswahl, Fokus, wiederholte Navigation zur selben Person und unveränderten Dirty-/Dokumentzustand abdecken; verifiziere den roten Zustand mit `npm test -- src/App.test.tsx`.
- [x] 3.2 Implementiere den gemeinsamen Navigationspfad für Duplikatpaare, der widersprechende lokale, Blutsverwandtschafts- und Leaf-Filter zurücksetzt oder anpasst, anschließend die Zielperson auswählt und den bestehenden Fokus-Request auslöst; verifiziere die Szenarien mit `npm test -- src/App.test.tsx`.
- [x] 3.3 Ergänze ausführbare, zunächst fehlschlagende Tests für die externe Fokusanforderung der Federungsansicht, einschließlich eines Ziels, das erst nach dem Filterwechsel sichtbar wird; verifiziere den roten Zustand mit `npm test -- src/components/ForceTreeView.test.tsx src/App.test.tsx`.
- [x] 3.4 Erweitere `ForceTreeView` um denselben Fokusvertrag wie die Übersicht und zentriere den Zielknoten ausschließlich im flüchtigen Viewportzustand; verifiziere mit `npm test -- src/components/ForceTreeView.test.tsx src/App.test.tsx`, dass die Federungsansicht fokussiert und fachlich unverändert bleibt.

## 4. Absicherung und Abschluss

- [x] 4.1 Refaktoriere nur mit grünen fokussierten Tests, halte Paarprüfung, UI und Fokuspfad nach den bestehenden Projektkonventionen klein und entferne keine bestehenden Such- oder Filterverhalten; verifiziere erneut `npm test -- src/graph/graph-view.test.ts src/components/ForceTreeView.test.tsx src/App.test.tsx`.
- [x] 4.2 Führe die vollständige Vitest-Suite aus und bestätige, dass alle bestehenden und neuen Tests mit `npm test` bestehen.
- [x] 4.3 Prüfe die TypeScript- und Produktionskompatibilität mit `npm run build` und dokumentiere als Rest-Risiko nur Fehler, die aus dem bereits vorhandenen Arbeitsbaum oder der lokalen Umgebung stammen.

## 5. Direkte Eltern-Kind-Beziehungen ausschließen

- [x] 5.1 Ergänze einen zunächst fehlschlagenden Regressionstest, der ein gleichnamiges direktes Eltern-Kind-Paar trotz kompatibler fehlender Daten aus den Duplikaten ausschließt; verifiziere den roten Zustand mit `npm test -- src/graph/graph-view.test.ts`.
- [x] 5.2 Implementiere den Ausschluss direkter `parent-child`-Beziehungen in beide Richtungen vor der Datums- und Generationenprüfung; verifiziere mit `npm test -- src/graph/graph-view.test.ts`, dass das Paar ausgeschlossen bleibt und bestehende Kandidaten unverändert bleiben.
- [x] 5.3 Führe die fokussierte Suite, die vollständige Vitest-Suite, den Produktions-Build und die OpenSpec-Validierung aus: `npm test -- src/graph/graph-view.test.ts src/components/ForceTreeView.test.tsx src/App.test.tsx`, `npm test`, `npm run build` und `openspec validate find-duplicate-persons --type change --strict`.

## 6. Prüfbereiche ein- und ausblenden

- [x] 6.1 Ergänze zunächst fehlschlagende Tests für unabhängige Header-Toggles im Duplikat- und OCR-Bereich, den standardmäßig geöffneten Zustand, das Wiedereinblenden und den unveränderten jeweils anderen Bereich; verifiziere mit `npm test -- src/App.test.tsx src/components/OcrSuggestionsPanel.test.tsx` den roten Zustand.
- [x] 6.2 Implementiere die lokalen, flüchtigen Sichtbarkeits-Toggles in `DuplicatePairsPanel` und `OcrSuggestionsPanel` einschließlich zugänglicher `aria-expanded`-Zustände, ohne Dokument- oder Persistenzzustand zu verändern; verifiziere mit `npm test -- src/App.test.tsx src/components/OcrSuggestionsPanel.test.tsx` die grünen Szenarien.
- [x] 6.3 Führe die fokussierte Suite, die vollständige Vitest-Suite, den Produktions-Build und die OpenSpec-Validierung aus: `npm test -- src/App.test.tsx src/components/OcrSuggestionsPanel.test.tsx`, `npm test`, `npm run build` und `openspec validate find-duplicate-persons --type change --strict`.

## 7. Personenkarten kompakter darstellen

- [x] 7.1 Ergänze einen zunächst fehlschlagenden Anwendungstest für zweizeilige Vor-/Nachnamen, entfernte Geschlechtsglyphen und Geschlechtslabels sowie unveränderte Farbklassen und Ehe-Handles; verifiziere den roten Zustand mit `npm test -- src/App.test.tsx`.
- [x] 7.2 Stelle Vor- und Nachnamen als getrennte Node-Daten bereit, rendere sie kompakt untereinander und entferne ausschließlich die redundante Geschlechtsanzeige aus `PersonNode`; verifiziere mit `npm test -- src/App.test.tsx src/graph/graph-projection.test.ts` die grünen Szenarien.
- [x] 7.3 Führe die fokussierte Suite, die vollständige Vitest-Suite, den Produktions-Build und die OpenSpec-Validierung aus: `npm test -- src/App.test.tsx src/graph/graph-projection.test.ts`, `npm test`, `npm run build` und `openspec validate find-duplicate-persons --type change --strict`.
