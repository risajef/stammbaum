# family-tree-editor Specification

## Purpose

Diese Capability ermoeglicht es, genealogische Personen und ihre belegten oder geschlussfolgerten Familienbeziehungen visuell zu erfassen, zu bearbeiten und als portable YAML-Datei zu erhalten.

## Requirements

### Requirement: Personen koennen erfasst und bearbeitet werden

Das System MUST Personen mit einem Vor- und Nachnamen anlegen koennen. Geschlecht darf als Frau oder Mann angegeben werden und ist fuer die Erstellung einer Ehebeziehung erforderlich; Geburts- und Todesdaten sind optional und duerfen als Jahr, Jahr-Monat oder vollstaendiges Datum angegeben werden. Eine bestehende Person MUST ohne Verlust ihrer Beziehungen bearbeitbar sein. Die Aktion zum Anlegen einer Person MUSS direkt in der Uebersichtszeile der Arbeitsflaeche erreichbar sein; ein separates Werkzeugfenster dafuer ist nicht erforderlich.

#### Scenario: Person mit vollstaendigen Angaben anlegen
- **GIVEN** die Arbeitsflaeche ist geoeffnet
- **WHEN** die Benutzerin eine Person mit Vorname, Nachname, Geschlecht sowie Geburts- und Todesdatum im Format `YYYY-MM-DD` anlegt und bestaetigt
- **THEN** erscheint genau eine neue Person mit diesen Angaben auf der Arbeitsflaeche

#### Scenario: Unbekannte Lebensdaten leer lassen
- **GIVEN** die Benutzerin legt eine Person ohne bekanntes Geburts- oder Todesdatum an
- **WHEN** sie die Person bestaetigt
- **THEN** wird die Person mit leeren Lebensdaten gespeichert und als gueltig angezeigt

#### Scenario: Person bearbeiten ohne Beziehungen zu verlieren
- **GIVEN** eine Person hat mindestens eine Ehe- oder Eltern-Kind-Beziehung
- **WHEN** die Benutzerin den Nachnamen oder ein Lebensdatum aendert und speichert
- **THEN** wird die Angabe aktualisiert und jede bestehende Beziehung bleibt erhalten

#### Scenario: Person aus der Uebersicht anlegen

#### Scenario: Neue Person erscheint im aktuellen Sichtbereich
 - **GIVEN** die Benutzerin betrachtet einen beliebigen Ausschnitt der Arbeitsflaeche
 - **WHEN** sie eine neue Person speichert
 - **THEN** erscheint die neue Person zentriert im aktuell sichtbaren Arbeitsbereich und nicht an einer festen Dokumentposition

### Requirement: Geburts- und Todesdaten unterstuetzen Teilangaben

Das System MUST je ein einzelnes optionales Eingabefeld fuer Geburt und Tod anbieten. Ein nichtleeres Datum MUST exakt als `YYYY`, `YYYY-MM` oder `YYYY-MM-DD` mit einem gueltigen Monat und Kalendertag eingegeben werden koennen. Die eingegebene Genauigkeit MUST beim Anzeigen und Speichern erhalten bleiben. Bestehende numerische Jahreswerte aus schemaVersion-1-YAML-Dateien MUST weiterhin importierbar sein und als vierstellige Jahreswerte normalisiert werden.

#### Scenario: Teilangaben bleiben erhalten
- **GIVEN** die Benutzerin gibt fuer eine Person ein Geburtsdatum `1900-05` und ein Todesdatum `1970` ein
- **WHEN** sie die Person speichert und den Stammbaum exportiert und wieder importiert
- **THEN** bleiben `1900-05` und `1970` unveraendert erhalten und werden auf dem Personenknoten angezeigt

#### Scenario: Vollstaendiges Datum mit gueltigem Kalendertag
- **GIVEN** die Benutzerin gibt `1900-02-28` als Geburtsdatum ein
- **WHEN** sie die Person speichert
- **THEN** wird das vollstaendige Datum ohne Verlust von Monat und Tag gespeichert

#### Scenario: Unmoeglicher Kalendertag wird abgelehnt
- **GIVEN** die Benutzerin gibt `1900-02-29` oder einen Monat ausserhalb von `01` bis `12` ein
- **WHEN** sie die Person speichert
- **THEN** wird das betroffene Datumsfeld mit einem konkreten Fehler markiert und die zuletzt gueltigen Personendaten bleiben unveraendert

