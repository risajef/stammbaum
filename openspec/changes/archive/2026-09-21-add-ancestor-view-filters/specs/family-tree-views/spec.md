## ADDED Requirements

### Requirement: Eine direkte Vorfahrenansicht kann gefiltert werden

Das System MUST neben der bestehenden Blutsverwandtschaftsansicht eine Ansicht „Direkte Vorfahren“ anbieten. Wenn eine Person als Anker ausgewaehlt ist, MUSS die Ansicht den Anker, alle direkten Vorfahren ueber beliebig viele Generationen und alle Partner dieser direkten Vorfahren enthalten. Partner MUESSEN ueber Ehebeziehungen in beide Richtungen ermittelt werden. Andere Kinder oder Geschwister der direkten Vorfahren sowie die Familienlinien ihrer Partner MUESSEN ausgeschlossen bleiben, sofern sie nicht durch eine andere Einschlussregel sichtbar werden.

#### Scenario: Direkte Vorfahren und ihre Partner bleiben sichtbar

- **GIVEN** der Anker hat Eltern, Grosseltern und ein Elternteil hat einen Partner
- **WHEN** die Ansicht „Direkte Vorfahren“ aktiviert wird
- **THEN** werden der Anker, die Eltern, die Grosseltern und der Partner des Elternteils angezeigt

#### Scenario: Seitenlinien der Vorfahren bleiben ausgeschlossen

- **GIVEN** ein direkter Vorfahr hat ein Geschwister, dessen Partner und dessen Kind
- **WHEN** die Ansicht „Direkte Vorfahren“ aktiviert wird
- **THEN** bleiben das Geschwister, dessen Partner und dessen Kind unsichtbar

#### Scenario: Eine lange Vorfahrenlinie wird nicht auf eine feste Generation begrenzt

- **GIVEN** der Anker hat eine direkte Vorfahrenlinie ueber mehr als zehn Generationen
- **WHEN** die Ansicht „Direkte Vorfahren“ aktiviert wird
- **THEN** bleiben alle erreichbaren direkten Vorfahren und ihre Partner sichtbar

### Requirement: Eine erweiterte direkte Vorfahrenansicht kann gefiltert werden

Das System MUST eine Ansicht „Erweiterte direkte Vorfahren“ anbieten. Sie MUSS die gesamte direkte Vorfahrenansicht sowie alle Geschwister jedes direkten Vorfahren und deren Partner enthalten. Kinder der Geschwister direkter Vorfahren und alle ausschliesslich ueber diese Kinder erreichbaren Nachkommen MUESSEN ausgeschlossen bleiben. Ein Partner darf nur als einzelne eingeschlossene Person hinzukommen; seine eigene Familienlinie darf nicht rekursiv erweitert werden.

#### Scenario: Geschwister direkter Vorfahren und ihre Partner bleiben sichtbar

- **GIVEN** ein direkter Vorfahr hat ein Geschwister mit einem Partner
- **WHEN** die Ansicht „Erweiterte direkte Vorfahren“ aktiviert wird
- **THEN** werden der direkte Vorfahr, das Geschwister und der Partner des Geschwisters angezeigt

#### Scenario: Kinder der Geschwister bleiben ausgeschlossen

- **GIVEN** ein Geschwister eines direkten Vorfahren hat ein Kind, einen Enkel und einen Partner des Kindes
- **WHEN** die Ansicht „Erweiterte direkte Vorfahren“ aktiviert wird
- **THEN** bleiben das Kind, der Enkel und der Partner des Kindes unsichtbar

#### Scenario: Die Erweiterung folgt nicht der Partnerfamilie

- **GIVEN** ein eingeschlossenes Geschwister hat einen Partner mit eigenen Eltern und Kindern
- **WHEN** die Ansicht „Erweiterte direkte Vorfahren“ aktiviert wird
- **THEN** wird der Partner des Geschwisters angezeigt, aber dessen Eltern und Kinder werden nicht allein deshalb angezeigt

### Requirement: Vorfahrenansichten sind auswählbare, nicht persistierte Filter

Das System MUST die Modi „Nur Blutsverwandte“, „Direkte Vorfahren“ und „Erweiterte direkte Vorfahren“ als alternative Ansichtsmodi anbieten. Es darf höchstens ein dieser drei Modi gleichzeitig aktiv sein. Ohne ausgewählte Ankerperson MUSS ein Vorfahrenmodus keinen Teilgraphen berechnen und die vollständige Personenmenge sichtbar lassen. Die Modi MUESSEN mit lokaler Ansicht und Leaf-Filter kombinierbar sein; deren bestehende Schnittmengenlogik bleibt erhalten. Alle Modi MUESSEN reine View-Zustaende bleiben und duerfen weder das Dokument noch den YAML-Export veraendern.

#### Scenario: Die Modi ersetzen sich gegenseitig

- **GIVEN** „Nur Blutsverwandte“ ist aktiv
- **WHEN** die Benutzerin „Direkte Vorfahren“ aktiviert
- **THEN** wird nur „Direkte Vorfahren“ als Blutlinienmodus angewendet und „Nur Blutsverwandte“ deaktiviert

#### Scenario: Kein Anker laesst die Vollansicht unveraendert

- **GIVEN** keine Person ist ausgewaehlt
- **WHEN** ein Vorfahrenmodus aktiviert wird
- **THEN** bleibt die vollstaendige Personenmenge sichtbar und es werden keine Beziehungen aus dem Dokument entfernt

#### Scenario: Filter veraendern keine gespeicherten Daten

- **GIVEN** ein Vorfahrenmodus ist aktiv und die Ansicht ist gefiltert
- **WHEN** der Stammbaum exportiert wird
- **THEN** enthaelt der Export weiterhin alle Personen und Beziehungen ohne Ansichtsmodus
