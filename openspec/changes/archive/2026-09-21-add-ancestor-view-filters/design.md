## Context

Die bestehende View-Projektion in `src/graph/graph-view.ts` berechnet lokale Distanz, die gerichtete Blutsverwandtschaft und Leaf-Filter vor dem gemeinsamen Layout. `App.tsx` haelt den Anker und die Filter aktuell als lokalen React-State. Die neue Funktion erweitert diese vorhandene Projektion; sie benoetigt keine neue Persistenz und kein neues Datenmodell.

## Goals / Non-Goals

**Goals:**

- Eine deterministische, iterative Berechnung fuer direkte Vorfahren, Vorfahrenpartner und die optionale Geschwistererweiterung.
- Die bestehende gerichtete Eltern-Kind-Semantik beibehalten: `fromId` ist Elternteil, `toId` ist Kind.
- Die neue Auswahl in der bestehenden Filterleiste darstellen und mit Auswahl, Layout, lokaler Ansicht und Leaf-Filter synchron halten.
- Die Regeln fuer ausgeschlossene Seitenlinien durch reine Projektionstests absichern.

**Non-Goals:**

- Keine Aenderung an Personen, Beziehungen, automatischer Inferenz oder YAML-Schema.
- Keine rekursive Ermittlung von Familien des Partners.
- Keine neue Begrenzung nach Geburtsjahr oder fester Generation.

## Decisions

1. **Ein gemeinsamer Modus statt unabhaengiger Booleans:** Die View-Option erhaelt einen einzelnen Blutlinienmodus mit den Werten `blood`, `direct-ancestors` und `extended-direct-ancestors`. Dadurch koennen die drei verschachtelten Varianten nicht versehentlich gleichzeitig aktiviert werden. Die bisherige `bloodOnly`-Semantik wird auf `blood` abgebildet.

2. **Direkte Linie mit gerichteter BFS:** Ausgehend vom Anker werden Eltern-Kind-Kanten entgegen ihrer Richtung iterativ zu allen Vorfahren verfolgt. Der Anker und diese Vorfahren bilden die direkte Linie. Fuer jede Person dieser Linie werden Ehebeziehungen ungerichtet nur zum jeweiligen Partner verfolgt; die Eltern oder Kinder des Partners werden dadurch nicht automatisch eingeschlossen.

3. **Geschwister aus gemeinsamen Eltern:** Fuer die erweiterte Variante werden fuer jeden direkten Vorfahren seine Eltern ermittelt und deren Kinder als Geschwister gesammelt. Der Vorfahr selbst wird aus dieser Menge entfernt. Danach werden nur die Partner dieser Geschwister zur sichtbaren Menge hinzugefuegt. Es wird keine Kindkante der Geschwister weiter verfolgt, wodurch deren Kinder und weitere Nachkommen ausgeschlossen bleiben.

4. **Filter als Schnittmenge vor dem Layout:** Die berechnete ID-Menge wird wie die bestehenden Filter mit lokaler Distanz und Leaf-Filter geschnitten. Beziehungen werden weiterhin nur behalten, wenn beide Endpunkte sichtbar sind. Das gefilterte Dokument wird anschliessend durch denselben Projektions- und Layoutpfad verarbeitet.

5. **Anker und fehlender Anker:** Die Vorfahrenmenge wird nur berechnet, wenn der gewaehlte Anker im Dokument existiert. Ohne Anker wirkt der Blutlinienmodus wie der bisherige Filter ohne Anker und laesst die Vollansicht unveraendert. Wird der Anker durch eine andere Filterkombination unsichtbar, bereinigt die bestehende Auswahl-Synchronisation die Auswahl.

6. **Testgrenze:** Die Mengenberechnung wird mit `src/graph/graph-view.test.ts` auf einem kleinen Dokument mit mehreren Generationen, mehreren Partnern, Halbgeschwistern, Geschwisterkindern und Partnerfamilien getestet. Ein App-Test prueft die alternative Auswahl und die sichtbare UI-Beschriftung.

## Risks / Trade-offs

- **[Risk]** In grossen Stammbauemen koennen viele Geschwister und Partner sichtbar werden. **Mitigation:** Die Berechnung bleibt linear in den vorhandenen Eltern-, Kinder- und Ehe-Adjazenzen und fuehrt keine rekursive Partnerfamilien-Suche aus.
- **[Risk]** Unvollstaendige oder zyklische Eltern-Kind-Daten koennten Traversierungen wiederholen. **Mitigation:** Alle BFS-Mengen verwenden besuchte Personen-IDs und terminieren deterministisch.
- **[Risk]** Die drei Modi koennten als unabhaengige Checkboxen erwartet werden. **Mitigation:** Die UI verwendet eine einzige alternative Modusauswahl; die bestehende lokale und Leaf-Auswahl bleibt unabhaengig kombinierbar.

## Migration Plan

Keine Datenmigration. Nach dem Update ist der Modus `blood` beziehungsweise „Nur Blutsverwandte“ deaktiviert, sodass die Standardansicht unveraendert bleibt. Ein Rollback entfernt nur die neuen View-Optionen, Projektionstests und UI-Steuerung; gespeicherte YAML-Daten bleiben kompatibel.
