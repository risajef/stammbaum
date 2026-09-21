# family-statistics Specification

## Purpose

Dieses Tool liefert eine reproduzierbare, lokal öffnende HTML-Übersicht über Alters- und Heiratsmuster aus einer Stammbaum-YAML, ohne die Quelldaten zu verändern.

## Requirements

### Requirement: YAML-Datei als HTML-Statistik auswerten

Das Statistik-Tool SHALL eine YAML-Datei mit `persons` und `relationships` einlesen und eine eigenständige HTML-Datei erzeugen. Die Quelldatei MUST unverändert bleiben, und das erzeugte HTML MUST ohne weitere Laufzeit- oder Netzwerkabhängigkeiten die Diagramme anzeigen können.

#### Scenario: Statistikdatei wird erfolgreich erzeugt

- **WHEN** das Tool mit einer gültigen YAML-Datei und einem Ausgabepfad aufgerufen wird
- **THEN** wird am Ausgabepfad eine HTML-Datei mit den drei Statistikdiagrammen erstellt

#### Scenario: Eingabedatei ist ungültig

- **WHEN** die Eingabedatei fehlt oder `persons` beziehungsweise `relationships` keine Listen sind
- **THEN** beendet sich das Tool mit einer verständlichen Fehlermeldung und erzeugt keine Statistik als gültiges Ergebnis

### Requirement: Personenalter histogrammieren

Das Tool SHALL für jede Person mit auswertbarem Geburtsdatum und auswertbarem Todesdatum das Alter beim Tod berechnen und als Histogramm darstellen. Personen ohne Todesdatum MUESSEN aus dieser Auswertung ausgeschlossen werden; das gewählte Auswertungsdatum DARF nicht als Ersatz-Ende für ein unbekanntes Todesdatum verwendet werden. Teil-Datumsangaben MUST über ihre bekannten Bestandteile berücksichtigt und als Näherungen gekennzeichnet werden. Die x-Achse MUSS nur die Altersklassen bis zum höchsten tatsächlich vorhandenen Alterswert darstellen und darf nicht durch ausgeschlossene Personen oder einen künstlichen Auswertungszeitpunkt verlängert werden.

#### Scenario: Lebende und verstorbene Personen werden berücksichtigt

- **WHEN** Personen sowohl ein Todesdatum als auch kein Todesdatum haben
- **THEN** verwendet das Tool für Verstorbene das Alter beim Tod
- **AND** Personen ohne Todesdatum erscheinen nicht im Personenalter-Histogramm, auch wenn ein Auswertungsdatum angegeben ist

#### Scenario: Historische Personen ohne Todesdatum erzeugen keinen unrealistischen Ausreißer

- **GIVEN** eine Person hat ein sehr frühes Geburtsjahr, aber kein Todesdatum
- **WHEN** die Statistik mit einem späteren Auswertungsdatum erzeugt wird
- **THEN** wird diese Person nicht als mehrere hundert Jahre alt gezählt
- **AND** die x-Achse endet bei der höchsten Altersklasse der auswertbaren Todesalter

#### Scenario: Geburtsdatum fehlt

- **WHEN** eine Person kein gültiges Geburtsdatum besitzt
- **THEN** wird diese Person aus dem Personenalter-Histogramm ausgeschlossen, ohne die übrigen Auswertungen abzubrechen

### Requirement: Heiratsalter nach Kinderzahl auswerten

Das Tool SHALL das Heiratsalter beider Ehepartner für jede Ehe mit gültigem Ehestart und Geburtsdatum berechnen. Die Auswertung MUST die Beobachtungen nach der Anzahl gemeinsamer, in den Eltern-Kind-Beziehungen beider Ehepartner verknüpfter Kinder gruppieren und als Histogramm darstellen.

#### Scenario: Ehe mit bekannten Daten und Kindern

- **WHEN** eine Ehe ein Startdatum, beide Geburtsdaten und gemeinsame Kinder besitzt
- **THEN** erscheinen beide Heiratsalter im Histogramm unter der gemeinsamen Kinderzahl

#### Scenario: Unvollständige Heiratsdaten

- **WHEN** das Ehestartdatum oder das Geburtsdatum eines Ehepartners fehlt beziehungsweise ungültig ist
- **THEN** wird nur die nicht auswertbare Beobachtung ausgelassen und das Diagramm bleibt für andere gültige Beobachtungen verfügbar

### Requirement: Zeit bis zur Wiederheirat auswerten

Das Tool SHALL für jede Person mit einer vorherigen Ehe, einem bekannten Todesdatum des vorherigen Ehepartners und einer folgenden datierten Eheschließung den zeitlichen Abstand zwischen dem Tod des vorherigen Ehepartners und dem Beginn der folgenden Ehe berechnen und als Histogramm darstellen. Teil-Datumsangaben MUST als Näherungen gekennzeichnet werden.

#### Scenario: Vorheriger Ehepartner ist verstorben und Wiederheirat ist datiert

- **WHEN** eine Person eine vorherige Ehe mit einem verstorbenen Ehepartner und eine folgende Eheschließung mit Startdatum besitzt
- **THEN** wird der Zeitraum vom Todesdatum des vorherigen Ehepartners bis zum Startdatum der folgenden Ehe im Histogramm dargestellt

#### Scenario: Todesdatum des vorherigen Ehepartners fehlt

- **WHEN** die vorherige Ehe, der Tod des vorherigen Ehepartners oder das Startdatum der folgenden Ehe nicht auswertbar ist
- **THEN** erzeugt dieses Ehepaar keinen Wiederheirats-Abstand und verhindert nicht die Erzeugung der übrigen Diagramme

### Requirement: Diagrammbeschriftungen lesbar darstellen

Die erzeugte HTML-Datei SHALL die Beschriftungen der Histogramm-x-Achsen so darstellen, dass benachbarte Klassenlabels bei vielen Klassen nicht horizontal überlagert werden.

#### Scenario: Histogramm enthält viele Altersklassen

- **WHEN** ein Histogramm mehrere benachbarte Klassen auf der x-Achse enthält
- **THEN** werden die Klassenlabels vertikal oder in einer vergleichbar platzsparenden Ausrichtung dargestellt und bleiben lesbar
