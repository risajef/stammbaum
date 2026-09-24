## MODIFIED Requirements

### Requirement: Ansichtsfilter verändern nicht die Grunddaten

Das System MUST alle Such- und Ansichtsfilter als reine View-Zustaende behandeln. Das vollstaendige Dokument, seine Personen, Beziehungen und IDs MUESSEN unveraendert bleiben. Der normale Vollbaum-YAML-Export MUSS weiterhin alle Grunddaten ohne View-Einstellungen enthalten; der separate Export der aktuell sichtbaren Filteransicht ist in der Capability `filtered-family-tree-export` definiert. Neu angelegte Personen MUESSEN bis zum erfolgreichen YAML-Speichern unabhaengig von aktiven Ansichtsfiltern sichtbar bleiben; nach diesem Speichern MUESSEN sie wie alle anderen Personen den aktiven Filtern unterliegen. Die sichtbaren Personen und Beziehungen MUESSEN anschliessend mit demselben automatischen Layoutalgorithmus wie die Vollansicht angeordnet werden; eine Kante darf nur angezeigt werden, wenn beide Endpunkte sichtbar sind.

#### Scenario: Aktive Filter veraendern den normalen Vollbaumexport nicht

- **GIVEN** ein Stammbaum wird mit einer beliebigen Filterkombination angezeigt
- **WHEN** die Benutzerin den normalen Stammbaum mit „Speichern“ exportiert
- **THEN** enthaelt der normale Export weiterhin alle Grunddaten und keine View-Einstellungen

#### Scenario: Neu angelegte Personen bleiben bis zum Speichern sichtbar

- **GIVEN** ein Ansichtsfilter blendet eine neu angelegte Person nach seiner normalen Logik aus
- **WHEN** die Benutzerin die Person im Inspektor speichert
- **THEN** wird die neue Person trotzdem sofort in der Ansicht angezeigt

#### Scenario: Nach dem YAML-Speichern werden neue Personen gefiltert

- **GIVEN** eine neu angelegte Person bleibt wegen der Speicherausnahme sichtbar
- **WHEN** die Benutzerin den Stammbaum erfolgreich als YAML speichert
- **THEN** wird die neue Person bei der naechsten Ansichtsberechnung nach den aktiven Filtern behandelt

#### Scenario: Gefilterte Personen werden mit dem normalen Layout angeordnet

- **GIVEN** eine Filterkombination laesst nur einen Teil der Personen sichtbar
- **WHEN** die Ansicht neu berechnet wird
- **THEN** liegen die sichtbaren Personen nach denselben Layer- und Familiengruppenregeln wie in einem entsprechend reduzierten Stammbaum

### Requirement: Vorfahrenansichten sind auswählbare, nicht persistierte Filter

Das System MUST die Aktionen „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“, „Erweiterte direkte Vorfahren“, „Nachkommen“, „Erweiterte Nachkommen“, „Direkte Vor und Nachfahren“ und „Erweiterte direkte Vor und Nachfahren“ als Buttons anbieten. Die sieben personenbezogenen Modi MUESSEN beim Klick die zu diesem Zeitpunkt ausgewaehlte Person als Anker verwenden. Ein erneuter Klick auf denselben Button MUSS den Filter erneut mit der dann ausgewaehlten Person berechnen. Die Buttons DÜRFEN keinen dauerhaften Auswahl-, Checked- oder Radiozustand anzeigen. Das Auswaehlen einer anderen sichtbaren Person DARF die bestehende Filterprojektion nicht veraendern; es MUSS nur den Inspektor auf die neue Person umstellen. Ohne ausgewaehlte Person MUESSEN die sieben personenbezogenen Aktionen die Ansicht unveraendert lassen. „Alle Personen“ MUSS den Blutlinienmodus jederzeit zuruecksetzen, ohne andere aktive Ansichtsfilter zu veraendern. Die Modi MUESSEN mit lokaler Ansicht und Leaf-Filter kombinierbar sein; deren bestehende Schnittmengenlogik bleibt erhalten. Alle Modi MUESSEN reine View-Zustaende bleiben und duerfen weder das Dokument noch den normalen Vollbaum-YAML-Export veraendern.

#### Scenario: Die Filteroptionen sind ausloesende Buttons

- **GIVEN** die Ansichtsfilter werden angezeigt
- **WHEN** die Benutzerin die Blutlinien- und Nachkommenfilter betrachtet
- **THEN** sind „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“, „Erweiterte direkte Vorfahren“, „Nachkommen“, „Erweiterte Nachkommen“, „Direkte Vor und Nachfahren“ und „Erweiterte direkte Vor und Nachfahren“ als Buttons und nicht als Radio-Selectoren vorhanden
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
- **WHEN** die Benutzerin den Stammbaum mit „Speichern“ sichert
- **THEN** enthaelt der normale Export weiterhin alle Personen und Beziehungen ohne Ansichtsmodus

