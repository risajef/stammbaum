## MODIFIED Requirements

### Requirement: Vorfahrenansichten sind auswählbare, nicht persistierte Filter

Das System MUST die Aktionen „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“ und „Erweiterte direkte Vorfahren“ als Buttons anbieten. Die drei personenbezogenen Modi MUESSEN beim Klick die zu diesem Zeitpunkt ausgewaehlte Person als Anker verwenden. Ein erneuter Klick auf denselben Button MUSS den Filter erneut mit der dann ausgewaehlten Person berechnen. Die Buttons DÜRFEN keinen dauerhaften Auswahl-, Checked- oder Radiozustand anzeigen. Das Auswaehlen einer anderen sichtbaren Person DARF die bestehende Filterprojektion nicht veraendern; es MUSS nur den Inspektor auf die neue Person umstellen. Ohne ausgewaehlte Person MUESSEN die drei personenbezogenen Aktionen die Ansicht unveraendert lassen. „Alle Personen“ MUSS den Blutlinienmodus jederzeit zuruecksetzen, ohne andere aktive Ansichtsfilter zu veraendern. Die Modi MUESSEN mit lokaler Ansicht und Leaf-Filter kombinierbar sein; deren bestehende Schnittmengenlogik bleibt erhalten. Alle Modi MUESSEN reine View-Zustaende bleiben und duerfen weder das Dokument noch den YAML-Export veraendern.

#### Scenario: Die Filteroptionen sind ausloesende Buttons

- **GIVEN** die Ansichtsfilter werden angezeigt
- **WHEN** die Benutzerin die Blutlinienfilter betrachtet
- **THEN** sind „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“ und „Erweiterte direkte Vorfahren“ als Buttons und nicht als Radio-Selectoren vorhanden
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
- **WHEN** die Benutzerin einen personenbezogenen Vorfahrenbutton klickt
- **THEN** bleibt die vollstaendige Personenmenge sichtbar und es werden keine Beziehungen aus dem Dokument entfernt

#### Scenario: Alle Personen setzt nur den Blutlinienfilter zurueck

- **GIVEN** ein Blutlinienmodus ist aktiv und ein Leaf-Filter oder eine lokale Ansicht kann ebenfalls aktiv sein
- **WHEN** die Benutzerin „Alle Personen“ klickt
- **THEN** wird der Blutlinienfilter entfernt
- **AND** die anderen aktiven Ansichtsfilter bleiben unveraendert

#### Scenario: Filter veraendern keine gespeicherten Daten

- **GIVEN** ein Vorfahrenmodus ist aktiv und die Ansicht ist gefiltert
- **WHEN** der Stammbaum exportiert wird
- **THEN** enthaelt der Export weiterhin alle Personen und Beziehungen ohne Ansichtsmodus

### Requirement: Ansichtsfilter veraendern nicht die Grunddaten

Das System MUST alle Such- und Ansichtsfilter als reine View-Zustaende behandeln. Das vollstaendige Dokument, seine Personen, Beziehungen, IDs und exportierten YAML-Daten MUESSEN unveraendert bleiben. Neu angelegte Personen MUESSEN bis zum erfolgreichen YAML-Speichern unabhaengig von aktiven Ansichtsfiltern sichtbar bleiben; nach diesem Speichern MUESSEN sie wie alle anderen Personen den aktiven Filtern unterliegen. Die sichtbaren Personen und Beziehungen MUESSEN anschliessend mit demselben automatischen Layoutalgorithmus wie die Vollansicht angeordnet werden; eine Kante darf nur angezeigt werden, wenn beide Endpunkte sichtbar sind.

#### Scenario: Aktive Filter veraendern den exportierten Stammbaum nicht

- **GIVEN** ein Stammbaum wird mit einer beliebigen Filterkombination angezeigt
- **WHEN** die Benutzerin den Stammbaum exportiert
- **THEN** enthaelt der Export weiterhin alle Grunddaten und keine View-Einstellungen

#### Scenario: Neu angelegte Personen bleiben bis zum Speichern sichtbar

- **GIVEN** ein Ansichtsfilter blendet eine neu angelegte Person nach seiner normalen Logik aus
- **WHEN** die Benutzerin die Person im Inspektor speichert
- **THEN** wird die neue Person trotzdem sofort in der Ansicht angezeigt

#### Scenario: Nach dem YAML-Speichern werden neue Personen gefiltert

- **GIVEN** eine neu angelegte Person bleibt wegen der Speicherausnahme sichtbar
- **WHEN** die Benutzerin den Stammbaum erfolgreich als YAML speichert
- **THEN** wird die neue Person bei der nächsten Ansichtsberechnung nach den aktiven Filtern behandelt

#### Scenario: Gefilterte Personen werden mit dem normalen Layout angeordnet

- **GIVEN** eine Filterkombination laesst nur einen Teil der Personen sichtbar
- **WHEN** die Ansicht neu berechnet wird
- **THEN** liegen die sichtbaren Personen nach denselben Layer- und Familiengruppenregeln wie in einem entsprechend reduzierten Stammbaum
