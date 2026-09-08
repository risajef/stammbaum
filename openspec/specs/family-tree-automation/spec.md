# family-tree-automation Specification

## Purpose

Diese Capability ordnet einen Stammbaum automatisch als Familienstruktur an und leitet sichere, nachvollziehbare Elternschaften aus Ehe- und Eltern-Kind-Angaben ab. Kommentare an Personen und Beziehungen machen unsichere Annahmen sichtbar, ohne die automatische Verarbeitung abzuschalten.

## Requirements

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


### Requirement: Ehebeziehungen sind symmetrische Paare

Das System MUST eine Ehe unabhaengig von der Richtung der direkten Verbindung als dasselbe Paar behandeln. Die fachliche Speicherung darf die kanonische Frau-zu-Mann-Richtung verwenden, aber A nach B und B nach A MUESSEN dieselbe Ehe identifizieren und duerfen keine zweite Ehe erzeugen. Mehrere verschiedene Ehen einer Person MUESSEN weiterhin erlaubt sein, auch wenn Todesdaten fehlen.

#### Scenario: Umgekehrte Verbindung erzeugt keine doppelte Ehe
- **GIVEN** zwischen A und B besteht bereits eine Ehe
- **WHEN** die Benutzerin B mit A als Ehe verbinden will
- **THEN** wird die Verbindung als bereits bestehende Ehe abgelehnt und die bestehende Ehe bleibt unveraendert

#### Scenario: Mehrere Ehen bleiben ohne Todesdatum moeglich
- **GIVEN** eine Person hat eine Ehe ohne bekanntes Todesjahr des Ehepartners
- **WHEN** sie mit einer weiteren passenden Person verheiratet wird
- **THEN** kann die zweite verschiedene Ehe gespeichert werden

### Requirement: Personen und Beziehungen koennen kommentiert werden

Das System MUST einen optionalen Kommentar an jeder Person und jeder Beziehung speichern, bearbeiten und wieder anzeigen koennen. Ein leerer Kommentar MUST als leer bzw. `null` gespeichert werden. Kommentare MUESSEN die automatische Anordnung und Beziehungsableitung nicht veraendern.

#### Scenario: Unsichere Person wird erklaert
- **GIVEN** eine Person ist ausgewaehlt
- **WHEN** die Benutzerin einen Kommentar eingibt und die Person speichert
- **THEN** wird der Kommentar an der Person angezeigt und im YAML-Roundtrip erhalten

#### Scenario: Annahme einer Beziehung wird erklaert
- **GIVEN** eine Beziehung ist ausgewaehlt, auch wenn sie automatisch geschlussfolgert wurde
- **WHEN** die Benutzerin einen Kommentar eingibt und die Beziehung speichert
- **THEN** wird der Kommentar an der Beziehung gespeichert und angezeigt, ohne den Beziehungsstatus zu veraendern

### Requirement: Sichere Elternschaften werden automatisch geschlussfolgert

Das System MUST fuer eine Eltern-Kind-Beziehung A nach C die Ehepartner von A als moegliche weitere Eltern pruefen. Bei genau einem Ehepartner B MUST eine fehlende Beziehung B nach C automatisch mit `status: inferred` angelegt werden, auch wenn Lebensdaten fehlen. Bei mehreren Ehepartnern MUSS das System bekannte Datumskomponenten von C und den Ehepartnern vergleichen: Ein Ehepartner, dessen Tod nachweisbar vor dem Geburtsdatum von C liegt, ist nicht zeitlich moeglich; fehlende Datumskomponenten bleiben unbekannt. Wenn nach diesem Vergleich genau ein Ehepartner zeitlich moeglich bleibt, DARF eine automatische Elternschaft angelegt werden. Sind kein Geburtsdatum von C vorhanden oder mehrere Ehepartner zeitlich moeglich, DARF keine automatische Elternschaft angelegt werden.

Automatisch angelegte Beziehungen MUESSEN im Dokument als `status: inferred` und als automatisch abgeleitet gekennzeichnet werden. Ihre automatisch erzeugte Erklaerung MUSS als Kommentar hinterlegt werden. Wird die Quellbeziehung entfernt oder ist die Zeitbedingung spaeter nicht mehr erfuellt, MUSS die automatisch angelegte Beziehung entfernt werden; ein bestehender Kommentar einer weiterhin gueltigen automatischen Beziehung MUSS erhalten bleiben.

