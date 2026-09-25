## Context

Siehe `proposal.md` für die Motivation und `specs/family-tree-merge/spec.md` für den Verhaltensvertrag. Der bestehende Dateiport öffnet eine einzelne YAML-Datei und speichert über denselben Browser-Fallback oder die native File System Access API. `parseFamilyTreeYaml` normalisiert und validiert bereits einzelne Dokumente; `validateFamilyTreeDocument` prüft zusätzlich Referenzen, Beziehungspaare und automatische Herkunftsbeziehungen. `App` ersetzt ein Dokument heute erst nach erfolgreichem Öffnen und setzt dabei Auswahl, Ansichtsfilter und temporären Zustand zurück.

## Goals / Non-Goals

**Goals:**

- Einen separaten Mehrdatei-Öffnenpfad ergänzen, ohne den Einzeldatei-Öffnenpfad zu verändern.
- Eine reine, testbare Dokumentfusion für bereits normalisierte `FamilyTreeDocument`-Werte bereitstellen.
- Konflikte anhand der ID und der vollständigen normalisierten Datensätze erkennen und verständlich zurückgeben.
- Die Übernahme in `App` atomar an den bestehenden Dokumentwechsel-, Dirty-State- und Fehlerworkflow anschließen.
- Die vorhandene Dokumentvalidierung und Inferenz-Synchronisierung wiederverwenden.

**Non-Goals:**

- Kein Abgleich oder Zusammenführen von Personen über Namen, Geburtsdaten oder Ähnlichkeitsheuristiken.
- Keine Bearbeitung der ausgewählten Quelldateien und keine neue persistierte Fusionsmetadatenstruktur.
- Keine Änderung des bestehenden Einzeldatei-Öffnens, normalen Speicherns oder gefilterten Exports.
- Keine neue Konfliktauflösung durch Auswahl einer bevorzugten Quelle.

## Decisions

### Separater Mehrdatei-Dateiport statt Änderung von `open()`

Der Browser-Dateiport erhält eine zusätzliche Mehrdatei-Operation, während `open()` weiterhin genau eine `OpenedFile`-Struktur liefert. Die native Dateiauswahl wird mit Mehrfachauswahl verwendet; der bestehende Upload-Fallback erhält ein Mehrfachfeld und liest alle ausgewählten YAML-Dateien ein. Beide Pfade liefern dieselbe Liste aus Dateiname und Inhalt.

Alternative: `open()` auf eine Liste umzustellen würde den bestehenden Einzeldatei-Workflow unnötig verbreitern und alle bisherigen Aufrufer ändern. Ein zweiter Portvertrag hält beide Anwendungsfälle explizit.

### Fusion als reine ID-Union mit explizitem Konfliktergebnis

Eine Domänenfunktion nimmt benannte, bereits normalisierte Quelldokumente entgegen und verarbeitet Personen sowie Beziehungen jeweils in einer `Map` nach ID. Der erste Eintrag bestimmt die Reihenfolge im Ergebnis; weitere Einträge mit identischem normalisiertem Datensatz werden übersprungen. Bei jeder Abweichung werden Entitätsart, ID, Quelldateien und die abweichenden Felder in einem strukturierten Konfliktergebnis gesammelt. Die Funktion verwendet keine Namens- oder Endpunktheuristik.

Die Feldvergleiche werden für Personen und Beziehungen explizit über alle gespeicherten fachlichen Felder durchgeführt. Dadurch zählen optionale Rohdarstellungen, die der bestehende YAML-Import bereits auf denselben Wert normalisiert, nicht als Konflikt. Unterschiedliche Beziehungs-IDs bleiben zunächst unterschiedliche Beziehungen; die anschließende Dokumentvalidierung entscheidet, ob sie als unzulässiges doppeltes Beziehungspaar den Fusionsvorgang ablehnen.

Alternative: Ein generischer Objektvergleich oder „letzte Quelle gewinnt“ würde entweder die fachliche Konfliktmeldung verschleiern oder Daten still überschreiben. Eine heuristische Zusammenführung würde den ausdrücklich ID-basierten Vertrag verletzen.

### Validierung in einer transaktionalen Pipeline