#### Scenario: Unbekannte Datumskomponenten werden nicht erfunden
- **GIVEN** nur das Jahr oder Jahr und Monat eines Lebensdatums sind bekannt
- **WHEN** die Benutzerin die Person speichert
- **THEN** bleibt die nicht bekannte Genauigkeit unbekannt und das System ergaenzt keinen kuenstlichen Monat oder Tag

### Requirement: Die deutschsprachige Oberflaeche verwendet echte Umlaute

Das System MUST in aktuellen deutschsprachigen Benutzeroberflaechentexten, Statusanzeigen und Fehlermeldungen die korrekten deutschen Zeichen `ä`, `ö`, `ü`, `Ä`, `Ö` und `Ü` verwenden, wenn ein Wort einen Umlaut enthaelt. Ausgeschriebene Ersatzformen wie `Ae`, `Oe`, `Ue` sowie `ae`, `oe`, `ue` duerfen in diesen sichtbaren Produkttexten nicht verwendet werden.

#### Scenario: Umlaute erscheinen in der Oberflaeche

- **GIVEN** die Benutzerin oeffnet die Anwendung und nutzt die Datei-, Uebersichts- oder Inspektor-Aktionen
- **WHEN** ein deutschsprachiger Text angezeigt wird
- **THEN** erscheinen darin echte Umlaute statt ausgeschriebener Ersatzformen

#### Scenario: Umlaute erscheinen in Fehlermeldungen

- **GIVEN** die Benutzerin gibt ungueltige Daten ein oder eine Dateioperation schlaegt fehl
- **WHEN** die Anwendung den Fehler anzeigt
- **THEN** verwendet die Meldung die korrekten deutschen Umlaute

### Requirement: Ehebeziehungen koennen zwischen Frau und Mann erstellt werden

Das System MUST eine Ehebeziehung zwischen zwei bereits vorhandenen Personen erfassen koennen, wenn eine Person als Frau und die andere als Mann angegeben ist. Eine Person darf mehrere Ehebeziehungen haben, aber dieselbe Ehebeziehung darf nicht doppelt angelegt werden.

#### Scenario: Ehebeziehung anlegen
- **GIVEN** eine Frau und ein Mann sind auf der Arbeitsflaeche vorhanden
- **WHEN** die Benutzerin beide Personen als Ehepartner verbindet und die Beziehung bestaetigt
- **THEN** wird eine einzelne Ehebeziehung zwischen diesen Personen angezeigt und gespeichert

#### Scenario: Ungueltige Ehebeziehung ablehnen
- **GIVEN** die Benutzerin versucht eine Ehe zwischen zwei Personen ohne komplementaere Frau-/Mann-Angabe, einer Person mit sich selbst oder einer bereits verheirateten Paarung erneut anzulegen
- **WHEN** sie die Verbindung bestaetigt
- **THEN** wird keine neue Beziehung angelegt und die Oberflaeche erklaert den konkreten Validierungsfehler

#### Scenario: Geschlecht nicht unbemerkt ungueltig aendern
- **GIVEN** eine Person ist Teil einer Ehebeziehung
- **WHEN** die Benutzerin deren Geschlecht so aendert, dass die Ehebedingung nicht mehr erfuellt ist
- **THEN** wird die Aenderung abgelehnt oder eine explizite Aufloesung der betroffenen Ehe verlangt, und die bestehende gueltige Beziehung bleibt bis dahin unveraendert

### Requirement: Eltern-Kind-Beziehungen koennen erstellt und entfernt werden

Das System MUST eine gerichtete Eltern-Kind-Beziehung zwischen vorhandenen Personen erfassen koennen. Eine Person darf mehrere Kinder und mehrere Elternbeziehungen haben. Selbstbeziehungen und Beziehungen auf nicht vorhandene Personen MUST abgelehnt werden.

#### Scenario: Eltern-Kind-Beziehung anlegen
- **GIVEN** zwei Personen sind auf der Arbeitsflaeche vorhanden
- **WHEN** die Benutzerin die erste Person als Elternteil mit der zweiten Person als Kind verbindet und die Beziehung bestaetigt
- **THEN** wird eine gerichtete Eltern-Kind-Kante von Elternteil zu Kind angezeigt und gespeichert