### Requirement: Kombinierte direkte Vor- und Nachfahrenfilter

Das System MUST einen Filter „Direkte Vor und Nachfahren“ anbieten. Er MUSS die Vereinigung der bestehenden Filter „Direkte Vorfahren“ und „Nachkommen“ mit demselben Anker bilden: Alle direkten Vorfahren des Ankers samt den im direkten Vorfahrenfilter eingeschlossenen Partnern sowie alle direkten Nachkommen des Ankers werden angezeigt. Partner von Nachkommen und ihre Familienlinien MUESSEN in diesem direkten kombinierten Filter ausgeschlossen bleiben, sofern sie nicht durch eine andere aktive Filterregel sichtbar werden. Die resultierende sichtbare Teilmenge MUSS automatisch mit dem bestehenden Layoutalgorithmus angeordnet werden; ein eigener Sanduhr-Layoutmodus ist nicht erforderlich.

#### Scenario: Direkte Vor- und Nachfahren zeigen beide Richtungen entlang direkter Linien

- **GIVEN** ein Anker hat Eltern, Grosseltern, Kinder und Enkel sowie einen Partner eines direkten Vorfahren
- **WHEN** der Filter „Direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden der Anker, alle direkten Vorfahren, deren eingeschlossene Partner, alle direkten Nachkommen und die Beziehungen zwischen sichtbaren Personen angezeigt
- **AND** die sichtbare Teilmenge wird mit dem bestehenden Layoutalgorithmus angeordnet

#### Scenario: Direkte Nachkommenpartner bleiben im einfachen kombinierten Filter verborgen

- **GIVEN** ein direkter Nachkomme des Ankers hat einen Partner und ein gemeinsames Kind
- **WHEN** der Filter „Direkte Vor und Nachfahren“ angewendet wird
- **THEN** bleiben der Partner und dessen Kind in dieser Ansicht unsichtbar

### Requirement: Erweiterter kombinierter Vor- und Nachfahrenfilter

Das System MUST einen Filter „Erweiterte direkte Vor und Nachfahren“ anbieten. Er MUSS die Vereinigung der bestehenden Filter „Erweiterte direkte Vorfahren“ und „Erweiterte Nachkommen“ mit demselben Anker bilden. Oberhalb des Ankers MUESSEN dadurch Geschwister direkter Vorfahren und deren Partner eingeschlossen werden. Unterhalb des Ankers MUESSEN Partner von Nachkommen sowie deren gemeinsame Kinder eingeschlossen werden. Der Filter DARF keiner Partnerkette folgen: Eltern, Kinder oder weitere Familienlinien eines nur als Partner eingeschlossenen Menschen MUESSEN ausgeschlossen bleiben, sofern sie nicht durch eine ausdrücklich beschriebene Einschlussregel erreicht werden. Die resultierende sichtbare Teilmenge MUSS automatisch mit dem bestehenden Layoutalgorithmus angeordnet werden; ein eigener Sanduhr-Layoutmodus ist nicht erforderlich.

#### Scenario: Der erweiterte kombinierte Filter zeigt beide Seiten

- **GIVEN** direkte Vorfahren haben Geschwister mit Partnern und direkte Nachkommen haben Partner mit gemeinsamen Kindern
- **WHEN** der Filter „Erweiterte direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden die direkte Vorfahrenlinie, die erweiterten Seitenlinien oben, die direkte Nachkommenlinie, die Nachkommenpartner und deren Kinder unten angezeigt
- **AND** die sichtbare Teilmenge wird mit dem bestehenden Layoutalgorithmus angeordnet

#### Scenario: Der erweiterte kombinierte Filter folgt keiner Partnerkette

- **GIVEN** ein eingeschlossener Nachkommenpartner hat eigene Eltern und ein eingeschlossenes Geschwister eines Vorfahrenpartners hat weitere Kinder
- **WHEN** der Filter „Erweiterte direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden diese zusätzlichen Familienlinien nicht allein wegen der eingeschlossenen Partner angezeigt

#### Scenario: Die kombinierten Modi übernehmen den ausgewählten Anker erst beim Klick

- **GIVEN** Person A ist ausgewaehlt und ein kombinierter Modus wurde angewendet
- **WHEN** Person B ausgewaehlt wird, ohne den Filterbutton erneut zu klicken
- **THEN** bleibt die sichtbare gefilterte Projektion um Person A unveraendert
- **AND** ein erneuter Klick auf denselben kombinierten Button berechnet den Filter mit Person B als Anker und ordnet die neue Projektion mit dem bestehenden Layoutalgorithmus an
