## 1. Domänenverhalten als fehlschlagende Tests festlegen

- [x] 1.1 Ergänze ausführbare Domänentests für die erfolgreiche Fusion, die Übernahme fehlender Werte, präzisere Teildaten, Kommentarzusammenführung und atomare Konfliktfehler; verifiziere mit `npm test -- src/domain/person.test.ts`, dass die neuen Tests zunächst wegen der fehlenden Fusionsoperation fehlschlagen.
- [x] 1.2 Ergänze ausführbare Domänentests für das Umschreiben beider Beziehungsendpunkte, die Konsolidierung doppelter Eltern-/Ehekanten, das Entfernen von Selbstkanten, automatische Ableitungen und die Grenze von zwei eindeutigen Eltern; verifiziere mit `npm test -- src/domain/person.test.ts src/domain/relationship.test.ts`, dass die neuen Tests zunächst fehlschlagen.

## 2. Atomare Personenfusion implementieren

- [x] 2.1 Implementiere die konfliktbewusste, nicht mutierende Datenfusion mit stabiler Survivor-ID, kompatiblen Teil-Datumswerten, zusammengeführten Kommentaren und passenden Domain-Fehlern; verifiziere, dass die fokussierten Domänentests aus 1.1 grün sind.
- [x] 2.2 Implementiere die ID-Umschreibung für alle Beziehungsendpunkte, die Priorisierung und Konsolidierung kollabierender Kanten sowie die Entfernung entstehender Selbstbeziehungen; verifiziere, dass die fokussierten Beziehungstests aus 1.2 grün sind und der Eingabedatensatz unverändert bleibt.
- [x] 2.3 Integriere die bestehende Synchronisierung automatischer Beziehungen und prüfe den fusionierten Kandidaten atomar auf höchstens zwei eindeutige Eltern pro Kind sowie auf Dokumentvalidität; verifiziere Erfolgs- und Fehlerfälle mit `npm test -- src/domain/person.test.ts src/domain/relationship.test.ts`.

## 3. Fusionsablauf als fehlschlagende UI-Tests festlegen

- [x] 3.1 Ergänze ausführbare Komponenten- und Anwendungstests für den Fusionsstart aus dem Personeninspektor, die Auswahl der zweiten Person per Node oder Suche, die Warnung mit Abbruch sowie die erfolgreiche Entfernung der zweiten Person; verifiziere mit `npm test -- src/App.test.tsx src/components/person-inspector.test.tsx`, dass die neuen Tests zunächst fehlschlagen.
- [x] 3.2 Ergänze ausführbare Anwendungstests für Daten-/Elternkonflikte ohne Teiländerung, Dirty-State, Auswahl der verbleibenden Person und die Neuberechnung der sichtbaren Positionen; verifiziere mit `npm test -- src/App.test.tsx`, dass die neuen Tests zunächst fehlschlagen.

## 4. Fusionsablauf in der Arbeitsfläche umsetzen

- [x] 4.1 Ergänze den expliziten Fusionsmodus im Personeninspektor und in der Arbeitsfläche, einschließlich zweiter Person über Node oder Suche und Schutz vor der Auswahl derselben Person; verifiziere die Szenarien aus 3.1 mit `npm test -- src/App.test.tsx src/components/person-inspector.test.tsx`.
- [x] 4.2 Ergänze die destruktive Bestätigungswarnung und wende die Domänenoperation nur bei Bestätigung an; verifiziere, dass Abbruch, Datenkonflikt und Elternlimit Dokument, Auswahl und Dirty-State unverändert lassen.
- [x] 4.3 Übernehme einen erfolgreichen Fusionserfolg als einen Dokumentzustandswechsel, setze den Fusionsmodus zurück, leere temporäre Positionen, lasse das bestehende DAG-Layout neu projizieren, wähle die verbleibende Person aus und markiere das Dokument als ungespeichert; verifiziere die Szenarien aus 3.2 mit `npm test -- src/App.test.tsx`.

## 5. Relationale Generationsebenen im DAG

- [x] 5.1 Ergänze einen ausführbaren roten Regressionstest für einen flachen und einen deutlich tieferen Seitenast, deren Blätter nicht mehr auf derselben Ebene liegen dürfen; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass der Test mit der bisherigen Rückwärtsausrichtung zunächst fehlschlägt.
- [x] 5.2 Ersetze die rückwärts aus der längsten Blattkette abgeleitete Layer-Zuweisung durch eine deterministische Vorwärtsberechnung aus `max(Elternlayer) + 1`, normalisiert um den bestehenden ältesten Personenanker; erhalte die gemeinsame Ebene von Ehepartnern und Co-Eltern und verifiziere die neuen sowie betroffenen bestehenden Layouttests.
- [x] 5.3 Aktualisiere nur die durch die neue relationale Ebenensemantik obsolet gewordenen Erwartungen und bestätige die vollständige Graph-Projektionssuite mit `npm test -- src/graph/graph-projection.test.ts`.

## 6. Root-relatives DAG-Layout

- [x] 6.1 Ergänze einen roten Regressionstest, der eine nicht-älteste erste YAML-Person als Ebene 0 verankert und Eltern bzw. Kinder auf den benachbarten Ebenen erwartet; verifiziere mit `npm test -- src/graph/graph-projection.test.ts`, dass die bisherige Altersverankerung zunächst fehlschlägt.
- [x] 6.2 Ergänze einen roten Regressionstest für unterschiedlich lange Vorfahrenpfade, der direkte Eltern auf Ebene n-1 und im unvermeidbaren Konflikt höchstens auf n-2 erwartet; verifiziere den Fehler vor der Implementierung.
- [x] 6.3 Ersetze die globale Alters-/Tiefennormalisierung durch eine root-relative bidirektionale DAG-Traversierung mit topologischer Stabilisierung, maximalem Normalabstand von zwei Ebenen und deterministischen lokalen Ankern für getrennte Gruppen; erhalte gemeinsame Ebenen von Ehepartnern und Co-Eltern.
- [x] 6.4 Führe die fokussierte Graphsuite und danach die vollständige Testsuite aus; aktualisiere nur obsolet gewordene absolute Layer-Erwartungen.

## 7. Abschlussprüfung

- [x] 7.1 Verifiziere den vollständigen Testbestand mit `npm test` und den TypeScript-/Produktionsbuild mit `npm run build`.
- [x] 7.2 Verifiziere die OpenSpec-Artefakte mit `openspec validate "merge-duplicate-persons" --type change --strict --no-interactive` und stelle sicher, dass Proposal, Spezifikation, Design und Tasks konsistent vorliegen.