#### Scenario: Mehrere Kinder und Eltern erfassen
- **GIVEN** eine Person ist bereits als Elternteil oder Kind verknuepft
- **WHEN** die Benutzerin weitere gueltige Eltern-Kind-Verbindungen anlegt
- **THEN** werden alle Verbindungen separat angezeigt und keine bestehende Verbindung wird ersetzt

#### Scenario: Beziehung entfernen
- **GIVEN** eine Ehe- oder Eltern-Kind-Beziehung ist ausgewaehlt
- **WHEN** die Benutzerin diese Beziehung entfernt und den Vorgang bestaetigt
- **THEN** wird nur diese Beziehung entfernt; die beteiligten Personen und andere Beziehungen bleiben erhalten

### Requirement: Quellen und Schlussfolgerungsstatus sind Teil jeder Beziehung

Das System MUST jede Beziehung mit dem Status `explizit` oder `geschlussfolgert` speichern. Der Status ist beim Anlegen und spaeteren Bearbeiten aenderbar. Eine Beziehung darf eine einzelne optionale Quellen-URL tragen; eine angegebene Quelle MUST eine gueltige HTTP- oder HTTPS-URL sein.

#### Scenario: Beziehung mit Quelle speichern
- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung
- **WHEN** sie eine HTTP- oder HTTPS-URL als Quelle angibt und den Status waehlt
- **THEN** werden URL und Status zusammen mit der Beziehung gespeichert und in deren Detailansicht angezeigt

#### Scenario: Beziehung ohne Quelle speichern
- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung ohne bekannte Quelle
- **WHEN** sie die Beziehung bestaetigt
- **THEN** wird die Beziehung ohne Quelle, aber mit dem gewaehlten Status gespeichert

#### Scenario: Ungueltige Quelle ablehnen
- **GIVEN** die Benutzerin gibt eine leere, fehlerhafte oder nicht als HTTP-/HTTPS-URL erkennbare Quellenangabe ein
- **WHEN** sie die Beziehung bestaetigt oder die Quelle speichert
- **THEN** wird die ungueltige Quellenangabe abgelehnt, die Beziehung bleibt unveraendert und der Fehler wird am Quellenfeld angezeigt

#### Scenario: Geschlussfolgerte Beziehung unterscheiden
- **GIVEN** eine Beziehung ist als `geschlussfolgert` gespeichert
- **WHEN** die Arbeitsflaeche oder eine Beziehungsliste angezeigt wird
- **THEN** ist der Status ohne Oeffnen eines versteckten Menues visuell von `explizit` unterscheidbar

### Requirement: Beziehungen lassen sich direkt in der Arbeitsflaeche bedienen

Das System MUST eine direkte Interaktion anbieten, mit der die Benutzerin eine Person auswaehlt, einen Beziehungstyp festlegt und eine zweite Person als Ziel verbindet, ohne interne IDs oder YAML bearbeiten zu muessen. Auswahl, Bearbeitung und Detailansicht von Personen und Beziehungen muessen eindeutig erkennbar sein.

#### Scenario: Beziehung per direkter Verbindung erstellen
- **GIVEN** mindestens zwei Personen sind sichtbar
- **WHEN** die Benutzerin eine Verbindung von einer Person zum Ziel zieht, den Beziehungstyp waehlt und bestaetigt
- **THEN** wird die entsprechende Ehe- oder Eltern-Kind-Beziehung angelegt und die neue Kante ist ausgewaehlt

#### Scenario: Abgebrochene Verbindung veraendert keine Daten
- **GIVEN** die Benutzerin hat eine neue Verbindung begonnen
- **WHEN** sie die Verbindung abbricht oder kein gueltiges Ziel bestaetigt
- **THEN** wird keine Beziehung angelegt und der bisherige Stammbaum bleibt unveraendert

#### Scenario: Ausgewaehltes Objekt bearbeiten
- **GIVEN** eine Person oder Beziehung ist ausgewaehlt
- **WHEN** die Benutzerin die Detailansicht oeffnet
- **THEN** sieht sie die vollstaendigen bearbeitbaren Angaben, vorhandene Quelle und den Status und kann Aenderungen speichern oder verwerfen

### Requirement: Beziehungstypen sind auf der Arbeitsflaeche unterscheidbar

