## 1. Rote Tests

- [x] 1.1 Einen fehlschlagenden Domain-Test für das Entfernen einer Person mit Ehe- und Eltern-Kind-Beziehungen sowie für eine unbekannte ID ergänzen; mit `npm test -- src/domain/person.test.ts` den beabsichtigten Fehlschlag beobachten.
- [x] 1.2 Einen fehlschlagenden Personen-Inspektor-Test ergänzen, der den Button nur bei einer bestehenden Person zeigt und den Remove-Callback auslöst; mit `npm test -- src/components/person-inspector.test.tsx` den beabsichtigten Fehlschlag beobachten.

## 2. Domäne und Inspektor

- [x] 2.1 Eine atomare Domänenoperation zum Entfernen einer Person mit allen referenzierenden Beziehungen, Inferenz-Synchronisierung und Validierung implementieren; den Domain-Test aus 1.1 grün machen.
- [x] 2.2 Den Personen-Inspektor um den Button „Person entfernen“ analog zum Beziehungs-Inspektor erweitern und im Fusionsmodus ausblenden; den Inspektor-Test aus 1.2 grün machen.

## 3. App-Integration

- [x] 3.1 Einen fehlschlagenden App-Test für Bestätigen, Abbrechen, kaskadierendes Entfernen, Auswahlaufhebung und Dirty-State ergänzen; mit `npm test -- src/App.test.tsx` den beabsichtigten Fehlschlag beobachten.
- [x] 3.2 Die bestätigte Löschaktion in `App.tsx` anbinden und nach erfolgreichem Löschen Auswahl, temporäre Positionen und aktive Gruppen zurücksetzen; den App-Test aus 3.1 grün machen.

## 4. Verifikation

- [x] 4.1 `npm test` und `npm run build` erfolgreich ausführen und mit `git diff --check` die Änderung prüfen.
- [x] 4.2 Den Change mit `openspec validate delete-person-and-relationships --type change --strict` validieren.
