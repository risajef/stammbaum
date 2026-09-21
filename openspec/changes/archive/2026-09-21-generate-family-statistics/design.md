## Context

Siehe `proposal.md` und die neue Capability `family-statistics`. Das Datenmodell speichert Geburts- und Todesdaten sowie optionale Ehestartdaten als vollständige oder partielle Datumswerte. Eine Ehe ist über zwei Personen verknüpft; gemeinsame Kinder sind über zwei gerichtete Eltern-Kind-Beziehungen erkennbar.

## Goals / Non-Goals

**Goals:**

- Ein einzelnes, lokal öffnbares HTML ohne zusätzliche Browser-Abhängigkeit erzeugen.
- Die Statistikberechnung als testbare, exportierte Funktionen vom CLI-Einstieg trennen.
- Teil-Daten robust verarbeiten und für reproduzierbare Tests ein explizites `--as-of`-Datum erlauben.

**Non-Goals:**

- Keine Integration der Diagramme in die React-Anwendung.
- Keine Änderung oder automatische Bereinigung von YAML-Daten.
- Keine Schätzung fehlender Daten über genealogische Annahmen.

## Decisions

- **Inline-SVG statt externer Chart-Bibliothek:** Das Ergebnis bleibt offline nutzbar und benötigt keine neue Abhängigkeit. Die Diagramme werden als einfache Balken-Histogramme mit responsivem HTML/CSS gerendert.
- **Vertikale Klassenlabels:** Die x-Achsenlabels werden um 90 Grad gedreht, damit auch Histogramme mit vielen Altersklassen ohne Überlagerung lesbar bleiben.
- **Alter beim Tod beziehungsweise am Auswertungsdatum:** Für lebende Personen wird standardmäßig das aktuelle Datum verwendet; `--as-of` macht die Auswertung reproduzierbar. Fehlende Monats- oder Tageswerte werden über das bekannte Jahr ausgewertet und als ungefähr markiert.
- **Gemeinsame Kinder einer Ehe:** Ein Kind zählt nur dann zur Ehe, wenn beide Ehepartner über Eltern-Kind-Beziehungen als Eltern dieses Kindes erfasst sind. Dadurch werden Kinder aus anderen oder unbekannten Partnerschaften nicht fälschlich einer Ehe zugeordnet.
- **Wiederheirat:** Der Abstand wird vom Todesdatum des vorherigen Ehepartners bis zum Startdatum der nächsten Ehe derselben Person berechnet. Fehlt einer dieser Werte, wird der Abstand übersprungen; ein bloßer Abstand zwischen zwei Ehestarts wird nicht als Wiederheirat interpretiert.
- **CLI:** Der erste Positionsparameter ist die YAML-Datei; `--output` steuert die HTML-Datei und `--as-of` optional das Auswertungsdatum. Der Standardausgabename ist `familien-statistik.html`.

## Risks / Trade-offs

- [Teil-Daten können Alterswerte verschieben] → Jede Beobachtung mit fehlendem Monat oder Tag wird als ungefähr ausgewiesen.
- [Gemeinsame Kinder können bei unvollständigen Elternverknüpfungen unterzählt werden] → Die HTML-Erklärung benennt die verwendete Definition explizit; fehlende Daten werden nicht geraten.
- [Personenalter lebender Personen ändern sich mit dem aktuellen Datum] → Für wiederholbare Ergebnisse kann `--as-of` gesetzt werden.

## Migration Plan

Keine Migration erforderlich. Das Script wird direkt mit einer bestehenden YAML-Datei aufgerufen; die erzeugte HTML-Datei kann jederzeit neu erstellt oder entfernt werden.
