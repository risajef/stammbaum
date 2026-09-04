## 1. Rote Tests fuer Teil-Datumswerte

- [x] 1.1 Domain-, Inspector- und YAML-Tests fuer `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, leere Werte, Legacy-Jahreszahlen, ungueltige Kalenderdaten und sicher fruehere Todesdaten ergaenzen; mit `npm test -- src/domain/person.test.ts src/components/person-inspector.test.tsx src/persistence/yaml.test.ts --run` als erwartungsgemaess fehlgeschlagenem Test beobachten.
- [x] 1.2 Inferenztests fuer einen sicheren Teilvergleich, einen unentscheidbaren Teilvergleich und mehrere verbleibende Kandidaten ergaenzen; mit `npm test -- src/domain/inference.test.ts --run` als erwartungsgemaess fehlgeschlagenem Test beobachten.

## 2. Gemeinsame Datumslogik und Personenmodell

- [x] 2.1 Einen kanonischen Partial-Date-Typ sowie gemeinsame Normalisierungs-, Format-, Kalender- und Teilvergleichslogik implementieren; mit den Domain- und Validierungstests aus 1.1 verifizieren.
- [x] 2.2 Personenoperationen und Dokumentvalidierung auf Datumsstrings umstellen, inklusive sicherer Lebensspannenpruefung und Legacy-Draft-Normalisierung; mit `npm test -- src/domain/person.test.ts --run` verifizieren.

## 3. UI, YAML und graphische Darstellung

- [x] 3.1 Den Personeninspektor auf ein einzelnes Textfeld fuer Geburt und Tod mit `YYYY-MM-DD`-Hinweis umstellen und Feldfehler beibehalten; mit `npm test -- src/components/person-inspector.test.tsx --run` verifizieren.
- [x] 3.2 YAML-Import und -Export fuer Teil-Datumsstrings und numerische Legacy-Jahreswerte implementieren; mit `npm test -- src/persistence/yaml.test.ts --run` verifizieren.
- [x] 3.3 Die Anzeige der Lebensdaten auf dem Personenknoten und die bestehenden Test-Fixtures auf kanonische Strings aktualisieren; mit `npm test -- src/graph/graph-projection.test.ts --run` verifizieren.

## 4. Zeitliche Inferenz

- [x] 4.1 Die Auswahl mehrerer Ehepartner auf sichere Teilvergleiche umstellen und unbekannte Komponenten als unentschieden behandeln; mit `npm test -- src/domain/inference.test.ts --run` verifizieren.
- [x] 4.2 Import- und Beziehungsabläufe mit Teil-Datumswerten in den E2E-Tests abdecken; mit `npm run test:e2e -- e2e/automation.spec.ts e2e/file-workflow.spec.ts --reporter=dot` verifizieren.

## 5. Abschluss

- [x] 5.1 Alle verbleibenden Produktions- und Test-Fixtures auf ausgeschriebene Jahresannahmen prüfen und die gezielte Datums-/Jahressuche ohne unerwartete Treffer ausführen.
- [x] 5.2 Vollständige Unit- und E2E-Suite, Build, Editor-Diagnosen, OpenSpec-Validierung und Whitespace-Prüfung ausführen: `npm test -- --run`, `npm run test:e2e`, `npm run build`, `openspec validate support-partial-life-dates --type change --no-interactive`, `git diff --check`.
