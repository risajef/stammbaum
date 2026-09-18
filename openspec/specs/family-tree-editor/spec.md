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

Das System MUST jede Beziehung mit dem Status `explizit` oder `geschlussfolgert` speichern. Der Status ist beim Anlegen und spaeteren Bearbeiten aenderbar. Eine Beziehung darf eine einzelne optionale Quellen-URL tragen; eine angegebene Quelle MUST eine gueltige HTTP- oder HTTPS-URL sein. Jede Beziehung MUST außerdem eine Herkunft `manual`, `ocr-suggestion` oder `automatic-inference` tragen. Beim Einlesen älterer schemaVersion-1-Dateien ohne Herkunft MUSS eine Beziehung mit automatischer Herkunft als `automatic-inference`, jede andere als `manual` behandelt werden. Die Herkunft MUSS beim Export erhalten bleiben und in der Arbeitsfläche sowie der Detailansicht sichtbar unterscheidbar sein.

#### Scenario: Beziehung mit Quelle speichern
- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung
- **WHEN** sie eine HTTP- oder HTTPS-URL als Quelle angibt und den Status waehlt
- **THEN** werden URL und Status zusammen mit der Beziehung gespeichert und in deren Detailansicht angezeigt

#### Scenario: Beziehung ohne Quelle speichern

- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung ohne bekannte Quelle
- **WHEN** sie die Beziehung bestaetigt
- **THEN** wird die Beziehung ohne Quelle, aber mit dem gewählten Status und ihrer Herkunft gespeichert

#### Scenario: Ungueltige Quelle ablehnen
- **GIVEN** die Benutzerin gibt eine leere, fehlerhafte oder nicht als HTTP-/HTTPS-URL erkennbare Quellenangabe ein
- **WHEN** sie die Beziehung bestaetigt oder die Quelle speichert
- **THEN** wird die ungueltige Quellenangabe abgelehnt, die Beziehung bleibt unveraendert und der Fehler wird am Quellenfeld angezeigt

#### Scenario: Geschlussfolgerte Beziehung unterscheiden

- **GIVEN** eine Beziehung ist als `geschlussfolgert` gespeichert
- **WHEN** die Arbeitsfläche oder eine Beziehungsliste angezeigt wird
- **THEN** ist der Status ohne Öffnen eines versteckten Menüs visuell von `explizit` unterscheidbar und die Herkunft zusätzlich erkennbar

#### Scenario: Beziehung mit Herkunft speichern

- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung mit einer HTTP- oder HTTPS-URL und einer Herkunft
- **WHEN** sie die Beziehung bestaetigt und den Stammbaum speichert
- **THEN** werden URL, Status und Herkunft gemeinsam gespeichert und in der Detailansicht angezeigt

#### Scenario: Alte Datei ohne Herkunft bleibt kompatibel

- **GIVEN** eine gültige schemaVersion-1-YAML-Datei enthält noch kein Herkunftsfeld
- **WHEN** die Datei geöffnet wird
- **THEN** wird sie ohne Fehler geladen und die Beziehung erhält die kompatible Herkunft `manual` oder bei automatischer Herkunft `automatic-inference`

### Requirement: Beziehungen lassen sich direkt in der Arbeitsflaeche bedienen

Das System MUST eine direkte Interaktion anbieten, mit der die Benutzerin eine Person auswaehlt und eine zweite Person ueber sichtbare Handles verbindet, ohne interne IDs oder YAML bearbeiten zu muessen. Ein seitlicher Handle MUSS bei einer Person mit Geschlecht `Mann` rechts und bei einer Person mit Geschlecht `Frau` links sichtbar sein. Eine Verbindung zwischen dem rechten Handle eines Mannes und dem linken Handle einer Frau MUSS als Ehe klassifiziert werden, unabhaengig davon, in welche Richtung die Verbindung gezogen wird. Bei Personen ohne Geschlechtsangabe DARF kein seitlicher Ehe-Handle angeboten werden.

Eine Verbindung vom unteren Handle der ersten verbundenen Person zum oberen Handle der zweiten verbundenen Person MUSS als gerichtete Eltern-Kind-Beziehung klassifiziert werden. Die erste Person MUSS dabei als Elternteil und die zweite Person als Kind gespeichert werden. Fuer diese Klassifikation MUSS ausschliesslich die Art der verbundenen Handles gelten; die aktuelle Hoehe oder Position der Nodes DARF keine Rolle spielen. Das automatische Layout darf sich nach dem Speichern an die neue Beziehung anpassen.

Jede neue Verbindung MUSS vor der Uebernahme in einem Beziehunginspektor ausdruecklich bestaetigt werden. Der durch die Handles bestimmte Beziehungstyp MUSS dort bereits feststehen. Kommentar und Quelle MUESSEN optional bleiben. Auswahl, Bearbeitung und Detailansicht von Personen und Beziehungen muessen eindeutig erkennbar sein.

