## MODIFIED Requirements

### Requirement: Kombinierte direkte Vor- und Nachfahrenfilter

Das System MUST einen Filter „Direkte Vor und Nachfahren“ anbieten. Er MUSS die Vereinigung der bestehenden Filter „Direkte Vorfahren“ und „Nachkommen“ mit demselben Anker bilden: Alle direkten Vorfahren des Ankers samt den im direkten Vorfahrenfilter eingeschlossenen Partnern sowie alle direkten Nachkommen des Ankers und deren direkte Partner werden angezeigt. Der direkte Partner des Ankers MUSS ebenfalls angezeigt werden. Familienlinien, die ausschliesslich über einen dieser Nachkommenpartner oder den Ankerpartner erreichbar sind, MUESSEN in diesem direkten kombinierten Filter ausgeschlossen bleiben, sofern sie nicht durch eine andere aktive Filterregel sichtbar werden. Die resultierende sichtbare Teilmenge MUSS automatisch mit dem bestehenden Layoutalgorithmus angeordnet werden; ein eigener Sanduhr-Layoutmodus ist nicht erforderlich.

#### Scenario: Direkte Vor- und Nachfahren zeigen beide Richtungen entlang direkter Linien

- **GIVEN** ein Anker hat Eltern, Grosseltern, Kinder und Enkel sowie einen Partner eines direkten Vorfahren
- **WHEN** der Filter „Direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden der Anker, sein direkter Partner, alle direkten Vorfahren, deren eingeschlossene Partner, alle direkten Nachkommen, deren direkte Partner und die Beziehungen zwischen sichtbaren Personen angezeigt
- **AND** die sichtbare Teilmenge wird mit dem bestehenden Layoutalgorithmus angeordnet

#### Scenario: Direkte Nachkommenpartner bleiben im einfachen kombinierten Filter verborgen

- **GIVEN** ein direkter Nachkomme des Ankers hat einen Partner und ein weiteres Kind, das ausschliesslich über diesen Partner erreichbar ist
- **WHEN** der Filter „Direkte Vor und Nachfahren“ angewendet wird
- **THEN** bleibt der Partner als direkter Nachkommenpartner sichtbar
- **AND** das ausschliesslich über den Partner erreichbare Kind bleibt in dieser Ansicht unsichtbar

### Requirement: Eine Nachkommenansicht kann gefiltert werden

Das System MUST eine Ansicht „Nachkommen“ anbieten, die den ausgewaehlten Anker und alle Personen enthaelt, die ueber beliebig viele gerichtete parent-child-Beziehungen abwaerts vom Anker erreichbar sind. Die Ansicht MUSS den Partner des Ankers sowie die direkten Partner aller angezeigten Nachkommen enthalten. Sie MUSS Eltern, Kinder und alle sonst ausschliesslich ueber einen Partner erreichbaren Personen ausschliessen. Die Auswertung MUSS fuer jede Generation gelten und darf nicht auf eine feste Tiefe begrenzt sein.

#### Scenario: Kinder und Enkel des Ankers bleiben sichtbar

- **GIVEN** der Anker hat ein Kind, ein Enkelkind und eine getrennte Person
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** werden der Anker, das Kind und das Enkelkind angezeigt
- **AND** die getrennte Person bleibt unsichtbar

#### Scenario: Partner der Nachkommen werden ausgeschlossen

- **GIVEN** der Anker hat einen Partner und ein Nachkomme hat einen Partner, der eigene Eltern und ein weiteres Kind aus einer anderen Beziehung hat
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** werden der Anker, sein Partner, der Nachkomme und dessen Partner angezeigt
- **AND** die Eltern des Nachkommenpartners und das weitere Kind bleiben unsichtbar

#### Scenario: Eine lange Nachkommenlinie wird nicht auf eine feste Generation begrenzt

- **GIVEN** der Anker hat eine Nachkommenlinie über mehr als zehn Generationen
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** bleiben alle über parent-child-Beziehungen erreichbaren Nachkommen sichtbar

### Requirement: Eine erweiterte Nachkommenansicht kann gefiltert werden

Das System MUST eine Ansicht „Erweiterte Nachkommen“ anbieten. Sie MUSS den Anker und alle Nachkommen des Ankers sowie den direkten Partner des Ankers und alle direkten Partner jedes tatsächlichen Nachkommens enthalten. Zusätzlich MUSS sie jedes Kind jedes Partners eines tatsächlichen Nachkommens enthalten, auch wenn dieses Kind nicht über den Anker abstammt. Der Partner des Ankers MUSS als einzelner Knoten sichtbar sein; seine eigene Familienlinie DARF nicht allein durch diese Ansicht eingeschlossen werden. Die Erweiterung DARF keine Partner der neu hinzugekommenen Kinder, keine Eltern der Partner und keine weiteren Personen aus einer Partnerkette rekursiv einbeziehen.

#### Scenario: Alle Partner der Nachkommen und deren Kinder bleiben sichtbar

- **GIVEN** ein Nachkomme hat zwei Partner und diese Partner haben jeweils Kinder
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** werden der Anker, der Nachkomme, beide Partner und alle Kinder dieser Partner angezeigt

#### Scenario: Der Partner des Ankers bleibt ausgeschlossen

- **GIVEN** der Anker hat einen Partner und dieser Partner hat ein eigenes Kind sowie der Anker ein Kind
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** werden der Anker, sein Partner und das Kind des Ankers angezeigt
- **AND** das eigene Kind des Ankerpartners bleibt unsichtbar

#### Scenario: Die Erweiterung folgt keiner Partnerkette

- **GIVEN** ein Partner eines Nachkommens hat ein Kind mit einer weiteren Person und diese weitere Person hat eigene Eltern
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** wird das Kind des eingeschlossenen Partners angezeigt
- **AND** die weitere Person, ihre Eltern und der Partner des Kindes werden nicht allein deshalb angezeigt
