## MODIFIED Requirements

### Requirement: Vorfahrenansichten sind auswählbare, nicht persistierte Filter

Das System MUST die Aktionen „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“, „Erweiterte direkte Vorfahren“, „Nachkommen“ und „Erweiterte Nachkommen“ als Buttons anbieten. Die fünf personenbezogenen Modi MUESSEN beim Klick die zu diesem Zeitpunkt ausgewaehlte Person als Anker verwenden. Ein erneuter Klick auf denselben Button MUSS den Filter erneut mit der dann ausgewaehlten Person berechnen. Die Buttons DÜRFEN keinen dauerhaften Auswahl-, Checked- oder Radiozustand anzeigen. Das Auswaehlen einer anderen sichtbaren Person DARF die bestehende Filterprojektion nicht veraendern; es MUSS nur den Inspektor auf die neue Person umstellen. Ohne ausgewaehlte Person MUESSEN die fünf personenbezogenen Aktionen die Ansicht unveraendert lassen. „Alle Personen“ MUSS den Blutlinienmodus jederzeit zuruecksetzen, ohne andere aktive Ansichtsfilter zu veraendern. Die Modi MUESSEN mit lokaler Ansicht und Leaf-Filter kombinierbar sein; deren bestehende Schnittmengenlogik bleibt erhalten. Alle Modi MUESSEN reine View-Zustaende bleiben und duerfen weder das Dokument noch den YAML-Export veraendern.

#### Scenario: Die Filteroptionen sind ausloesende Buttons

- **GIVEN** die Ansichtsfilter werden angezeigt
- **WHEN** die Benutzerin die Blutlinien- und Nachkommenfilter betrachtet
- **THEN** sind „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“, „Erweiterte direkte Vorfahren“, „Nachkommen“ und „Erweiterte Nachkommen“ als Buttons und nicht als Radio-Selectoren vorhanden
- **AND** kein Button zeigt einen dauerhaften Checked- oder Aktivzustand an

#### Scenario: Ein Blutlinienbutton filtert die aktuell ausgewaehlte Person

- **GIVEN** Person A ist ausgewaehlt und mehrere Personen sind im Stammbaum sichtbar
- **WHEN** die Benutzerin „Nur Blutsverwandte“ klickt
- **THEN** zeigt die Ansicht nur die Blutsverwandten von Person A nach der bestehenden Blutlinienlogik

#### Scenario: Ein Personenwechsel wendet den bestehenden Filter nicht erneut an

- **GIVEN** Person A ist ausgewaehlt und „Nur Blutsverwandte“ wurde fuer Person A angewendet
- **WHEN** die Benutzerin eine andere sichtbare Person B auswaehlt
- **THEN** bleibt die sichtbare Graphprojektion unveraendert
- **AND** der Inspektor zeigt Person B an

#### Scenario: Ein erneuter Klick uebernimmt die neue Person als Anker

- **GIVEN** die Ansicht zeigt weiterhin den fuer Person A angewendeten Blutlinienfilter und Person B ist ausgewaehlt
- **WHEN** die Benutzerin erneut „Nur Blutsverwandte“ klickt
- **THEN** wird der Filter mit Person B als Anker neu berechnet

#### Scenario: Die Modi ersetzen sich erst durch einen neuen Buttonklick

- **GIVEN** „Nur Blutsverwandte“ wurde fuer eine ausgewaehlte Person angewendet
- **WHEN** die Benutzerin „Direkte Vorfahren“ klickt
- **THEN** wird nur „Direkte Vorfahren“ als neuer Blutlinienmodus angewendet
- **AND** der vorherige Blutlinienmodus wird ersetzt

#### Scenario: Kein Anker laesst die Vollansicht unveraendert

- **GIVEN** keine Person ist ausgewaehlt
- **WHEN** die Benutzerin einen personenbezogenen Vorfahren- oder Nachkommenbutton klickt
- **THEN** bleibt die vollstaendige Personenmenge sichtbar und es werden keine Beziehungen aus dem Dokument entfernt

#### Scenario: Alle Personen setzt nur den Blutlinienfilter zurueck

- **GIVEN** ein Blutlinien- oder Nachkommenmodus ist aktiv und ein Leaf-Filter oder eine lokale Ansicht kann ebenfalls aktiv sein
- **WHEN** die Benutzerin „Alle Personen“ klickt
- **THEN** wird der Blutlinien- und Nachkommenfilter entfernt
- **AND** die anderen aktiven Ansichtsfilter bleiben unveraendert

