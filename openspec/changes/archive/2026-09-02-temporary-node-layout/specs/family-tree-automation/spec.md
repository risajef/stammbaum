## ADDED Requirements

### Requirement: Die Arbeitsflaeche erlaubt starken Zoom-Out

Das System MUST erlauben, die Arbeitsflaeche weit genug herauszuzoomen, dass auch grosse oder weitlaeufige Stammbaueme erreichbar bleiben. Die minimale Zoomstufe MUSS mindestens bis `0.01` reichen, und eine automatische Fit-View-Aktion DARF diese Untergrenze nicht auf eine hoehere feste Stufe beschraenken.

#### Scenario: Die Benutzerin kann stark herauszoomen

- **GIVEN** mindestens eine Person ist auf der Arbeitsflaeche sichtbar
- **WHEN** die Benutzerin die Zoom-Out-Aktion wiederholt ausfuehrt
- **THEN** kann die Ansicht unter eine Zoomstufe von `0.3` verkleinert werden, ohne dass die Zoomsteuerung vorher bei `0.5` stoppt

## MODIFIED Requirements

### Requirement: Die Arbeitsflaeche ordnet Familien automatisch an

Das System MUST fuer jede Person eine deterministische Ausgangsposition aus dem aktuellen Dokument und seinen Beziehungen berechnen. Die Ausgangsanordnung MUSS kompakt und horizontal um die Mitte der Arbeitsflaeche zentriert sein. Gespeicherte oder importierte Personenpositionen duerfen die automatisch berechnete Ausgangsanordnung nicht bestimmen. Ehepartner MUESSEN in derselben Generation horizontal nebeneinander liegen, Kinder MUESSEN unter ihren Eltern liegen und Geschwister MUESSEN auf derselben Hoehe nebeneinander liegen. Die sichtbare Position darf waehrend der aktuellen Sitzung temporaer ueberschrieben werden, ohne Teil des fachlichen Dokuments zu werden. Nach einer erfolgreichen fachlichen Aenderung MUSS die Arbeitsflaeche die Ausgangspositionen aus dem neuen Dokument neu berechnen.

#### Scenario: Familien werden kompakt und zentriert angeordnet

- **GIVEN** ein Dokument enthaelt mehrere Personen mit Beziehungen und/oder unverbundene Personen
- **WHEN** die Arbeitsflaeche erstmals angezeigt wird
- **THEN** werden Ehepartner als benachbarte Gruppe auf gleicher Hoehe, Kinder unter ihren Eltern und Geschwister auf gleicher Hoehe angezeigt; die gesamte Ausgangsanordnung ist deterministisch, kompakt und horizontal um die Mitte zentriert

#### Scenario: Gespeicherte Positionen werden fuer die Ausgangsanordnung ignoriert

- **GIVEN** Personen enthalten unterschiedliche, auch weit auseinanderliegende Positionen im Dokument
- **WHEN** die Arbeitsflaeche angezeigt wird
- **THEN** bestimmt die automatische Familienanordnung die sichtbaren Ausgangspositionen unabhaengig von diesen gespeicherten Positionen

#### Scenario: Ehepartner werden nebeneinander angeordnet

- **GIVEN** zwei Personen sind durch eine Ehe verbunden
- **WHEN** die Arbeitsflaeche angezeigt oder die Ehe gespeichert wird
- **THEN** liegen beide Ehepartner auf derselben Hoehe und ihre horizontalen Abstaende sind kleiner als der Abstand zu einer nicht verbundenen Person derselben Generation

#### Scenario: Kinder liegen unter den Eltern

- **GIVEN** zwei Ehepartner haben ein gemeinsames Kind oder beide sind als Eltern mit demselben Kind verbunden
- **WHEN** die Arbeitsflaeche angezeigt wird
- **THEN** liegt das Kind unter der Hoehe beider Eltern und Geschwister teilen sich eine Hoehe

#### Scenario: Manuelles Verschieben ist deaktiviert

- **GIVEN** eine Person ist auf der Arbeitsflaeche sichtbar
- **WHEN** die Benutzerin den Knoten zieht
- **THEN** darf die sichtbare Position temporaer angepasst werden, aber dauerhaftes manuelles Layout sowie eine Aenderung des fachlichen Dokuments bleiben deaktiviert

#### Scenario: Aenderungen berechnen das Layout neu

- **GIVEN** Personen, Lebensdaten oder Beziehungen werden erfolgreich geaendert
- **WHEN** die Arbeitsflaeche den neuen Dokumentzustand anzeigt
- **THEN** werden Positionen und Generationen aus dem neuen Zustand neu berechnet und die Darstellung bleibt ohne gespeicherte manuelle Layoutdaten konsistent

