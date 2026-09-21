## Context

Die bestehende Personenalter-Auswertung verwendet bei fehlendem Todesdatum das optionale Auswertungsdatum als künstliches Ende. Die Histogramm-Buckets werden aus den resultierenden Werten gebildet; deshalb zieht ein historischer Datensatz ohne Todesjahr die x-Achse bis in unrealistische Altersbereiche.

## Goals / Non-Goals

**Goals:**

- Personenalter ausschließlich aus Geburts- und Todesdaten ableiten.
- Personen ohne Todesdatum vollständig aus dieser einen Auswertung ausschließen.
- Die bestehende dynamische Bucketbildung beibehalten, sodass nach dem Ausschluss keine künstlichen Altersklassen mehr entstehen.
- Heiratsalter, Kinderzahlgruppen und Wiederheiratsabstände unverändert lassen.

**Non-Goals:**

- Keine Schätzung eines Todesdatums oder aktuellen Alters.
- Keine harte Obergrenze von 100 Jahren; tatsächlich belegte höhere Todesalter bleiben sichtbar.
- Keine Änderung der YAML-Struktur oder der übrigen Diagramme.

## Decisions

1. **Fehlendes Todesdatum führt zum Ausschluss.**

   Die Personenalter-Funktion prüft ein Todesdatum, bevor sie eine Altersbeobachtung erzeugt. Das Auswertungsdatum bleibt als API-Option und Validierungswert bestehen, wird aber nicht mehr als Ersatz-Endpunkt für Personenalter verwendet. Die Alternative, weiterhin lebende Personen einzubeziehen, widerspricht der fachlichen Aussage, dass ihr Alter unbekannt ist.

2. **Keine zusätzliche x-Achsenbegrenzung.**

   Die Histogrammrenderer bilden ihre Klassen bereits aus den vorhandenen Werten. Nach dem Ausschluss künstlicher `as-of`-Werte endet die Personenalter-Achse automatisch bei der höchsten realen Todesaltersklasse. Eine feste Kappung bei 100 würde mögliche, aber seltene höhere Todesalter unterschlagen und ist daher nicht vorgesehen.

3. **Bestehende Approximationen bleiben erhalten.**

   Teilweise bekannte Geburts- oder Todesdaten werden weiterhin als ungefähre Beobachtungen markiert. Ein vorhandenes, aber ungültiges Todesdatum erzeugt wie bisher keine gültige Altersbeobachtung.

## Risks / Trade-offs

- [Risk] Die Anzahl der Personenalter-Beobachtungen sinkt, weil Personen ohne Todesjahr nicht mehr erscheinen. → Das entspricht der bestätigten fachlichen Definition; die Zusammenfassung zeigt die kleinere auswertbare Anzahl.
- [Risk] Das weiterhin akzeptierte Auswertungsdatum könnte als irreführend wahrgenommen werden. → Es bleibt für reproduzierbare Statistikaufrufe und bestehende Optionen erhalten; die HTML-Beschriftung nennt ausdrücklich das Alter beim Tod.