#### Scenario: Beziehung per direkter Verbindung erstellen
- **GIVEN** mindestens zwei Personen sind sichtbar
- **WHEN** die Benutzerin sie ueber passende seitliche oder vertikale Handles verbindet, den dadurch bestimmten Beziehungstyp prueft und die Beziehung bestaetigt
- **THEN** wird die entsprechende Ehe- oder Eltern-Kind-Beziehung angelegt und die neue Kante ist ausgewaehlt

#### Scenario: Ehe ueber seitliche Handles erstellen
- **GIVEN** eine Frau und ein Mann sind sichtbar und besitzen ihre seitlichen Handles
- **WHEN** die Benutzerin den linken Handle der Frau mit dem rechten Handle des Mannes verbindet, den vorgeschlagenen Beziehungstyp Ehe bestaetigt und speichert
- **THEN** wird genau eine Ehebeziehung angelegt, unabhaengig von der Ziehrichtung, und die neue Kante ist ausgewaehlt

#### Scenario: Eltern-Kind ueber vertikale Handles erstellen
- **GIVEN** zwei Personen sind sichtbar und koennen beliebig auf der Arbeitsflaeche positioniert sein
- **WHEN** die Benutzerin den unteren Handle der ersten Person mit dem oberen Handle der zweiten Person verbindet und die Beziehung speichert
- **THEN** wird die erste Person als Elternteil und die zweite Person als Kind gespeichert, unabhaengig davon, welche Person auf der Arbeitsflaeche hoeher angezeigt wird

#### Scenario: Beziehungstyp wird durch die Handles vorgegeben
- **GIVEN** die Benutzerin hat eine neue Verbindung ueber seitliche oder vertikale Handles begonnen
- **WHEN** der Beziehunginspektor angezeigt wird
- **THEN** zeigt er den durch die Handles bestimmten Typ Ehe beziehungsweise Eltern-Kind an, ohne dass die Benutzerin den Typ manuell auswaehlen muss

#### Scenario: Neue Beziehung ohne Kommentar und Quelle speichern
- **GIVEN** eine gueltige handle-basierte Verbindung wurde begonnen und der Beziehungstyp ist bestimmt
- **WHEN** die Benutzerin ohne Kommentar und ohne Quelle bestaetigt und speichert
- **THEN** wird die Beziehung gueltig ohne Kommentar und Quelle gespeichert

#### Scenario: Abgebrochene Verbindung veraendert keine Daten
- **GIVEN** die Benutzerin hat eine neue handle-basierte Verbindung begonnen
- **WHEN** sie den Beziehunginspektor verwirft oder die Verbindung kein gueltiges Ziel erreicht
- **THEN** wird keine Beziehung angelegt und der bisherige Stammbaum bleibt unveraendert

#### Scenario: Ungueltige oder doppelte handle-basierte Verbindung wird abgelehnt
- **GIVEN** die Benutzerin versucht eine Selbstbeziehung, eine unzulaessige Kombination seitlicher Handles, eine Ehe mit nicht komplementaeren Geschlechtern oder eine bereits bestehende Paarung anzulegen
- **WHEN** sie die Verbindung bestaetigt
- **THEN** wird die Beziehung nicht gespeichert, der bisherige Stammbaum bleibt unveraendert und ein verstaendlicher Fehler wird angezeigt

#### Scenario: Ausgewaehltes Objekt bearbeiten
- **GIVEN** eine Person oder Beziehung ist ausgewaehlt
- **WHEN** die Benutzerin die Detailansicht oeffnet
- **THEN** sieht sie die vollstaendigen bearbeitbaren Angaben, vorhandene Quelle und den Status und kann Aenderungen speichern oder verwerfen

### Requirement: Beziehungstypen sind auf der Arbeitsflaeche unterscheidbar

Das System MUST Ehe- und Eltern-Kind-Beziehungen auf der Arbeitsflaeche durch eine gemeinsame weiche `simplebezier`-Linienform sowie unterschiedliche Farben und sichtbare Typbezeichnungen unterscheidbar darstellen. Eine gespeicherte Eltern-Kind-Beziehung MUST am unteren Handle der Elternperson starten und am oberen Handle der Kindperson enden. Eine Eltern-Kind-Beziehung MUST weiterhin eindeutig in Richtung des Kindes zeigen; eine Ehe MUSS ihre seitlichen Ehe-Handles verwenden und DARF keinen Richtungspfeil zum Ehepartner anzeigen. Der Beziehungsstatus `inferred` MUSS unabhaengig vom Beziehungstyp zusaetzlich erkennbar bleiben.

#### Scenario: Ehe und Elternschaft haben unterschiedliche Kanten
- **GIVEN** eine Arbeitsflaeche enthaelt eine Ehe und eine Eltern-Kind-Beziehung
- **WHEN** beide Beziehungen angezeigt werden
- **THEN** unterscheiden sie sich ohne Oeffnen des Inspektors durch Farbe oder sichtbare Typbezeichnung

#### Scenario: Elternschaft zeigt zum Kind
- **GIVEN** eine gerichtete Eltern-Kind-Beziehung von A nach C ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** startet sie am unteren Handle von A, endet am oberen Handle von C und besitzt eine sichtbare Richtungsspitze auf der Seite von C

