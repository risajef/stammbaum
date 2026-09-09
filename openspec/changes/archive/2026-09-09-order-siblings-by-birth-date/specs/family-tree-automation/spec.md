## MODIFIED Requirements

### Requirement: Die Arbeitsflaeche ordnet Familien automatisch an

Das System MUST fuer jede Person eine deterministische Ausgangsposition aus dem aktuellen Dokument und seinen Beziehungen berechnen. Die Ausgangsanordnung MUSS kompakt und horizontal um die Mitte der Arbeitsflaeche zentriert sein. Gespeicherte oder importierte Personenpositionen duerfen die automatisch berechnete Ausgangsanordnung nicht bestimmen. Ehepartner MUESSEN als kompakter Block in derselben Generation horizontal nebeneinander liegen, Kinder MUESSEN als eigene, zentrierte Gruppe unter ihren Eltern liegen und Geschwister MUESSEN auf derselben Hoehe mit engem Abstand nebeneinander liegen. Innerhalb jeder Geschwistergruppe MUESSEN die Personen von links nach rechts anhand der bekannten Komponenten ihres Geburtsdatums chronologisch angeordnet werden, soweit ein Vergleich sicher moeglich ist, sodass das aeltere Geschwister links steht. Fehlende Komponenten duerfen nicht durch angenommene Werte ersetzt werden. Halbgeschwister, die mindestens ein gemeinsames Elternteil haben, MUESSEN dabei wie Geschwister in derselben Gruppe behandelt werden. Personen ohne Geburtsdatum MUESSEN nach den Personen mit bekannten Geburtsdaten angeordnet werden; bei fehlenden Komponenten, gleichen Daten sowie anderweitig nicht unterscheidbaren Daten MUSS die Reihenfolge deterministisch sein. Mehrere Ehepartner einer Person MUESSEN in ihrer gemeinsamen Generation kompakt angeordnet werden, ohne die darunterliegenden Kindergenerationen in dieselbe Zeile zu ziehen. Die sichtbare Position darf waehrend der aktuellen Sitzung temporaer ueberschrieben werden, ohne Teil des fachlichen Dokuments zu werden. Nach einer erfolgreichen fachlichen Aenderung MUSS die Arbeitsflaeche die Ausgangspositionen aus dem neuen Dokument neu berechnen.

#### Scenario: Familien werden kompakt und zentriert angeordnet

- **GIVEN** ein Dokument enthaelt mehrere Personen mit Beziehungen und/oder unverbundene Personen
- **WHEN** die Arbeitsflaeche erstmals angezeigt wird
- **THEN** werden Ehepartner als benachbarte Gruppe auf gleicher Hoehe, Kinder unter ihren Eltern und Geschwister auf gleicher Hoehe angezeigt; die gesamte Ausgangsanordnung ist deterministisch, kompakt und horizontal um die Mitte zentriert, und Geschwister stehen von links nach rechts vom aeltesten zum juengsten

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

#### Scenario: Halbgeschwister werden gemeinsam chronologisch angeordnet

- **GIVEN** mehrere Kinder haben mindestens ein gemeinsames Elternteil, auch wenn nicht alle Kinder dieselben Eltern haben
- **WHEN** die Arbeitsflaeche angezeigt wird
- **THEN** liegen alle diese Halb- und Vollgeschwister auf derselben Hoehe und sind gemeinsam vom aeltesten zum juengsten angeordnet

#### Scenario: Bekannte Geburtskomponenten werden chronologisch genutzt

- **GIVEN** eine Geschwistergruppe enthaelt Personen mit vollstaendigem, nur teilweise bekanntem und fehlendem Geburtsdatum
- **WHEN** die automatische Ausgangsanordnung berechnet wird
- **THEN** werden Personen anhand ihrer bekannten Geburtsjahr-, Monats- und Tageskomponenten chronologisch angeordnet, soweit der Vergleich sicher moeglich ist, Personen ohne Geburtsdatum stehen danach, fehlende Komponenten werden nicht ergaenzt und gleiche oder nicht unterscheidbare Daten werden deterministisch aufgeloest

#### Scenario: Manuelles Verschieben ist deaktiviert

- **GIVEN** eine Person ist auf der Arbeitsflaeche sichtbar
- **WHEN** die Benutzerin den Knoten zieht
- **THEN** darf die sichtbare Position temporaer angepasst werden, aber dauerhaftes manuelles Layout sowie eine Aenderung des fachlichen Dokuments bleiben deaktiviert

#### Scenario: Aenderungen berechnen das Layout neu

- **GIVEN** Personen, Lebensdaten oder Beziehungen werden erfolgreich geaendert
- **WHEN** die Arbeitsflaeche den neuen Dokumentzustand anzeigt
- **THEN** werden Positionen und Generationen aus dem neuen Zustand neu berechnet und die Darstellung bleibt ohne gespeicherte manuelle Layoutdaten konsistent
