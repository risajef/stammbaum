## Context

Die bestehende Duplikatlogik vergleicht normalisierte, vollständige Vor- und Nachnamen. Sie wird in `src/graph/graph-view.ts` berechnet und von der bestehenden UI verwendet; der Build nutzt Vite und kann Root-Dateien als Rohtext in das Browser-Bundle aufnehmen.

## Goals / Non-Goals

**Goals:**

- Die Namensvarianten ohne Änderung des Stammbaum-YAML zentral im Projekt-Root pflegbar machen.
- Varianten symmetrisch und transitiv auflösen.
- Zusammengesetzte Vornamen als Tokenmengen vergleichen und fehlende zusätzliche Vornamen tolerieren.
- Die bestehende Datums- und Generationslogik sowie UI-Navigation unverändert weiterverwenden.

**Non-Goals:**

- Keine automatische Korrektur oder Normalisierung gespeicherter Personennamen.
- Keine fuzzy Suche, Lautschrift- oder allgemeine Ähnlichkeitsberechnung außerhalb der expliziten Konfiguration.
- Keine Laufzeitbearbeitung der Konfiguration in der Anwendung.

## Decisions

- **Root-YAML mit Build-Time-Import:** `duplicate-name-variants.yaml` bleibt für Menschen editierbar und wird als Rohtext in das Bundle importiert. Dadurch bleibt die statische Anwendung ohne zusätzlichen Server-Endpunkt funktionsfähig; Änderungen werden nach einem Dev-Neustart beziehungsweise neuen Build wirksam.
- **Getrennte Felder:** Vor- und Nachnamensvarianten werden getrennt konfiguriert, damit eine Schreibweise nicht versehentlich feldübergreifend matcht.
- **Token-Subset mit eindeutiger Zuordnung:** Für Vornamen wird der kürzere Tokenvektor gegen den längeren gematcht. Jeder kürzere Token muss genau einem längeren Token entsprechen; Varianten werden dabei über die transitive Gruppe aufgelöst. Dadurch matcht `Johann Heinrich` mit `Heinrich`, aber nicht zwei völlig unabhängige Vornamen.
- **Brute-Force-Paarbildung:** Die Dokumentgröße ist überschaubar; alle Personpaare werden nach dem Namensmatcher geprüft. Das hält die Regeln für Varianten und Mehrfachnamen explizit und bewahrt die stabile Dokumentreihenfolge.
- **Prioritäten bleiben datumsbasiert:** Eine konfigurierte Namensvariante senkt keine bestehende Prioritätsstufe. Sie entscheidet nur, ob das Paar die anschließende Geburtsdatenprüfung erreicht.

## Risks / Trade-offs

- [Eine kurze Vornamensangabe kann mehr Kandidaten erzeugen] → Die Regel ist ausdrücklich auf vollständige Tokenabdeckung des kürzeren Namens beschränkt; die bestehende Datums-/Generationsprüfung und manuelle Handlung bleiben erhalten.
- [Fehlerhafte Konfiguration kann den Build brechen] → Die Konfiguration wird beim Einlesen auf Objektform, getrennte Listen und nichtleere Gruppen validiert.
- [Änderungen wirken nicht in einer bereits laufenden statischen Ausgabe] → Die Dokumentation verlangt Dev-Neustart oder neuen Build nach Konfigurationsänderungen.

## Migration Plan

Keine Migration des Stammbaumformats. Die neue Root-Datei wird mit den vereinbarten Standardvarianten ausgeliefert; weitere Gruppen können dort ergänzt werden. Ein vorhandener Build wird durch erneutes Bauen aktualisiert.