#### Scenario: Ehe hat keine kuenstliche Richtung
- **GIVEN** eine Ehe zwischen A und B ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** verbindet sie die seitlichen Ehe-Handles und besitzt keine Richtungsspitze, die einen Ehepartner als Kind oder Ziel auszeichnet

#### Scenario: Gespeicherte Beziehungen verwenden ihre semantischen Handles

- **GIVEN** ein Mann mit seitlichem Ehe-Handle und unterem Eltern-Handle ist mit anderen Personen verbunden
- **WHEN** die gespeicherten Beziehungen angezeigt werden
- **THEN** beginnt eine Eltern-Kind-Kante am unteren Handle und eine Ehe-Kante am seitlichen Ehe-Handle, ohne dass die Kantenart vom zufaelligen Handle-Reihenfolge im Node abhaengt

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

### Requirement: Das automatische Layout ordnet Familiengruppen deterministisch nach Layern an

Das System MUST die sichtbaren Personen eines Stammbaums anhand der bekannten Eltern-Kind-Beziehungen und Ehegruppen deterministisch auf Generationen-Layer verteilen. Die aelteste Person mit bekanntem Geburtsdatum MUSS als einzige globale Root auf Layer `0` dienen; bei gleichen oder nicht sicher vergleichbaren Geburtsdaten entscheidet die Reihenfolge der Personen im YAML. Eine bekannte Elternperson der Root MUSS auf dem vorherigen Layer liegen, ein Kind auf dem naechsten Layer. Die Root- und Layer-Informationen DUERFEN nicht als zusaetzliche Fachdaten im YAML gespeichert werden.

Alle Personen desselben Layers MUESSEN dieselbe horizontale Linie teilen. Eine Ehegruppe MUSS auf einem gemeinsamen Layer als zusammenhaengender horizontaler Block erscheinen. Innerhalb einer Ehegruppe MUSS ein Mann links von einer Frau stehen; eine durch Mehrfachheirat verbundene Gruppe MUSS als ein Block behandelt werden. Fuer eine direkte Eltern-Kind-Beziehung MUSS der Elternblock genau eine Ebene oberhalb des Kindes liegen, sofern die Beziehung nicht Teil eines DAGs mit unterschiedlich langen Elternpfaden ist; in diesem Fall MUSS jeder Elternblock lediglich oberhalb des Kindes liegen. Geschwisterbloecke MUESSEN auf derselben Ebene liegen. Ehepartner MUESSEN auf derselben Ebene liegen, sofern keine widerspruechliche Eltern-Kind-Bedingung dies unmoeglich macht.

Die horizontale Anordnung MUSS fuer jede Familiengruppe die tatsaechlich belegten Ebenenkonturen ihrer Kinder beruecksichtigen. Ein rechter Teilbaum DARF nur so weit verschoben werden, bis er auf einer tatsaechlich gemeinsam belegten Ebene mit einem bestehenden Teilbaum kollisionsfrei liegt; tiefe Ebenen DUERFEN keine zusaetzlichen Abstaende auf nicht belegten Elternzeilen erzwingen. Eltern MUESSEN oberhalb ihrer Kinder angeordnet werden.

Wenn ein Knoten in einem gerichteten azyklischen Beziehungsgraphen ueber mehrere Eltern-Kind-Wege erreichbar ist, MUSS seine Ebene so gewaehlt werden, dass er oberhalb aller Eltern liegt; bei mehreren moeglichen Ebenen wird die fruehestmoegliche gueltige Ebene verwendet. Die Layerberechnung MUSS von unten nach oben deterministische Teilbaumhoehen beruecksichtigen. Unverbundene Familiengruppen MUESSEN weiterhin deterministisch und ohne erfundene Geburtsdaten platziert werden.

Bei einer Personenerstellung MUSS der aktuelle React-Flow-Viewport unveraendert bleiben. Bereits sichtbare Nodes MUESSEN ihre gerenderte Position behalten, und der neue Node MUSS im Mittelpunkt des aktuellen Sichtbereichs erscheinen. Das System DARF den Kamerablick bei Personen- oder Beziehungsaenderungen nicht automatisch an den vollstaendigen Graphen anpassen; ein vollstaendiges `fitView` bleibt einem expliziten Dateiimport vorbehalten.

Nach dem Speichern einer Beziehung MUSS das automatische Layout weiterhin neu berechnet werden. Die neue Geometrie MUSS dabei am bisherigen Mittelpunkt der beiden verbundenen Personen verankert werden, damit die Verbindung im unveraenderten Sichtbereich weiter bearbeitbar bleibt.

#### Scenario: Aelteste bekannte Person bestimmt die Root

- **GIVEN** mehrere Personen mit bekannten und unbekannten Geburtsdaten sind im Stammbaum vorhanden
- **WHEN** das automatische Layout berechnet wird
- **THEN** liegt die Person mit dem fruehesten bekannten Geburtsdatum auf Layer `0`, bekannte Eltern dieser Person liegen auf Layer `-1` und ihre Kinder auf positiven Layern