#### Scenario: Der Nachkommenbutton übernimmt die aktuelle Person

- **GIVEN** Person A ist ausgewaehlt und mehrere Personen sind im Stammbaum sichtbar
- **WHEN** die Benutzerin „Nachkommen“ klickt
- **THEN** zeigt die Ansicht die Nachkommenansicht mit Person A als Anker
- **AND** ein späterer Wechsel zu Person B verändert die sichtbare Graphprojektion nicht

#### Scenario: Der erweiterte Nachkommenbutton kann erneut angewendet werden

- **GIVEN** die erweiterte Nachkommenansicht wurde für Person A angewendet und Person B ist danach ausgewählt
- **WHEN** die Benutzerin erneut „Erweiterte Nachkommen“ klickt
- **THEN** wird die erweiterte Nachkommenansicht mit Person B als neuem Anker berechnet

#### Scenario: Filter veraendern keine gespeicherten Daten

- **GIVEN** ein Vorfahren- oder Nachkommenmodus ist aktiv und die Ansicht ist gefiltert
- **WHEN** der Stammbaum exportiert wird
- **THEN** enthaelt der Export weiterhin alle Personen und Beziehungen ohne Ansichtsmodus

## ADDED Requirements

### Requirement: Eine Nachkommenansicht kann gefiltert werden

Das System MUST eine Ansicht „Nachkommen“ anbieten, die den ausgewaehlten Anker und alle Personen enthaelt, die ueber beliebig viele gerichtete parent-child-Beziehungen abwaerts vom Anker erreichbar sind. Die Ansicht MUSS den Partner des Ankers sowie Partner von Nachkommen und alle ausschliesslich ueber Partner erreichbaren Personen ausschliessen. Die Auswertung MUSS fuer jede Generation gelten und darf nicht auf eine feste Tiefe begrenzt sein.

#### Scenario: Kinder und Enkel des Ankers bleiben sichtbar

- **GIVEN** der Anker hat ein Kind, ein Enkelkind und eine getrennte Person
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** werden der Anker, das Kind und das Enkelkind angezeigt
- **AND** die getrennte Person bleibt unsichtbar

#### Scenario: Partner der Nachkommen werden ausgeschlossen

- **GIVEN** ein Nachkomme hat einen Partner, der eigene Eltern und ein weiteres Kind aus einer anderen Beziehung hat
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** bleibt der Nachkomme sichtbar
- **AND** der Partner, dessen Eltern und das weitere Kind bleiben unsichtbar

#### Scenario: Eine lange Nachkommenlinie wird nicht auf eine feste Generation begrenzt

- **GIVEN** der Anker hat eine Nachkommenlinie über mehr als zehn Generationen
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** bleiben alle über parent-child-Beziehungen erreichbaren Nachkommen sichtbar

### Requirement: Eine erweiterte Nachkommenansicht kann gefiltert werden

Das System MUST eine Ansicht „Erweiterte Nachkommen“ anbieten. Sie MUSS den Anker und alle Nachkommen des Ankers sowie alle direkten Partner jedes tatsächlichen Nachkommens enthalten. Zusätzlich MUSS sie jedes Kind jedes so eingeschlossenen Partners enthalten, auch wenn dieses Kind nicht über den Anker abstammt. Der Partner des Ankers selbst DARF nicht allein durch diese Ansicht eingeschlossen werden. Die Erweiterung DARF keine Partner der neu hinzugekommenen Kinder, keine Eltern der Partner und keine weiteren Personen aus einer Partnerkette rekursiv einbeziehen.

#### Scenario: Alle Partner der Nachkommen und deren Kinder bleiben sichtbar

- **GIVEN** ein Nachkomme hat zwei Partner und diese Partner haben jeweils Kinder
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** werden der Anker, der Nachkomme, beide Partner und alle Kinder dieser Partner angezeigt

#### Scenario: Der Partner des Ankers bleibt ausgeschlossen

- **GIVEN** der Anker hat einen Partner und ein Kind
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** werden der Anker und das Kind angezeigt
- **AND** der Partner des Ankers bleibt unsichtbar

#### Scenario: Die Erweiterung folgt keiner Partnerkette

- **GIVEN** ein Partner eines Nachkommens hat ein Kind mit einer weiteren Person und diese weitere Person hat eigene Eltern
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** wird das Kind des eingeschlossenen Partners angezeigt
- **AND** die weitere Person, ihre Eltern und der Partner des Kindes werden nicht allein deshalb angezeigt
