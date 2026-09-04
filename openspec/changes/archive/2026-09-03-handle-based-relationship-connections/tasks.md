## 1. Handle-Klassifikation als getestete Fachlogik

- [x] 1.1 Schreibe zuerst fehlende Unit-Tests für die reine Handle-Klassifikation: seitliche Ehe in beiden Ziehrichtungen, vertikale Verbindung vom unteren zum oberen Handle unabhängig von Node-Positionen sowie unzulässige Handle-Muster; verifiziere den erwarteten roten Lauf mit `npm test -- --run src/graph/relationship-connection.test.ts`.
- [x] 1.2 Implementiere die kleinste öffentliche Klassifikationsfunktion für die beiden Handle-Muster, die Personen-IDs und den vorgegebenen Beziehungstyp liefert oder einen verständlichen Fehler zurückgibt; verifiziere mit `npm test -- --run src/graph/relationship-connection.test.ts`.

## 2. Sichtbare semantische Handles

- [x] 2.1 Ergänze zuerst einen fehlschlagenden Komponenten- oder E2E-Test, der den seitlichen Handle rechts bei Männern, links bei Frauen und nicht bei Personen ohne Geschlechtsangabe erwartet; verifiziere den roten Lauf mit dem gezielten Vitest- beziehungsweise Playwright-Test.
- [x] 2.2 Ergänze `PersonNode` um die semantischen seitlichen Handles, bewahre die oberen und unteren Handles für Eltern-Kind-Verbindungen und passe die bestehende Handle-Darstellung für die neuen seitlichen Punkte an; verifiziere mit dem Test aus 2.1 und `npm run build`.

## 3. Bestätigungsfluss und Beziehungstyp

- [x] 3.1 Schreibe zuerst fehlschlagende Komponententests für einen neuen Beziehunginspektor mit fest vorgegebenem Typ sowie weiterhin optionaler Quelle und optionalem Kommentar; verifiziere den roten Lauf mit `npm test -- --run src/components/relationship-inspector.test.tsx`.
- [x] 3.2 Passe `RelationshipInspector` und den Verbindungsentwurf so an, dass der klassifizierte Typ angezeigt und nicht manuell gewechselt wird, die Zusatzfelder optional bleiben und nur Speichern den Commit ausführt; verifiziere mit `npm test -- --run src/components/relationship-inspector.test.tsx`.
- [x] 3.3 Schreibe zuerst fehlschlagende App- beziehungsweise Integrations-Tests für Ehe über seitliche Handles, Eltern-Kind über untere/obere Handles, umgekehrte Ziehrichtung, Verwerfen sowie unveränderte Daten vor der Bestätigung; verifiziere den roten Lauf mit dem gezielten Testbefehl.
- [x] 3.4 Integriere die Handle-Klassifikation in `App`, aktiviere die nötige bidirektionale Handle-Verbindung, speichere nur nach Inspektor-Bestätigung und leite Validierungsfehler ohne Teiländerung an den bestehenden Fehlerpfad; verifiziere mit den Tests aus 3.3 und `npm run build`.

## 4. Regression und Gesamtverifikation

- [x] 4.1 Aktualisiere bestehende Beziehungs-E2E-Szenarien auf die semantisch passenden Handles und ergänze die Fälle gleichgeschlechtlicher/fehlender Ehe-Handles, Duplikat, optionale Metadaten und automatische Layoutanpassung; verifiziere mit `npm run test:e2e -- e2e/relationships.spec.ts e2e/relationship-details.spec.ts`.
- [x] 4.2 Führe die fokussierten Unit- und Komponenten-Tests, die vollständige Vitest-Suite, die relevanten Playwright-Tests und den Produktionsbuild aus: `npm test`, `npm run test:e2e` und `npm run build`; dokumentiere eventuelle residuale Risiken im Abschluss.