#### Scenario: Gleichstand entscheidet sich nach YAML-Reihenfolge

- **GIVEN** zwei oder mehrere Personen haben dasselbe oder nicht sicher unterscheidbare aelteste Geburtsdatum
- **WHEN** das automatische Layout die Root bestimmt
- **THEN** wird die zuerst im YAML aufgefuehrte Person als Root verwendet

#### Scenario: Root und Layer werden nicht persistiert

- **GIVEN** ein Stammbaum wurde mit automatisch berechneten Layern dargestellt
- **WHEN** der Stammbaum exportiert wird
- **THEN** enthaelt das YAML keine Root- oder Layer-Felder, sondern weiterhin nur die bestehenden Personen- und Beziehungsdaten

#### Scenario: Alle Personen eines Layers liegen auf einer Linie

- **GIVEN** mehrere Familiengruppen gehoeren zur selben Generation
- **WHEN** das Layout berechnet wird
- **THEN** haben alle Nodes dieser Generation dieselbe vertikale Position

#### Scenario: Ehepartner und Mehrfachheirat bilden einen geordneten Block

- **GIVEN** ein Mann und eine Frau sind verheiratet und eine Person der Ehe hat eine weitere Ehe
- **WHEN** das Layout berechnet wird
- **THEN** bleiben alle durch die Ehen verbundenen Personen als ein zusammenhaengender Block auf demselben Layer, wobei Maenner links von Frauen stehen

#### Scenario: Eltern stehen oberhalb ihrer Kinder

- **GIVEN** eine Person oder Ehegruppe hat Eltern und eigene Kinder im Diagramm
- **WHEN** das Layout berechnet wird
- **THEN** liegen die Eltern auf dem vorherigen Layer, die Person oder Ehegruppe auf ihrem Layer und die Kinder auf nachfolgenden Layern

#### Scenario: Direkte Eltern liegen genau eine Ebene oberhalb

- **GIVEN** eine Familie ohne zusammenfuehrende alternative Elternpfade hat zwei Eltern und ein Kind
- **WHEN** das automatische Layout die Layer berechnet
- **THEN** liegen beide Elternbloecke genau eine Ebene oberhalb des Kindes

#### Scenario: Geschwister teilen eine Ebene

- **GIVEN** ein Elternblock hat mehrere Kinder ohne unterschiedliche Elternpfade
- **WHEN** das automatische Layout die Layer berechnet
- **THEN** liegen alle Geschwister auf derselben Ebene

#### Scenario: Direkte Eltern bleiben trotz tiefer Ehepartner-Ahnenlinie oberhalb

- **GIVEN** eine Ehegruppe besitzt direkte Eltern auf einer Ebene und ein Ehepartner zusaetzlich eine deutlich tiefere Ahnenlinie
- **WHEN** das Layout berechnet wird
- **THEN** liegt die Ehegruppe unter allen ihren Eltern, und kein Elternknoten wird durch die Layerberechnung unter das Kind verschoben

#### Scenario: Ueberlappende Ebenenkonturen verdraengen Geschwistergruppen horizontal

- **GIVEN** A und B sind verheiratet und haben die Kinder C, D, E und F, waehrend A die Geschwister G und H hat
- **WHEN** das Layout berechnet wird
- **THEN** werden C, D, E und F als zusammenhaengender Kinderbereich unter A und B angeordnet und die Teilbaeume werden nur auf tatsaechlich gemeinsam belegten Ebenen so weit verschoben, dass keine Nodes kollidieren

#### Scenario: Neue Person erscheint im aktuellen Sichtbereich

- **GIVEN** der Benutzer hat den Stammbaum verschoben oder gezoomt und mindestens eine Person ist sichtbar
- **WHEN** eine neue Person gespeichert wird
- **THEN** bleibt der Viewport unveraendert, bestehende sichtbare Nodes behalten ihre Position und die neue Person erscheint in der Mitte des Sichtbereichs

#### Scenario: Beziehungsspeicherung haelt die Verbindung bearbeitbar

- **GIVEN** zwei sichtbare Personen werden ueber ihre Handles verbunden
- **WHEN** die neue Beziehung gespeichert wird
- **THEN** bleibt der Viewport unveraendert, das automatische Layout wird angewendet und die verbundenen Personen bleiben im aktuellen Sichtbereich an ihrem bisherigen Mittelpunkt verankert

#### Scenario: Bottom-up-Layer halten alle Eltern oberhalb des Kindes

- **GIVEN** ein gerichteter azyklischer Stammbaum enthaelt mehrere Wege von der Root zu einem Nachfahren
- **WHEN** das automatische Layout die Layer berechnet
- **THEN** erhaelt der Nachfahre die fruehestmoegliche Ebene unterhalb aller Eltern, der laengere Elternpfad liegt genau eine Ebene darueber und ein kuerzerer Alternativpfad darf weiter oben liegen

### Requirement: Personen-Knoten unterscheiden Geschlecht und frühes Todesalter durch Farben

