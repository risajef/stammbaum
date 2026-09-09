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
