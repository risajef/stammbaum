# family-tree-automation Specification

## Purpose

Diese Capability ordnet einen Stammbaum automatisch als Familienstruktur an und leitet sichere, nachvollziehbare Elternschaften aus Ehe- und Eltern-Kind-Angaben ab. Kommentare an Personen und Beziehungen machen unsichere Annahmen sichtbar, ohne die automatische Verarbeitung abzuschalten.

## Requirements

### Requirement: Die Arbeitsflaeche ordnet Familien automatisch an

Das System MUST die Position jeder Person aus dem aktuellen Dokument und seinen Beziehungen berechnen. Manuelles Verschieben von Personen MUST nicht moeglich sein. Ehepartner MUESSEN in derselben Generation horizontal nebeneinander liegen, Kinder MUESSEN unter ihren Eltern liegen und Geschwister MUESSEN auf derselben Hoehe nebeneinander liegen. Personen ohne Beziehungen MUESSEN eine deterministische Position erhalten.

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
- **WHEN** die Benutzerin versucht, den Knoten zu ziehen
- **THEN** aendert sich seine automatisch berechnete Position nicht durch diese Interaktion

#### Scenario: Aenderungen berechnen das Layout neu
- **GIVEN** Personen, Lebensdaten oder Beziehungen werden erfolgreich geaendert
- **WHEN** die Arbeitsflaeche den neuen Dokumentzustand anzeigt
- **THEN** werden Positionen und Generationen aus dem neuen Zustand neu berechnet und die Darstellung bleibt ohne manuelle Nacharbeit konsistent

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

Das System MUST fuer eine Eltern-Kind-Beziehung A nach C die Ehepartner von A als moegliche weitere Eltern pruefen. Bei genau einem Ehepartner B MUST eine fehlende Beziehung B nach C automatisch mit `status: inferred` angelegt werden, auch wenn Todesdaten fehlen. Bei mehreren Ehepartnern DARF eine automatische Elternschaft nur angelegt werden, wenn das Geburtsjahr von C bekannt ist, jedes Todesjahr der Ehepartner bekannt ist und genau ein Ehepartner B die zeitliche Bedingung `deathYear >= birthYear(C)` erfuellt, waehrend alle anderen Ehepartner vor dem Geburtsjahr von C gestorben sind. Fehlt ein benoetigtes Todes- oder Geburtsjahr oder sind mehrere Ehepartner zeitlich moeglich, DARF keine automatische Elternschaft angelegt werden.

Automatisch angelegte Beziehungen MUESSEN im Dokument als `status: inferred` und als automatisch abgeleitet gekennzeichnet werden. Ihre automatisch erzeugte Erklaerung MUSS als Kommentar hinterlegt werden. Wird die Quellbeziehung entfernt oder ist die Zeitbedingung spaeter nicht mehr erfuellt, MUSS die automatisch angelegte Beziehung entfernt werden; ein bestehender Kommentar einer weiterhin gueltigen automatischen Beziehung MUSS erhalten bleiben.

#### Scenario: Einziger Ehepartner wird als zweiter Elternteil ergaenzt
- **GIVEN** A ist mit B verheiratet und A ist Elternteil von C
- **WHEN** die Beziehung gespeichert wird
- **THEN** wird B nach C automatisch als `inferred` angelegt und die Beziehung erklaert ihre Ableitung per Kommentar

#### Scenario: Mehrere Ehepartner werden ueber Todesdaten zugeordnet
- **GIVEN** A hat mehrere Ehepartner, C hat ein bekanntes Geburtsjahr, alle Ehepartner haben ein Todesjahr und genau B ist bei der Geburt von C noch zeitlich moeglich
- **WHEN** A als Elternteil von C gespeichert wird
- **THEN** wird nur B nach C als `inferred` angelegt

#### Scenario: Fehlendes Todesdatum verhindert die mehrdeutige Ableitung
- **GIVEN** A hat mehrere Ehepartner und mindestens ein Ehepartner hat kein Todesjahr
- **WHEN** A als Elternteil von C gespeichert wird
- **THEN** wird keine automatische Elternschaft zu einem Ehepartner angelegt

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