Die Arbeitsfläche MUST Personen-Knoten anhand des bekannten Geschlechts mit zwei unterschiedlichen Grundfarben darstellen. Frauen MUST einen Korallton und Männer MUST einen Türkiston erhalten. Wenn die bekannten Jahreskomponenten von Geburt und Tod eine Differenz kleiner als 18 ergeben, MUSS der Knoten eine hellere Variante seiner Geschlechtsfarbe erhalten. Fehlt das Geburts- oder Todesjahr oder ist es nicht sicher auswertbar, MUSS die Person wie volljährig dargestellt werden. Personen ohne Geschlechtsangabe MUESSEN neutral bleiben.

#### Scenario: Frauen und Männer erhalten unterschiedliche Grundfarben

- **GIVEN** eine Frau und ein Mann sind auf der Arbeitsfläche sichtbar und für beide ist kein Todesalter unter 18 Jahren ableitbar
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhält der Frauen-Knoten die Korall-Grundfarbe und der Männer-Knoten die Türkis-Grundfarbe

#### Scenario: Minderjährige erhalten eine hellere Geschlechtsfarbe

- **GIVEN** eine Frau und ein Mann haben jeweils ein bekanntes Geburts- und Todesjahr mit einer Differenz von 17
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhalten beide Knoten jeweils eine hellere Variante ihrer eigenen Geschlechtsfarbe

#### Scenario: Genau 18 Jahre gelten als volljährig

- **GIVEN** eine Person hat ein bekanntes Geburtsjahr und ein Todesjahr genau 18 Jahre später
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhält der Knoten die normale Geschlechtsfarbe und nicht die Minderjährigen-Variante

#### Scenario: Unbekannte Lebensdaten gelten als volljährig

- **GIVEN** das Geburtsjahr oder das Todesjahr einer Person fehlt oder ist nicht sicher auswertbar
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhält die Person die normale Geschlechtsfarbe und nicht die Minderjährigen-Variante

#### Scenario: Unbekanntes Geschlecht bleibt neutral

- **GIVEN** eine Person ohne Geschlechtsangabe ist auf der Arbeitsfläche sichtbar
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** bleibt der Knoten neutral eingefärbt und erhält keine Frauen- oder Männerfarbe

#### Scenario: Farbgebung verändert keine Fachdaten

- **GIVEN** ein Stammbaum enthält Personen und Beziehungen mit beliebigen Lebensdaten
- **WHEN** die Arbeitsfläche mit der Farbgebung dargestellt wird
- **THEN** bleiben Personen, Beziehungen, IDs und die exportierbaren Grunddaten unverändert

### Requirement: Doppelte Personen koennen bewusst fusioniert werden

Das System MUST eine bestehende Person aus dem Personeninspektor heraus fuer eine Fusion markieren und anschliessend eine zweite vorhandene Person ueber die Arbeitsflaeche oder die Personensuche auswaehlen lassen. Die zuerst ausgewaehlte Person MUST mit ihrer ID bestehen bleiben; die zweite Person MUST nach erfolgreicher Bestaetigung entfernt sein. Vor der Ausfuehrung MUSS eine sichtbare Warnung darauf hinweisen, dass die Fusion destruktiv und nicht rueckgaengig zu machen ist. Eine abgebrochene oder abgelehnte Fusion MUST den bisherigen Stammbaum unveraendert lassen.

#### Scenario: Zwei Personen erfolgreich fusionieren

- **GIVEN** die Benutzerin hat Person A ausgewaehlt und die Fusion gestartet
- **WHEN** sie Person B als zweite Person auswaehlt und die destruktive Fusion bestaetigt
- **THEN** bleibt Person A mit ihrer bisherigen ID als eine Person erhalten, Person B ist nicht mehr im Dokument vorhanden und der Stammbaum wird als ungespeicherte Aenderung markiert

#### Scenario: Fusion ueber die Arbeitsflaeche oder Suche starten

- **GIVEN** Person A ist ausgewaehlt und mehrere Personen sind im Dokument vorhanden
- **WHEN** die Benutzerin die Fusion startet und eine andere sichtbare Person per Node oder Personensuche auswaehlt
- **THEN** wird diese Person als Fusionspartner angezeigt und erst nach der expliziten Bestaetigung als zweite Person verwendet

#### Scenario: Fusion abbrechen

- **GIVEN** eine zweite Person ist fuer die Fusion ausgewaehlt und die Warnung wird angezeigt
- **WHEN** die Benutzerin die Warnung abbricht
- **THEN** bleiben beide Personen, alle Beziehungen und der bisherige Speicherstatus unveraendert

### Requirement: Personendaten werden konfliktbewusst zusammengefuehrt