Das System MUST Ehe- und Eltern-Kind-Beziehungen auf der Arbeitsflaeche durch eine gemeinsame weiche `simplebezier`-Linienform sowie unterschiedliche Farben und sichtbare Typbezeichnungen unterscheidbar darstellen. Eine Eltern-Kind-Beziehung MUST weiterhin eindeutig in Richtung des Kindes zeigen; eine Ehe DARF keinen Richtungspfeil zum Ehepartner anzeigen. Der Beziehungsstatus `inferred` MUSS unabhaengig vom Beziehungstyp zusaetzlich erkennbar bleiben.

#### Scenario: Ehe und Elternschaft haben unterschiedliche Kanten
- **GIVEN** eine Arbeitsflaeche enthaelt eine Ehe und eine Eltern-Kind-Beziehung
- **WHEN** beide Beziehungen angezeigt werden
- **THEN** unterscheiden sie sich ohne Oeffnen des Inspektors durch Farbe oder sichtbare Typbezeichnung

#### Scenario: Elternschaft zeigt zum Kind
- **GIVEN** eine gerichtete Eltern-Kind-Beziehung von A nach C ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** besitzt sie eine sichtbare Richtungsspitze auf der Seite von C

#### Scenario: Ehe hat keine kuenstliche Richtung
- **GIVEN** eine Ehe zwischen A und B ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** besitzt sie keine Richtungsspitze, die einen Ehepartner als Kind oder Ziel auszeichnet

### Requirement: Personen koennen temporaer fuer die Beziehungsarbeit verschoben werden

Das System MUST erlauben, sichtbare Personen waehrend der aktuellen Sitzung auf der Arbeitsflaeche zu verschieben, damit Beziehungen leichter erstellt und geprueft werden koennen. Eine solche Positionsaenderung MUST ausschliesslich die aktuelle Ansicht betreffen. Sie DARF keine fachliche Dokumentaenderung, keinen Dirty-State und keine gespeicherte Personenposition erzeugen. View-Panning MUSS weiterhin moeglich bleiben, ohne dass das Ziehen eines Nodes die Arbeitsflaeche gleichzeitig verschiebt.

#### Scenario: Node-Dragging aendert nur die aktuelle Ansicht

- **GIVEN** eine Person ist sichtbar und das Dokument ist gespeichert
- **WHEN** die Benutzerin den Node an eine andere Stelle zieht
- **THEN** wird der Node an der neuen temporaeren Stelle angezeigt, waehrend das Dokument unveraendert bleibt und der gespeicherte Zustand weiterhin als gespeichert gilt

#### Scenario: Temporaere Positionen werden nicht exportiert

- **GIVEN** eine Person wurde temporaer verschoben
- **WHEN** die Benutzerin den Stammbaum speichert
- **THEN** enthaelt der YAML-Export nicht die temporaere Position, sondern weiterhin nur die fachlichen Dokumentdaten

#### Scenario: Dokumentwechsel verwirft temporaere Positionen

- **GIVEN** mindestens ein Node wurde temporaer verschoben
- **WHEN** die Benutzerin ein neues Dokument anlegt oder ein anderes gueltiges Dokument importiert
- **THEN** werden die temporaeren Positionen verworfen und die Nodes erhalten die automatisch berechneten Positionen des neuen Dokuments

### Requirement: Stammbaeume werden als YAML-Datei importiert und exportiert

Das System MUST den vollstaendigen Stammbaum als eine versionierte YAML-Datei exportieren und eine gueltige Datei wieder importieren koennen. Der Roundtrip MUST Personen, stabile Identitaeten, Teil-Datumswerte oder leere Lebensdaten, Ehe-Startdaten, Beziehungstypen, Richtung, Quellen und Schlussfolgerungsstatus erhalten. Ein implizites Ehe-Enddatum MUST nicht als eigenstaendiges editierbares Feld exportiert werden. Eine Datenbank oder ein Server MUST fuer das Arbeiten mit einer Datei nicht erforderlich sein.

#### Scenario: Gueltigen Stammbaum exportieren und wieder importieren
- **GIVEN** ein Stammbaum enthaelt Personen mit `YYYY`, `YYYY-MM` und `YYYY-MM-DD` sowie explizite und geschlussfolgerte Beziehungen
- **WHEN** die Benutzerin ihn als YAML exportiert und diese Datei anschliessend importiert
- **THEN** entspricht der importierte Stammbaum dem vorherigen Zustand einschliesslich der Genauigkeit aller Personendaten und Beziehungsmetadaten