`App` liest und parst alle Quellen zunächst einzeln mit `parseFamilyTreeYaml`. Danach wird die ID-Union gebildet und mit `validateFamilyTreeDocument` geprüft. Auf dem validierten Ergebnis wird dieselbe `synchronizeInferredRelationships`-Logik wie beim bestehenden Öffnen ausgeführt; das synchronisierte Ergebnis wird nochmals validiert. Erst wenn jede Stufe erfolgreich ist, aktualisiert `App` den React-Dokumentzustand.

Die Fusionsfunktion selbst schreibt keinen Zustand und die UI verändert bis zum Erfolg weder Dokument noch Auswahl, Filter, temporäre Positionen, Dateinamen oder Dirty-State. Parse-, Validierungs-, Konflikt- und Dateizugriffsfehler werden in den bestehenden Workflow-Fehlerzustand übersetzt.

Alternative: Das aktuelle Dokument vor dem Dateilesen zu leeren würde bei abgebrochenem Dialog oder fehlerhafter Quelle einen unnötigen Datenverlust erzeugen. Eine schrittweise Übernahme einzelner Quellen könnte ein teilweise fusioniertes, nicht validiertes Dokument anzeigen.

### Erfolgreiche Fusion als neuer ungespeicherter Dokumentwechsel

Nach erfolgreicher Pipeline setzt `App` das fusionierte Dokument als aktuellen Stammbaum, verwirft Auswahl, Filter, Child-Gruppen, temporäre und erzwungene Positionen und fordert eine neue Layoutberechnung an. Es wird kein Quelldateiname als aktive Arbeitsdatei verwendet; stattdessen erhält das Ergebnis einen neutralen Fusionsnamen und den Status „Ungespeichert“, sodass die Benutzerin es bewusst als neue YAML-Datei speichert. Die bestehende `canReplaceDocument()`-Bestätigung wird vor der Dateiauswahl aufgerufen, wenn der aktuelle Stammbaum dirty ist.

Alternative: Eine Quelle als aktive Datei zu markieren würde den Eindruck erwecken, dass „Speichern“ diese Quelldatei aktualisiert, obwohl das Ergebnis aus mehreren Dateien stammt.

### Keine neue Abhängigkeit und keine Schemaänderung

Die Lösung nutzt die vorhandenen YAML-, Zod- und Domänenvalidierungsgrenzen. Die `FamilyTreeDocument`-Struktur und `schemaVersion: 1` bleiben unverändert; ein fusioniertes Ergebnis ist ein normales, erneut öffnungsfähiges YAML-Dokument.

## Risks / Trade-offs

- **[Risiko]** Mehrere große Dateien können während der Fusion temporär mehrfach im Speicher liegen. → Die Operation verarbeitet nur die vom Browser gelieferten Inhalte und erzeugt keine zusätzliche dauerhafte Kopie; die überschaubare Dateilokalität des bestehenden Client-Workflows bleibt erhalten.
- **[Risiko]** Unterschiedliche Beziehungs-IDs für dieselben Endpunkte werden erst bei der Gesamtdokumentvalidierung als ungültiges Doppel erkannt. → Die Fehlermeldung verweist auf die beteiligte Beziehung; die Fusion übernimmt niemals nur eine der beiden stillschweigend.
- **[Risiko]** Eine bestätigte Warnung vor dem Verwerfen ungespeicherter Änderungen gilt auch dann, wenn die spätere Dateiauswahl abgebrochen wird. → Der aktuelle Dokumentzustand bleibt bis zum erfolgreichen Fusionsabschluss erhalten; die Bestätigung autorisiert nur den möglichen späteren Ersatz.
- **[Risiko]** Automatisch abgeleitete Beziehungen können in getrennten Teilbaumexporten unterschiedliche sichtbare Herkunftsmetadaten besitzen. → Die bestehenden Import-/Exportregeln normalisieren solche Teilbaumbeziehungen vor der Fusion; verbleibende ID- oder Validierungskonflikte werden als Fehler behandelt.

## Migration Plan

Die Änderung ist additiv und benötigt keine Datenmigration. Nach Implementierung werden neue Dateiport-, Domänen- und App-Tests ergänzt; anschließend bleiben bestehende Einzeldatei- und Exporttests unverändert maßgeblich. Ein Rollback entfernt die neue Fusionsaktion und die reine Fusionsfunktion, ohne gespeicherte YAML-Dateien oder das Schema zurückzusetzen.