Bei einer Fusion MUST das System die Personendaten feldweise zusammenfuehren. Vorhandene Vor- und Nachnamen sowie vorhandene Geschlechtsangaben MUESSEN nach Normalisierung uebereinstimmen; unterschiedliche vorhandene Werte MUESSEN die Fusion ablehnen. Bei Geschlecht, Geburtsdatum und Todesdatum MUSS ein fehlender Wert durch den vorhandenen Wert der anderen Person ergaenzt werden. Bei zwei kompatiblen Teil-Datumswerten MUSS der praezisere Wert uebernommen werden, wenn alle gemeinsam bekannten Komponenten uebereinstimmen; widerspruechliche Datumswerte MUESSEN abgelehnt werden. Beide unterschiedlichen nichtleeren Kommentare MUESSEN in der Reihenfolge der zuerst und danach ausgewaehlten Person erhalten bleiben. Die Positionen der beiden Personen duerfen keinen Datenkonflikt erzeugen.

#### Scenario: Fehlende Lebensdaten werden ergaenzt

- **GIVEN** Person A hat nur ein Geburtsdatum und Person B nur ein Todesdatum
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** besitzt die verbleibende Person beide Lebensdaten

#### Scenario: Praeziseres Teildatum wird uebernommen

- **GIVEN** eine Person hat das Geburtsjahr `1900` und die andere das kompatible Geburtsdatum `1900-05-20`
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** wird `1900-05-20` als Geburtsdatum der verbleibenden Person gespeichert

#### Scenario: Widerspruechliche Personendaten blockieren die Fusion

- **GIVEN** beide Personen haben fuer mindestens ein Pflicht- oder Lebensdatenfeld unterschiedliche, nicht kompatible vorhandene Werte
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** wird ein verstaendlicher Konflikt angezeigt, keine Person entfernt und keine Beziehung oder Position geaendert

#### Scenario: Kommentare beider Personen bleiben erhalten

- **GIVEN** beide Personen haben unterschiedliche nichtleere Kommentare
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** enthaelt der Kommentar der verbleibenden Person beide Kommentare in der Reihenfolge der Auswahl; ein identischer Kommentar wird nicht doppelt gespeichert

### Requirement: Beziehungen werden bei der Fusion konsolidiert

Nach einer erfolgreichen Fusion MUST jede Ehe- und Eltern-Kind-Beziehung, deren `fromId` oder `toId` auf eine der beiden Personen zeigt, auf die ID der verbleibenden Person verweisen. Beziehungen, die dadurch dieselben Endpunkte und denselben Typ erhalten, MUESSEN zu einer Beziehung konsolidiert werden. Beziehungen, die dadurch zu einer Selbstbeziehung werden, MUESSEN entfernt werden. Nach der Umschreibung MUSS das System die eindeutigen Eltern pro Kind zaehlen; wenn ein Kind dadurch mehr als zwei Eltern hat, MUSS die Fusion abgelehnt werden. Explizite und automatisch abgeleitete Eltern-Kind-Beziehungen MUESSEN bei dieser Pruefung beruecksichtigt werden. Sichere automatische Beziehungen MUESSEN im resultierenden Dokument weiterhin korrekt abgeleitet und ungueltig gewordene automatische Beziehungen entfernt werden.

#### Scenario: Beziehungen in beide Richtungen zeigen auf die verbleibende Person

- **GIVEN** eine der beiden Personen ist Elternteil oder Kind in einer Eltern-Kind-Beziehung und an einer Ehe beteiligt
- **WHEN** die Fusion erfolgreich abgeschlossen wird
- **THEN** verweisen alle betroffenen Beziehungsendpunkte auf die verbleibende Person und keine Beziehung verweist mehr auf den entfernten Datensatz

#### Scenario: Gemeinsame Kinder erzeugen keine doppelte Elternkante

- **GIVEN** Person A und Person B sind beide als Elternteil desselben Kindes erfasst
- **WHEN** die Benutzerin A und B fusioniert
- **THEN** bleibt fuer dieses Kind genau eine Eltern-Kind-Beziehung zur verbleibenden Person bestehen und die Fusion ist zulaessig

#### Scenario: Gemeinsamer Ehepartner erzeugt keine doppelte Ehe

- **GIVEN** Person A und Person B haben jeweils eine Ehebeziehung mit derselben dritten Person
- **WHEN** die Benutzerin A und B fusioniert
- **THEN** bleibt genau eine Ehebeziehung zwischen der verbleibenden Person und der dritten Person bestehen

#### Scenario: Mehr als zwei Eltern blockieren die Fusion atomar

- **GIVEN** die Umschreibung der Beziehungen wuerde fuer ein Kind drei oder mehr eindeutige Eltern ergeben
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** wird die Fusion mit einem konkreten Fehler abgelehnt und der gesamte vorherige Dokumentzustand bleibt unveraendert

#### Scenario: Selbstbeziehungen werden bedeutungslos entfernt

- **GIVEN** eine Beziehung zwischen den beiden zu fusionierenden Personen wuerde nach der Umschreibung auf dieselbe Person zeigen
- **WHEN** die Benutzerin die Fusion bestaetigt und die Elternanzahlgrenze nicht verletzt wird
- **THEN** wird diese Selbstbeziehung entfernt und die verbleibende Person wird ohne diese Kante gespeichert

### Requirement: Die Arbeitsflaeche berechnet nach der Fusion das Layout neu

