## ADDED Requirements

### Requirement: Gemeinsame Kinder können in der Arbeitsfläche eingeklappt werden

Das System MUST bei einer ausgewählten Ehebeziehung die eindeutige Schnittmenge der direkten Kinder beider Ehepartner ermitteln. Eine Eltern-Kind-Beziehung zählt unabhängig davon, ob sie explizit oder automatisch abgeleitet ist. Sind mindestens zwei gemeinsame Kinder vorhanden, MUSS die Arbeitsfläche diese Kinder markieren und im Beziehungsinspektor eine Aktion zum gemeinsamen Einklappen anbieten. Sind weniger als zwei gemeinsame Kinder vorhanden, DARF keine Einklappaktion angeboten werden.

#### Scenario: Ehe mit mindestens zwei gemeinsamen Kindern bietet Einklappen an

- **GIVEN** eine Ehebeziehung hat mindestens zwei eindeutige direkte Kinder, die mit beiden Ehepartnern verbunden sind
- **WHEN** die Benutzerin die Ehebeziehung auswählt
- **THEN** werden alle gemeinsamen Kinder in der Arbeitsfläche markiert und eine Aktion zum Einklappen mit ihrer Anzahl angezeigt

#### Scenario: Automatisch abgeleitete Elternschaft zählt als gemeinsame Elternschaft

- **GIVEN** ein Kind besitzt eine explizite Eltern-Kind-Beziehung zu einem Ehepartner und eine automatisch abgeleitete Eltern-Kind-Beziehung zum anderen Ehepartner
- **WHEN** die Benutzerin die Ehebeziehung auswählt
- **THEN** wird das Kind als gemeinsames Kind für die Einklappaktion berücksichtigt

#### Scenario: Einseitig verbundene Kinder werden nicht gruppiert

- **GIVEN** ein Kind besitzt nur zu einem der beiden Ehepartner eine Eltern-Kind-Beziehung
- **WHEN** die Benutzerin die Ehebeziehung auswählt
- **THEN** wird dieses Kind nicht als gemeinsames Kind markiert und nicht in die Einklappgruppe aufgenommen

#### Scenario: Zu wenige gemeinsame Kinder deaktivieren die Aktion

- **GIVEN** eine Ehebeziehung hat kein oder genau ein eindeutiges gemeinsames direktes Kind
- **WHEN** die Benutzerin die Ehebeziehung auswählt
- **THEN** werden keine Kindergruppe und keine Einklappaktion angeboten

### Requirement: Eine Kindergruppe ersetzt die Kinder nur visuell

Das System MUST beim Einklappen alle ausgewählten gemeinsamen Kinder in der aktuellen Arbeitsfläche durch genau einen virtuellen Knoten mit der Beschriftung `<Anzahl> Kinder` ersetzen. Für jede Beziehung, deren genau ein Endpunkt zu einem gruppierten Kind gehört, MUSS der entsprechende Endpunkt auf den virtuellen Knoten zeigen; Richtung, Beziehungstyp und eigene Auswahlbarkeit der ursprünglichen Beziehung MUESSEN erhalten bleiben. Beziehungen, deren beide Endpunkte zu gruppierten Kindern gehören, MUESSEN nur visuell ausgeblendet werden. Die Ehebeziehung der Eltern bleibt sichtbar. Das Einklappen MUSS das zugrunde liegende Dokument, den Export und den Dirty-State unverändert lassen.

#### Scenario: Kinder werden durch einen virtuellen Knoten ersetzt

- **GIVEN** die Benutzerin hat eine Ehe mit drei gemeinsamen Kindern ausgewählt und das Einklappen ausgelöst
- **WHEN** die aktuelle Arbeitsfläche neu dargestellt wird
- **THEN** sind die drei einzelnen Kinderknoten verborgen und genau ein auswählbarer Knoten `3 Kinder` sichtbar

#### Scenario: Externe Beziehungen behalten Richtung und Identität

- **GIVEN** ein gruppiertes Kind hat Eltern-, Ehe- oder Kindbeziehungen zu Personen außerhalb der Gruppe
- **WHEN** die Kindergruppe angezeigt wird
- **THEN** verbindet jede dieser Beziehungen den externen Endpunkt mit dem Gruppenknoten in ihrer ursprünglichen Richtung und bleibt als eigene Beziehung auswählbar

#### Scenario: Parallele externe Beziehungen werden nicht zusammengefasst

