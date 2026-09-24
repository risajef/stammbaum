## Context

Die Filterprojektion berechnet die sichtbare Teilmenge aus einem ausgewählten Anker und einer Bloodline-Regel. Die bestehende Nachkommenregel folgt nur parent-child-Kanten; die erweiterte Regel ergänzt Partner und deren Kinder. Die bestehende Regel für direkte Vorfahren enthält bereits die relevanten Partner und wird von den kombinierten Modi wiederverwendet.

## Goals / Non-Goals

**Goals:**

- Eine gemeinsame direkte Nachkommenmenge mit dem Anker, allen erreichbaren Nachkommen und deren direkten Partnern bilden.
- Den Partner des Ankers in direkten und erweiterten Nachkommenprojektionen als einzelnen Knoten einschliessen.
- Die bestehende Erweiterung um Kinder der Partner tatsächlicher Nachkommen und den Ausschluss von Partnerketten erhalten.
- Die kombinierten Modi durch Wiederverwendung derselben Nachkommenmengen konsistent halten.

**Non-Goals:**

- Keine Änderung an Filterbedienung, Auswahlzustand, Persistenz oder Export.
- Keine rekursive Erweiterung über Familienlinien von Partnern.
- Kein zusätzlicher Layoutmodus und keine neue öffentliche API.

## Decisions

1. **Direkte Partner werden als separate Nachkommenmenge ergänzt.**
   Die parent-child-Traversierung bleibt unverändert und wird um eine einmalige Iteration über `partnersByPerson` für den Anker und jeden erreichten Nachkommen ergänzt. Das hält die Generationstiefe unbeschränkt und verhindert implizite Partnerketten.

2. **Die erweiterte Regel baut auf der direkten Partner-Menge auf.**
   Danach werden nur Kinder von Partnern tatsächlicher Nachkommen ergänzt. Der Partner des Ankers ist zwar sichtbar, wird aber nicht als tatsächlicher Nachkomme behandelt; dadurch werden seine eigenen Kinder nicht automatisch übernommen.

3. **Kombinierte Modi verwenden die vorhandenen Vereinigungsregeln.**
   Der direkte kombinierte Modus erhält die direkte Partner-Menge, der erweiterte kombinierte Modus die erweiterte Menge. Beziehungen werden wie bisher erst nach der Personenprojektion auf sichtbare Endpunkte reduziert.

4. **Die Regressionstests prüfen Personen und Beziehungen.**
   Tests decken den Partner des Ankers, Partner direkter Nachkommen, ausgeschlossene Partnerfamilien und die Übernahme in beide kombinierten Modi ab. So bleibt die sichtbare Projektion unabhängig von der internen Traversierungsreihenfolge überprüfbar.

## Risks / Trade-offs

- **[Risiko]** Ein Partner des Ankers könnte versehentlich als erweiterter Nachkomme behandelt werden und dadurch seine Kinder einblenden. → Die erweiterte Traversierung schliesst den Anker bei der Kindererweiterung ausdrücklich aus; ein Regressionstest prüft diesen Fall.
- **[Risiko]** Eine direkte Partnerkante könnte die direkte Ansicht über die erlaubte Teilmenge hinaus erweitern. → Es werden nur Partnerknoten ergänzt; Eltern, Kinder und weitere Partnerketten bleiben ausgeschlossen und werden getestet.

## Migration Plan

Keine Datenmigration. Die Änderung wirkt bei der nächsten Berechnung eines Nachkommenfilters; gespeicherte Stammbaumdaten bleiben unverändert.