Nach einer erfolgreichen Fusion MUST die Arbeitsflaeche die Positionen aller sichtbaren Personen aus dem resultierenden Familiengraphen mit dem bestehenden automatischen Layout neu berechnen. Die Position der entfernten Person darf nicht als feste Position in den neuen Zustand uebernommen werden. Die verbleibende Person MUSS nach Abschluss weiterhin ausgewaehlt sein und der YAML-SchemaVersion-1-Zustand MUSS speicherbar bleiben.

#### Scenario: Resultierender Familiengraph wird neu angeordnet

- **GIVEN** die beiden Personen haben vor der Fusion unterschiedliche sichtbare Positionen und mindestens eine ihrer Beziehungen wird umgeschrieben
- **WHEN** die Fusion erfolgreich abgeschlossen wird
- **THEN** wird die Arbeitsflaeche anhand des resultierenden Familiengraphen neu angeordnet und die verbleibende Person bleibt ausgewaehlt

#### Scenario: Erfolgreiche Fusion bleibt speicher- und importierbar

- **GIVEN** eine Fusion wurde erfolgreich abgeschlossen
- **WHEN** die Benutzerin den Stammbaum als YAML speichert und wieder oeffnet
- **THEN** enthaelt die Datei nur die verbleibende Person, die konsolidierten Beziehungen und die fusionierten Personendaten in einem gueltigen SchemaVersion-1-Dokument

### Requirement: Genealogische Ebenen folgen einem Root-relativen DAG

Die Arbeitsflaeche MUST die erste Person im Dokument als Root-Komponente auf Ebene 0 verwenden und die Ebenen aller erreichbaren Familienkomponenten durch das gerichtete Eltern-Kind-DAG sowie die umgekehrte Traversierung fuer Vorfahren bestimmen. Fuer jede Eltern-Kind-Kante MUST die Kindkomponente unter ihren Eltern liegen und sie SOLLTE genau eine Ebene tiefer liegen. Wenn unterschiedlich lange DAG-Pfade eine exakte Ein-Ebenen-Zuordnung verhindern, DARF der Abstand zwei Ebenen betragen, MUST aber fuer normale azyklische Daten auf hoechstens zwei Ebenen begrenzt bleiben. Eine Kindkomponente MUST nicht wegen eines laengeren Seitenastes kuenstlich bis zur tiefsten Blattgeneration verschoben werden. Ehepartner und gemeinsame Eltern MUST weiterhin auf derselben Ebene ausgerichtet werden. Fuer voneinander getrennte Graphgruppen MUSS ein deterministischer lokaler Anker verwendet werden. Geburtsdaten koennen weiterhin fuer die horizontale Reihenfolge verwendet werden, duerfen aber die relationale Ebenenzuweisung nicht durch eine chronologische Zeitleiste ersetzen. Fehlende Geburtsdaten MUST die Ebenenzuweisung nicht unberechenbar machen.

#### Scenario: Erste YAML-Person definiert die Root-Ebene

- **GIVEN** die erste Person im Dokument ist nicht die aelteste bekannte Person und hat einen Elternteil sowie ein Kind
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegt die erste Person auf Ebene 0, ihr Elternteil auf Ebene -1 und ihr Kind auf Ebene 1

#### Scenario: Direkte Eltern werden auf die vorherige Generation gelegt

- **GIVEN** eine Person hat direkte Eltern, deren Pfade gleich oder nahezu gleich lang sind
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegen die Eltern auf der direkt vorherigen Ebene; bei einem unvermeidbaren Pfadkonflikt liegt keine Eltern-Kind-Kante mehr als zwei Ebenen auseinander

#### Scenario: Flacher Seitenast bleibt ueber einer tieferen Blattgeneration

- **GIVEN** zwei Seitenaste gehoeren zum selben Familiengraphen, ein Blatt liegt nach zwei Eltern-Kind-Schritten und ein anderes nach dreizehn Schritten
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegt das Blatt des flacheren Astes auf einer hoeheren Ebene als das Blatt des tieferen Astes und wird nicht kuenstlich an dessen tiefste Ebene verschoben

#### Scenario: Eltern-Kind-Topologie bestimmt die vertikale Reihenfolge

- **GIVEN** eine Kindkomponente hat eine oder mehrere Elternkomponenten und die Daten bilden einen gerichteten azyklischen Graphen
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegt jede Elternkomponente oberhalb der Kindkomponente, waehrend Ehepartner und gemeinsam erfasste Eltern auf einer gemeinsamen Ebene bleiben

#### Scenario: Fehlende Geburtsdaten beeinflussen die Generationsebene nicht

- **GIVEN** ein Seitenast enthaelt Personen ohne Geburtsdatum und ein anderer Ast enthaelt bekannte Geburtsdaten
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** werden die Ebenen aus den vorhandenen Beziehungen deterministisch berechnet und nicht wegen fehlender Geburtsdaten zusammengelegt oder verworfen

### Requirement: Eine zusätzliche Federungsansicht zeigt den aktuellen Anzeigegraphen

