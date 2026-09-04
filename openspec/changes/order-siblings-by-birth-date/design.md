## Context

Die Motivation ist in `proposal.md` beschrieben. Die automatische Positionierung entsteht in `src/graph/graph-projection.ts`: Beziehungen werden zunächst zu Familienkomponenten verdichtet, danach werden die Kinder jeder Komponente in `layoutChildren` gesammelt. Ihre Einfügereihenfolge bestimmt aktuell die horizontale Reihenfolge und folgt damit im Wesentlichen der YAML-Reihenfolge.

Die bestehende Komponentengraph- und Zentrierungslogik soll erhalten bleiben. Die Änderung muss nur die Reihenfolge der bereits ermittelten Kindkomponenten vor ihrer Platzierung beeinflussen.

## Goals / Non-Goals

**Goals:**

- Die horizontale Platzierung der Kindkomponenten folgt den bekannten Geburtsdatumskomponenten der jeweils als Kind verbundenen Person.
- Bekannte Komponenten werden chronologisch verglichen; fehlende oder nicht sicher vergleichbare Angaben bleiben stabil, Personen ohne Geburtsdatum bilden den letzten Rang.
- Halbgeschwister werden automatisch gemeinsam behandelt, weil sie über mindestens ein gemeinsames Elternteil in derselben Kindliste landen.
- Die bestehende Kompaktheit, Zentrierung, Generationseinteilung, Ehepartner-Sortierung und das Verhalten von Positionsüberschreibungen bleiben erhalten.
- Die Regel wird am bestehenden `projectFamilyTree`-Test-Seam verifiziert.

**Non-Goals:**

- Keine Änderung des Datenmodells, der YAML-Serialisierung oder der Beziehungsvalidierung.
- Keine Neuanordnung der Personen innerhalb eines Ehepartner-Blocks.
- Keine nachträgliche Speicherung oder Persistierung automatisch berechneter Positionen.

## Decisions

1. **Sortierung an der Kindlisten-Grenze.**

   `layoutChildren` wird nach dem Aufbau anhand der Kindkomponente sortiert, bevor die Layouts rekursiv platziert werden. Das nutzt den vorhandenen Layoutmechanismus und vermeidet eine zweite Positions- oder Zentrierungslogik.

   Als Sortierschlüssel wird die Person verwendet, die durch eine Eltern-Kind-Beziehung als Ziel in die jeweilige Kindkomponente führt. Dadurch wird bei einem Kind mit Ehepartner nicht versehentlich das Geburtsdatum des Ehepartners für die Geschwisterreihenfolge herangezogen. Falls eine Komponente mehrere solche Zielpersonen enthält, werden ihre bekannten Datumskomponenten deterministisch verglichen; die bestehende Komponentenreihenfolge bleibt der letzte Tie-Breaker.

2. **Bekannte Komponenten werden ohne Imputation verglichen.**

   Die vorhandene Partial-Date-Struktur wird von links nach rechts verglichen: zuerst das Jahr, dann der Monat, dann der Tag. Eine Komponente wird nur verglichen, wenn beide Seiten diesen Bestandteil kennen; sobald ein Bestandteil auf einer Seite fehlt, gilt das Paar als nicht sicher unterscheidbar und fällt auf `component.order` zurück. So werden beispielsweise bekannte Geburtsjahre 1900 und 1905 geordnet, während 1900-05 und 1900-09 ebenfalls geordnet werden können, aber 1900 und 1900-05 stabil in Dokumentreihenfolge bleiben. Eine Person ohne parsebares oder vorhandenes Geburtsdatum wird hinter Personen mit bekannten Angaben eingeordnet.

   Diese Entscheidung folgt der bestehenden Behandlung partieller Lebensdaten: fehlende Komponenten werden nicht künstlich ergänzt und dürfen keine scheinpräzise Reihenfolge erzeugen.

3. **Halbgeschwister nutzen dieselbe Kindliste.**

   Die Eltern-Kind-Kanten jedes Elternteils werden weiterhin unabhängig verarbeitet. Kindkomponenten, die mindestens ein gemeinsames Elternteil haben, werden dadurch an derselben Elternkomponente gesammelt und mit demselben Vergleicher sortiert. Die Komponentengraphbildung wird nicht erweitert.

4. **Regressionstest am Projektionsergebnis.**

   Ein Test mit absichtlich umgekehrter Dokumentreihenfolge prüft die x-Positionen von ältestem, jüngerem, halbgeschwisterlichem und unbekannt datiertem Kind. Weitere bestehende Layouttests stellen sicher, dass y-Positionen, Zentrierung und deterministische Projektion unverändert bleiben. Es werden keine internen Sortierfunktionen direkt getestet.

## Risks / Trade-offs

- **[Risiko]** Ein Kindkomponenten-Block kann mehrere als Kind verbundene Personen enthalten, etwa durch ungewöhnliche oder komplexe Daten. → Der Sortierschlüssel wird aus den tatsächlichen Zielpersonen der Eltern-Kind-Kanten gebildet; bei Mehrdeutigkeit greift eine stabile Komponentenreihenfolge.
- **[Risiko]** Die chronologische Regel kann die horizontale Breite oder die Lage eines gesamten Teilbaums verändern. → Der vorhandene Intervall-, Abstands- und Zentrierungsmechanismus bleibt unverändert; nur die Reihenfolge der Eingaben wird ersetzt.
- **[Trade-off]** Bei gleichen bekannten Komponenten, aber fehlender weiterer Präzision, ist keine sichere chronologische Entscheidung möglich. → Die fehlenden Komponenten werden nicht ergänzt; der stabile Dokument-Tie-Breaker verhindert dennoch eine nichtdeterministische Anordnung.

## Migration Plan

Keine Migration erforderlich. Die Änderung betrifft nur die zur Laufzeit berechnete Ausgangsposition; gespeicherte Dokumente bleiben kompatibel. Bei einem Rollback wird ausschließlich der neue Sortierschlüssel entfernt.