#### Scenario: Einziger Ehepartner wird als zweiter Elternteil ergaenzt
- **GIVEN** A ist mit B verheiratet und A ist Elternteil von C
- **WHEN** die Beziehung gespeichert wird
- **THEN** wird B nach C automatisch als `inferred` angelegt und die Beziehung erklaert ihre Ableitung per Kommentar

#### Scenario: Mehrere Ehepartner werden ueber Todesdaten zugeordnet
- **GIVEN** A hat mehrere Ehepartner, C hat ein bekanntes Geburtsdatum, genau ein Ehepartner B ist nach den bekannten Datumskomponenten zeitlich moeglich und alle anderen Ehepartner sind nachweisbar vorher gestorben
- **WHEN** A als Elternteil von C gespeichert wird
- **THEN** wird nur B nach C als `inferred` angelegt

#### Scenario: Fehlendes Todesdatum verhindert die mehrdeutige Ableitung
- **GIVEN** A hat mehrere Ehepartner und mindestens ein Todesdatum oder das Geburtsdatum von C ist nur teilweise oder gar nicht bekannt, sodass dadurch mehrere Ehepartner zeitlich moeglich bleiben
- **WHEN** A als Elternteil von C gespeichert wird
- **THEN** werden fehlende Komponenten nicht durch angenommene Monate oder Tage ersetzt und bei dadurch mehreren moeglichen Ehepartnern wird keine automatische Elternschaft angelegt

#### Scenario: Mehrere zeitlich passende Ehepartner verhindern eine Ableitung
- **GIVEN** A hat mehrere Ehepartner, C hat ein bekanntes Geburtsjahr und mindestens zwei Ehepartner haben ein Todesjahr am oder nach dem Geburtsjahr von C
- **WHEN** die Eltern-Kind-Beziehung gespeichert wird
- **THEN** wird keine automatische Elternschaft angelegt

#### Scenario: Automatische Beziehung wird bei ungueltiger Voraussetzung entfernt
- **GIVEN** B nach C wurde aus A-Ehe-B und A nach C automatisch angelegt
- **WHEN** die Ehe oder die Quell-Elternschaft entfernt wird oder die Zeitbedingung nicht mehr gilt
- **THEN** wird nur die automatische Beziehung entfernt und die manuell erfassten Personen sowie andere Beziehungen bleiben erhalten

### Requirement: Automatische Informationen bleiben in YAML nachvollziehbar

Das System MUST Kommentare und die Kennzeichnung automatisch abgeleiteter Beziehungen im versionierten YAML-Dokument serialisieren und wieder einlesen. Ein Import MUST die fachlichen Regeln validieren und den aktuellen Stammbaum bei einem Fehler unveraendert lassen. Das Einlesen einer Datei ohne automatische Beziehungen MUST weiterhin moeglich sein; die Anwendung MUSS danach fehlende sichere automatische Elternschaften ergaenzen koennen.

#### Scenario: Kommentare und Herkunft ueberleben den Roundtrip
- **GIVEN** ein Dokument enthaelt Personen- und Beziehungskommentare sowie eine automatisch abgeleitete Elternschaft
- **WHEN** das Dokument exportiert und wieder importiert wird
- **THEN** bleiben Kommentare, `status: inferred` und die automatische Herkunft unveraendert erhalten

#### Scenario: Gueltiger Import loest sichere Ableitungen aus
- **GIVEN** eine importierte Datei enthaelt eine Ehe und eine passende Eltern-Kind-Beziehung, aber noch nicht die sichere inferred-Kante
- **WHEN** die Datei vollstaendig validiert und geoeffnet wird
- **THEN** wird die fehlende automatische Elternschaft im neuen Dokument angelegt

### Requirement: Die Arbeitsflaeche erlaubt starken Zoom-Out

Das System MUST erlauben, die Arbeitsflaeche weit genug herauszuzoomen, dass auch grosse oder weitlaeufige Stammbaueme erreichbar bleiben. Die minimale Zoomstufe MUSS mindestens bis `0.01` reichen, und eine automatische Fit-View-Aktion DARF diese Untergrenze nicht auf eine hoehere feste Stufe beschraenken.

#### Scenario: Die Benutzerin kann stark herauszoomen

- **GIVEN** mindestens eine Person ist auf der Arbeitsflaeche sichtbar
- **WHEN** die Benutzerin die Zoom-Out-Aktion wiederholt ausfuehrt
- **THEN** kann die Ansicht unter eine Zoomstufe von `0.3` verkleinert werden, ohne dass die Zoomsteuerung vorher bei `0.5` stoppt