Die Arbeitsfläche MUST neben der bestehenden bearbeitbaren Übersicht eine zusätzliche Federungsansicht anbieten. Die Federungsansicht MUST denselben aktuell sichtbaren Anzeigegraphen wie die Übersicht verwenden, einschließlich Suche, Ansichtsfiltern, Beziehungen und aktiver virtueller Kindergruppen. Die bestehende Übersicht MUST standardmäßig aktiv bleiben.

#### Scenario: Zwischen Übersicht und Federungsansicht wechseln

- **GIVEN** die Arbeitsfläche ist geöffnet
- **WHEN** die Benutzerin die Federungsansicht auswählt
- **THEN** wird die zusätzliche Ansicht sichtbar und die bestehende Übersicht ist nicht gleichzeitig als zweite Arbeitsfläche gerendert

#### Scenario: Filter gelten auch in der Federungsansicht

- **GIVEN** ein Stammbaum enthält mehrere Personen und ein Ansichtsfilter ist aktiv
- **WHEN** die Benutzerin die Federungsansicht öffnet
- **THEN** enthält der Anzeigegraph genau die Personen, virtuellen Kindergruppen und Beziehungen, die auch in der gefilterten Übersicht sichtbar wären

#### Scenario: Die Simulation verteilt den Anzeigegraphen

- **GIVEN** die Federungsansicht enthält mindestens zwei verbundene Nodes
- **WHEN** die Simulation nach ihrer Initialisierung läuft
- **THEN** werden die Nodes durch ihre Beziehungen und räumliche Kräfte in eine sichtbare, nicht vollständig überlappende Anordnung bewegt

#### Scenario: Leere oder leer gefilterte Anzeige

- **GIVEN** das Dokument enthält keine Personen oder die aktiven Filter liefern keine sichtbaren Personen
- **WHEN** die Benutzerin die Federungsansicht öffnet
- **THEN** bleibt die Ansicht ohne Fehler bedienbar und zeigt den bestehenden Leerzustand an

### Requirement: Nodes der Federungsansicht können flüchtig verschoben werden

Die Federungsansicht MUST das direkte Verschieben sichtbarer Personen- und virtueller Gruppenknoten mit der Maus erlauben. Während des Ziehens MUST der betroffene Node der Maus folgen. Nach dem Loslassen MUSS seine Position für die aktuelle Federungsansicht als manuelle Position erhalten bleiben, während die übrigen Nodes weiter simuliert werden. Diese Positionen MUST ausschließlich flüchtiger Ansichtszustand sein.

#### Scenario: Node per Maus verschieben

- **GIVEN** die Federungsansicht zeigt einen Personenknoten
- **WHEN** die Benutzerin den Knoten mit der Maus an eine andere Stelle zieht und loslässt
- **THEN** bleibt der Knoten an der neuen Position sichtbar und die übrigen sichtbaren Nodes können sich weiter durch die Simulation anpassen

#### Scenario: Force-Positionen ändern keine Fachdaten

- **GIVEN** ein Stammbaum ist geöffnet und die Federungsansicht zeigt Nodes
- **WHEN** die Benutzerin einen Node verschiebt und anschließend speichert oder exportiert
- **THEN** bleibt das `FamilyTreeDocument` unverändert, der Dirty-State unverändert und der Export frei von den flüchtigen Force-Positionen

#### Scenario: Veraltete Force-Positionen werden nicht wiederverwendet

- **GIVEN** die Benutzerin hat einen Node in der Federungsansicht verschoben
- **WHEN** sie einen Filter oder das geöffnete Dokument so ändert, dass dieser Node nicht mehr sichtbar oder nicht mehr vorhanden ist
- **THEN** wird seine alte Force-Position nicht auf einen anderen Node angewendet und neu sichtbare Nodes erhalten gültige Startpositionen

### Requirement: Die Federungsansicht ist für Stammbauänderungen schreibgeschützt

Die Federungsansicht MUST die fachlichen Daten des Stammbaums lesend darstellen. In dieser Ansicht MUST die Benutzerin keine Person oder Beziehung anlegen, bearbeiten oder löschen, keine Nodes verbinden und keine virtuellen Kindergruppen ein- oder auffächern können. Das Umschalten der Ansicht und das Verschieben von Nodes bleiben erlaubt und ändern den fachlichen Dirty-State nicht.

#### Scenario: Bearbeitungsaktionen sind im Force-View nicht verfügbar

- **GIVEN** die Federungsansicht ist aktiv
- **WHEN** die Benutzerin die Arbeitsfläche und den Detailbereich betrachtet
- **THEN** sind Aktionen zum Anlegen, Bearbeiten, Löschen, Verbinden, Zusammenführen sowie Ein- und Auffächern nicht erreichbar oder deaktiviert

#### Scenario: Wechsel zurück aktiviert die bestehende Bearbeitung

- **GIVEN** die Federungsansicht ist aktiv und enthält nur flüchtige Node-Positionen
- **WHEN** die Benutzerin zur Übersicht zurückwechselt
- **THEN** ist die bestehende bearbeitbare Ansicht wieder verfügbar und die fachlichen Daten entsprechen unverändert dem Zustand vor dem Wechsel
