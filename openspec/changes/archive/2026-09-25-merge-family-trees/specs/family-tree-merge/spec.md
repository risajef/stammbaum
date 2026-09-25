## Purpose

Diese Capability ermöglicht es, mehrere eigenständige YAML-Teilstammbäume anhand ihrer stabilen Identitäten sicher zu einem gemeinsam geöffneten Stammbaum zu vereinigen. Sie unterstützt insbesondere das Zusammenführen unabhängig exportierter Vor- und Nachkommenansichten, ohne Quelldateien oder den bisherigen Arbeitsstand bei Fehlern teilweise zu verändern.

## ADDED Requirements

### Requirement: Eine beliebige Dateiliste kann zur Fusion ausgewählt werden

Das System MUST eine eigene zugängliche Aktion „Stammbäume fusionieren“ anbieten. Die Aktion MUST die Auswahl einer beliebigen Liste von YAML-Stammbäumen erlauben; eine Auswahl mit mindestens einer Datei gilt als gültige Eingabe. Die Fusion darf nicht automatisch die aktuell geöffnete Datei als zweite Quelle voraussetzen. Wird die Dateiauswahl abgebrochen oder keine Datei ausgewählt, MUSS der Vorgang ohne Änderung des aktuellen Arbeitsstands enden.

#### Scenario: Mehrere Teilstämme werden gemeinsam ausgewählt

- **GIVEN** die Benutzerin besitzt separat exportierte YAML-Teilstammbäume für Ruth und Ernst
- **WHEN** sie „Stammbäume fusionieren“ auslöst und beide Dateien auswählt
- **THEN** werden beide Dateien als Quellen desselben Fusionsvorgangs behandelt

#### Scenario: Die Fusion kann mit mehr als zwei Dateien arbeiten

- **GIVEN** die Benutzerin wählt drei oder mehr gültige YAML-Stammbäume aus
- **WHEN** sie die Auswahl bestätigt
- **THEN** werden alle ausgewählten Dateien in einem einzigen Fusionsvorgang berücksichtigt

#### Scenario: Dateiauswahl wird abgebrochen

- **GIVEN** ein Stammbaum ist aktuell geöffnet
- **WHEN** die Benutzerin den Dateidialog ohne ausgewählte Datei abbricht
- **THEN** bleiben Dokument, Dateiname, Auswahl, Ansichtsfilter und Dirty-State unverändert

### Requirement: Die Fusion vereinigt Personen und Beziehungen ausschließlich über IDs

Das System MUST alle Personen- und Beziehungseinträge der ausgewählten, gültigen Dateien zu einer gemeinsamen Dokumentmenge vereinigen. Ein Personen- oder Beziehungseintrag mit derselben ID darf nur einmal im Ergebnis vorkommen. Ein Eintrag mit einer ID, die in den anderen Quellen nicht vorkommt, MUSS vollständig mit allen gespeicherten Feldern übernommen werden. Die Fusion DARF Einträge nicht anhand von Namen, Geburtsdaten, Endpunkten oder anderen inhaltlichen Ähnlichkeiten zusammenführen.

#### Scenario: Gemeinsame Personen werden dedupliziert

- **GIVEN** zwei ausgewählte Dateien enthalten dieselbe Person mit derselben ID und identischen normalisierten Daten
- **WHEN** die Dateien fusioniert werden
- **THEN** enthält der fusionierte Stammbaum diese Person genau einmal
- **AND** alle Personen, die nur in einer Quelle vorkommen, sind ebenfalls enthalten

#### Scenario: Gemeinsame Beziehungen werden dedupliziert

- **GIVEN** zwei ausgewählte Dateien enthalten dieselbe Beziehung mit derselben ID und identischen normalisierten Daten
- **WHEN** die Dateien fusioniert werden
- **THEN** enthält der fusionierte Stammbaum diese Beziehung genau einmal
- **AND** Beziehungen, die nur in einer Quelle vorkommen, bleiben mit ihren vollständigen Metadaten erhalten

#### Scenario: Namensgleiche Personen mit verschiedenen IDs bleiben getrennt

- **GIVEN** zwei Quellen enthalten Personen mit gleichem Vor- und Nachnamen, aber unterschiedlichen IDs
- **WHEN** die Dateien fusioniert werden
- **THEN** bleiben beide Personen als getrennte Personen im Ergebnis erhalten

### Requirement: Widersprüchliche IDs brechen die Fusion atomar ab

Das System MUST einen Konflikt melden und die Fusion abbrechen, wenn zwei Quellen unter derselben Personen- oder Beziehungs-ID unterschiedliche normalisierte Daten enthalten. Die Fehlermeldung MUSS die betroffene ID, die betroffene Entitätsart und die beteiligten Quelldateien erkennen lassen. Es darf keine bevorzugte Quelle und kein stilles Überschreiben geben.

#### Scenario: Widersprüchliche Personendaten werden abgelehnt

- **GIVEN** zwei ausgewählte Dateien enthalten dieselbe Personen-ID mit unterschiedlichen Geburtsdaten oder Namen
- **WHEN** die Fusion geprüft wird
- **THEN** wird ein Personendatenkonflikt mit ID und Quelldateien angezeigt
- **AND** der bisher geöffnete Stammbaum bleibt unverändert

#### Scenario: Widersprüchliche Beziehungsdaten werden abgelehnt

- **GIVEN** zwei ausgewählte Dateien enthalten dieselbe Beziehungs-ID mit unterschiedlichen Endpunkten, Beziehungsarten oder Metadaten
- **WHEN** die Fusion geprüft wird
- **THEN** wird ein Beziehungskonflikt mit ID und Quelldateien angezeigt
- **AND** es wird kein teilweise fusioniertes Dokument geöffnet