- **GIVEN** zwei oder mehr Beziehungen gruppierter Kinder führen nach der Umschreibung zu denselben sichtbaren Endpunkten
- **WHEN** die Kindergruppe angezeigt wird
- **THEN** bleiben die Beziehungen als getrennte auswählbare Kanten mit eigener Beziehungsidentität erhalten

#### Scenario: Interne Beziehungen werden ohne Selbstkante verborgen

- **GIVEN** eine Beziehung verbindet zwei Kinder derselben Einklappgruppe
- **WHEN** die Kindergruppe angezeigt wird
- **THEN** wird für diese Beziehung keine sichtbare Selbstkante am Gruppenknoten dargestellt und das Grunddokument bleibt unverändert

#### Scenario: Gruppenknoten kann wieder aufgefächert werden

- **GIVEN** eine Kindergruppe ist eingeklappt und ihr virtueller Knoten ist ausgewählt
- **WHEN** die Benutzerin die Aktion zum Auffächern auslöst
- **THEN** werden alle zuvor gruppierten Kinder und ihre externen Beziehungen wieder einzeln angezeigt

#### Scenario: Überlappende Gruppen werden nicht zugelassen

- **GIVEN** ein Kind gehört bereits zu einer aktiven Einklappgruppe
- **WHEN** die Benutzerin eine weitere Ehe mit einer überlappenden Kindergruppe auswählt
- **THEN** wird für diese zweite Gruppe keine Einklappaktion angeboten und die bestehende Darstellung bleibt unverändert

### Requirement: Einklappgruppen bleiben flüchtig und mit der Ansicht synchron

Das System MUST Einklappgruppen ausschließlich als aktuellen Ansichtsstatus behandeln. Ansichtsfilter, die mindestens ein Mitglied einer aktiven Gruppe ausblenden, MUESSEN die betroffenen Kinder vorübergehend wieder einzeln darstellen; sobald alle Gruppenmitglieder wieder sichtbar sind, DARF die bestehende Gruppe erneut dargestellt werden. Die Personensuche MUSS auch ein eingeklapptes Kind finden können und die Gruppe vor der Auswahl dieses Kindes automatisch auffächern. Das Einklappen, Auffächern, Filtern und Suchen DARF keine Dokumentänderung, keinen Dirty-State und keine Exportdaten erzeugen. Beim Ersetzen oder fachlichen Bearbeiten des Dokuments MUSS der flüchtige Einklappstatus verworfen werden.

#### Scenario: Filter zeigen Mitglieder einer unvollständig sichtbaren Gruppe einzeln

- **GIVEN** eine aktive Kindergruppe enthält drei Kinder und ein Ansichtsfilter blendet eines dieser Kinder aus
- **WHEN** die gefilterte Arbeitsfläche dargestellt wird
- **THEN** wird die Gruppe nicht verwendet und die sichtbaren Kinder werden einzeln angezeigt

#### Scenario: Gruppe kehrt nach dem Filter zurück

- **GIVEN** eine Kindergruppe wurde wegen eines Filters vorübergehend einzeln dargestellt
- **WHEN** der Filter so geändert wird, dass alle Gruppenmitglieder wieder sichtbar sind
- **THEN** wird die bestehende Gruppe wieder als virtueller Gruppenknoten dargestellt

#### Scenario: Suche fächert ein eingeklapptes Kind automatisch auf

- **GIVEN** ein Kind ist Teil einer eingeklappten Gruppe und entspricht der Personensuche
- **WHEN** die Benutzerin zum Suchtreffer navigiert
- **THEN** wird die Gruppe aufgefächert, das Kind ausgewählt und auf der Arbeitsfläche fokussiert

#### Scenario: Ansichtsaktionen verändern weder Dokument noch Speicherstatus

- **GIVEN** ein gespeicherter Stammbaum enthält eine eingeklappte Gruppe
- **WHEN** die Benutzerin die Gruppe ein- oder auffächert, Filter ändert, sucht oder den Stammbaum exportiert
- **THEN** bleiben Personen, Beziehungen, YAML-Inhalt und der Speicherstatus des Dokuments unverändert

#### Scenario: Dokumentänderung verwirft den Einklappstatus

- **GIVEN** mindestens eine Kindergruppe ist eingeklappt
- **WHEN** die Benutzerin ein neues Dokument öffnet oder eine fachliche Personen- oder Beziehungsänderung speichert
- **THEN** wird der Einklappstatus verworfen und die neue beziehungsweise geänderte Dokumentansicht ohne veraltete Gruppe dargestellt