#### Scenario: Ehe-Startdaten ueberleben den Roundtrip
- **GIVEN** ein Stammbaum enthaelt eine Ehe mit dem Startdatum `1880-05-20`
- **WHEN** die Benutzerin ihn als YAML exportiert und anschliessend importiert
- **THEN** bleibt `1880-05-20` an der Ehe erhalten und ein abgeleitetes Enddatum wird nicht als separates YAML-Feld angelegt

#### Scenario: YAML-Validierungsfehler beim Import
- **GIVEN** eine ausgewaehlte YAML-Datei ist syntaktisch ungueltig oder enthaelt ein ungueltiges Geburts-, Todes- oder Ehe-Startdatum oder verletzt die erforderliche Struktur, etwa durch unbekannte Personenreferenzen oder eine ungueltige URL
- **WHEN** die Benutzerin den Import startet
- **THEN** wird die Datei abgelehnt, ein verstaendlicher Fehler angezeigt und der aktuell geoeffnete Stammbaum nicht teilweise ueberschrieben

#### Scenario: Alte Jahreswerte bleiben importierbar
- **GIVEN** eine schemaVersion-1-YAML-Datei enthaelt eine numerische Angabe `birthYear: 1900` und keine Ehe-Startdaten
- **WHEN** die Benutzerin die Datei importiert
- **THEN** wird die Angabe als `1900` ohne zusaetzliche unbekannte Komponenten geladen

#### Scenario: Datei kann ohne erweiterte Dateisystem-API genutzt werden
- **GIVEN** der Browser stellt keine direkte Dateisystem-API zur Verfuegung
- **WHEN** die Benutzerin einen Stammbaum speichern oder oeffnen moechte
- **THEN** kann sie die YAML-Datei trotzdem herunterladen bzw. ueber eine lokale Dateiauswahl laden

### Requirement: Eingaben und ungespeicherte Aenderungen werden sicher behandelt

Das System MUST fehlerhafte Eingaben vor dem Speichern sichtbar markieren und darf bei einem Validierungsfehler keine gueltigen bestehenden Daten veraendern. Geburts-, Todes- und Ehe-Startdaten muessen dem Format `YYYY`, `YYYY-MM` oder `YYYY-MM-DD` entsprechen und gueltige Kalendertage enthalten; wenn zwei Daten mit den bekannten Komponenten sicher vergleichbar sind, darf eine bekannte Endzeit nicht vor dem zugehoerigen Start liegen. Bei ungespeicherten Aenderungen MUST ein Vorgang, der den aktuellen Stammbaum ersetzen oder verwerfen wuerde, eine Bestaetigung verlangen.

#### Scenario: Ungueltige Lebensdaten ablehnen
- **GIVEN** eine Person wird mit einem nicht erlaubten Datumsformat, einem ungueltigen Kalendertag oder einem sicher frueheren Todesdatum bearbeitet
- **WHEN** die Benutzerin die Aenderung speichert
- **THEN** wird das Formular mit einem konkreten Fehler markiert und die zuletzt gueltigen Personendaten bleiben erhalten

#### Scenario: Teilweise vergleichbare Lebensdaten bleiben zulaessig
- **GIVEN** das Geburtsdatum ist `1900-05` und das Todesdatum `1900-05-01`
- **WHEN** die Benutzerin die Person speichert
- **THEN** wird die Eingabe akzeptiert, weil der unbekannte Tag des Geburtsdatums keinen sicheren Verstoss beweist

#### Scenario: Ungueltiges Ehe-Startdatum ablehnen
- **GIVEN** eine bestehende oder neue Ehe enthaelt ein ungueltiges Startdatum
- **WHEN** die Benutzerin die Aenderung speichert
- **THEN** wird das Startdatumsfeld markiert und die zuletzt gueltige Beziehung bleibt erhalten

#### Scenario: Ungespeicherte Aenderungen bestaetigen
- **GIVEN** der aktuelle Stammbaum wurde seit dem letzten Import oder Export geaendert
- **WHEN** die Benutzerin eine andere Datei importieren oder den aktuellen Stammbaum verwerfen moechte
- **THEN** muss sie den Verlust der ungespeicherten Aenderungen ausdruecklich bestaetigen oder kann den Vorgang abbrechen