#### Scenario: Ein Unterschied durch optionale Rohdarstellung ist kein Scheinkonflikt

- **GIVEN** zwei Quellen stellen denselben semantischen Datensatz unterschiedlich dar, der nach dem bestehenden YAML-Import normalisiert identisch ist, etwa `1900` als Zahl und als Zeichenkette
- **WHEN** die Fusion geprüft wird
- **THEN** wird der Datensatz als identisch behandelt und einmal übernommen

### Requirement: Alle Quellen werden vor der Übernahme vollständig geprüft

Das System MUST jede ausgewählte Datei syntaktisch und fachlich vollständig validieren und anschließend auch das Vereinigungsdokument validieren. Eine ungültige YAML-Syntax, eine ungültige Dokumentstruktur, unbekannte Beziehungsreferenzen, nicht unterstützte Datums- oder Beziehungsdaten sowie ein durch die Vereinigung entstehender Dokumentkonflikt MUSS den Vorgang mit einer verständlichen Fehlermeldung abbrechen. Das aktuelle Dokument DARF erst nach erfolgreicher Prüfung aller Quellen und des vollständigen Ergebnisses ersetzt werden.

#### Scenario: Eine ungültige Quelle verhindert die gesamte Fusion

- **GIVEN** eine von mehreren ausgewählten Dateien enthält ungültige YAML-Syntax oder ungültige Stammbaumdaten
- **WHEN** die Benutzerin die Fusion startet
- **THEN** wird die betroffene Datei und der Validierungsfehler angezeigt
- **AND** der aktuelle Stammbaum bleibt vollständig unverändert

#### Scenario: Nach der Fusion offene Beziehungsreferenzen werden abgelehnt

- **GIVEN** eine ausgewählte Quelle enthält eine Beziehung, deren Personen-ID in keiner ausgewählten Quelle vorkommt
- **WHEN** das Vereinigungsdokument validiert wird
- **THEN** wird die Fusion mit einem verständlichen Referenzfehler abgelehnt
- **AND** der aktuelle Stammbaum bleibt unverändert

#### Scenario: Doppelte Beziehungen mit unterschiedlichen IDs werden nicht still vereinigt

- **GIVEN** Quellen enthalten fachlich dieselbe Beziehung mit unterschiedlichen Beziehungs-IDs
- **WHEN** die Vereinigung dadurch gegen die bestehenden Beziehungsregeln verstößt
- **THEN** wird das zusammengeführte Dokument als ungültig abgelehnt
- **AND** der aktuelle Stammbaum bleibt unverändert

### Requirement: Der aktuelle Arbeitsstammbaum wird nur nach erfolgreicher Fusion ersetzt

Das System MUST den aktuell geöffneten Stammbaum nach einer erfolgreichen Fusion schließen und das fusionierte Dokument als neuen aktuellen Stammbaum öffnen. Das Ergebnis MUSS als neuer ungespeicherter Arbeitsstand behandelt werden, weil keine der Quelldateien allein seine vollständige Repräsentation ist. Die Quelldateien DÜRFEN nicht verändert werden. Auswahl, aktive Ansichtsfilter, temporäre Positionen und sonstige flüchtige Zustände des vorherigen Dokuments MUSSEN verworfen werden.

#### Scenario: Eine erfolgreiche Fusion öffnet den Vereinigungsstammbaum

- **GIVEN** alle ausgewählten Dateien sind gültig und widerspruchsfrei
- **WHEN** die Fusion abgeschlossen wird
- **THEN** wird der bisherige Stammbaum durch das Vereinigungsdokument ersetzt
- **AND** alle eindeutigen Personen und Beziehungen aus den Quellen sind im geöffneten Ergebnis vorhanden
- **AND** der neue Arbeitsstand wird als ungespeichert angezeigt

#### Scenario: Quelldateien bleiben unverändert

- **GIVEN** die Fusion wurde erfolgreich abgeschlossen
- **WHEN** die Benutzerin eine der Quelldateien später erneut öffnet
- **THEN** enthält sie weiterhin ihren ursprünglichen Inhalt

#### Scenario: Ein Fusionsfehler verändert keinen flüchtigen Zustand

- **GIVEN** ein Stammbaum ist gefiltert, eine Person ausgewählt oder eine temporäre Position vorhanden
- **WHEN** die Fusion wegen eines Konflikts, Parsefehlers oder Validierungsfehlers abgebrochen wird
- **THEN** bleiben Dokument, Auswahl, Ansichtsfilter, temporäre Positionen und Dirty-State unverändert

### Requirement: Ungespeicherte Änderungen werden vor dem Ersetzen gewarnt

Das System MUST bei einem aktuell geöffneten Stammbaum mit ungespeicherten Änderungen vor dem Ersetzen eine verständliche Warnung anzeigen. Eine Ablehnung der Warnung MUSS die Fusion vollständig abbrechen und den aktuellen Stammbaum unverändert lassen. Bei einem bereits gespeicherten Arbeitsstand DARF keine zusätzliche Verwerfensbestätigung nur wegen des Fusionsstarts erforderlich sein.

#### Scenario: Fusion mit ungespeicherten Änderungen wird bestätigt

- **GIVEN** der aktuelle Stammbaum ist ungespeichert verändert
- **WHEN** die Benutzerin die Fusionsaktion startet und das Verwerfen bestätigt
- **THEN** darf die Dateiauswahl und anschließende Fusion fortgesetzt werden

#### Scenario: Fusion mit ungespeicherten Änderungen wird abgelehnt

- **GIVEN** der aktuelle Stammbaum ist ungespeichert verändert
- **WHEN** die Benutzerin die Fusionswarnung ablehnt
- **THEN** wird keine Quelldatei eingelesen und der aktuelle Arbeitsstand bleibt unverändert

