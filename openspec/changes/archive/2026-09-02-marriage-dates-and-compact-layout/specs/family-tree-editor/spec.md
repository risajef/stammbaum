## MODIFIED Requirements

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
- **GIVEN** die Uebersicht der Arbeitsflaeche ist sichtbar
- **WHEN** die Benutzerin den `+`-Button zum Anlegen einer Person auswaehlt
- **THEN** wird der bestehende Personeninspektor zum Anlegen geoeffnet, ohne dass ein separates Werkzeugfenster angezeigt wird

#### Scenario: Neue Person erscheint im aktuellen Sichtbereich
- **GIVEN** die Benutzerin betrachtet einen beliebigen Ausschnitt der Arbeitsflaeche
- **WHEN** sie eine neue Person speichert
- **THEN** erscheint die neue Person zentriert im aktuell sichtbaren Arbeitsbereich und nicht an einer festen Dokumentposition

## ADDED Requirements

### Requirement: Ehen besitzen einen Zeitraum mit implizitem Ende

Das System MUST fuer jede Ehe ein optionales Startdatum in den Formaten `YYYY`, `YYYY-MM` oder `YYYY-MM-DD` erfassen und die eingegebene Genauigkeit erhalten. Das Ende einer Ehe DARF nicht als eigenes editierbares Datum gespeichert werden, sondern MUSS aus dem Tod der Ehepartner abgeleitet werden: Wenn beide Todesdaten vorhanden und sicher vergleichbar sind, ist das frueheste Datum das implizite Ende; andernfalls bleibt das Ende offen bzw. unbestimmt. Bestehende schemaVersion-1-Dateien ohne Startdatum MUESSEN gueltig bleiben.

#### Scenario: Ehebeginn bleibt beim Roundtrip erhalten
- **GIVEN** eine Ehe wird mit dem Startdatum `1880-05` angelegt
- **WHEN** der Stammbaum exportiert und wieder importiert wird
- **THEN** enthaelt die Ehe weiterhin exakt `1880-05` als Startdatum

#### Scenario: Todesdatum eines Ehepartners beendet die Ehe implizit
- **GIVEN** eine Ehe hat ein Startdatum und beide Ehepartner haben vollstaendige Todesdaten
- **WHEN** die Ehe in der Detailansicht betrachtet wird
- **THEN** wird das fruehere Todesdatum als nicht editierbares implizites Ende angezeigt

#### Scenario: Unsicheres Eheende bleibt offen
- **GIVEN** mindestens ein Todesdatum eines Ehepartners fehlt oder die bekannten Datumskomponenten lassen keinen sicheren frueheren Tod erkennen
- **WHEN** die Ehe in der Detailansicht betrachtet wird
- **THEN** wird kein kuenstliches oder unsicheres Enddatum gespeichert oder angezeigt

#### Scenario: Ungueltiger Ehebeginn wird abgelehnt
- **GIVEN** die Benutzerin gibt ein ungueltiges Startdatum wie `1900-02-29` ein
- **WHEN** sie die Ehe speichert
- **THEN** wird das Startdatum mit einem konkreten Fehler markiert und die bestehende Beziehung bleibt unveraendert

### Requirement: Beziehungstypen sind auf der Arbeitsflaeche unterscheidbar

Das System MUST Ehe- und Eltern-Kind-Beziehungen auf der Arbeitsflaeche durch eine gemeinsame weiche `simplebezier`-Linienform sowie unterschiedliche Farben und sichtbare Typbezeichnungen unterscheidbar darstellen. Eine Eltern-Kind-Beziehung MUST weiterhin eindeutig in Richtung des Kindes zeigen; eine Ehe DARF keinen Richtungspfeil zum Ehepartner anzeigen. Der Beziehungsstatus `inferred` MUSS unabhaengig vom Beziehungstyp zusaetzlich erkennbar bleiben.

#### Scenario: Ehe und Elternschaft haben unterschiedliche Kanten
- **GIVEN** eine Arbeitsflaeche enthaelt eine Ehe und eine Eltern-Kind-Beziehung
- **WHEN** beide Beziehungen angezeigt werden
- **THEN** unterscheiden sie sich ohne Oeffnen des Inspektors durch Form, Farbe oder sichtbare Typbezeichnung

#### Scenario: Elternschaft zeigt zum Kind
- **GIVEN** eine gerichtete Eltern-Kind-Beziehung von A nach C ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** besitzt sie eine sichtbare Richtungsspitze auf der Seite von C

#### Scenario: Ehe hat keine kuenstliche Richtung
- **GIVEN** eine Ehe zwischen A und B ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** besitzt sie keine Richtungsspitze, die einen Ehepartner als Kind oder Ziel auszeichnet

## MODIFIED Requirements

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

## MODIFIED Requirements

### Requirement: Eingaben und ungespeicherte Aenderungen werden sicher behandelt

Das System MUST fehlerhafte Eingaben vor dem Speichern sichtbar markieren und darf bei einem Validierungsfehler keine gueltigen bestehenden Daten veraendern. Geburts-, Todes- und Ehe-Startdaten muessen dem Format `YYYY`, `YYYY-MM` oder `YYYY-MM-DD` entsprechen und gueltige Kalendertage enthalten; wenn zwei Daten mit den bekannten Komponenten sicher vergleichbar sind, darf eine bekannte Endzeit nicht vor dem zugehoerigen Start liegen. Bei ungespeicherten Aenderungen MUST ein Vorgang, der den aktuellen Stammbaum ersetzen oder verwerfen wuerde, eine Bestaetigung verlangen.

#### Scenario: Ungueltige Lebensdaten ablehnen
- **GIVEN** eine Person wird mit einem nicht erlaubten Datumsformat, einem ungueltigen Kalendertag oder einem sicher frueheren Todesdatum bearbeitet
- **WHEN** die Benutzerin die Aenderung speichert
- **THEN** wird das Formular mit einem konkreten Fehler markiert und die zuletzt gueltigen Personendaten bleiben erhalten

#### Scenario: Ungueltiges Ehe-Startdatum ablehnen
- **GIVEN** eine bestehende oder neue Ehe enthaelt ein ungueltiges Startdatum
- **WHEN** die Benutzerin die Aenderung speichert
- **THEN** wird das Startdatumsfeld markiert und die zuletzt gueltige Beziehung bleibt erhalten

#### Scenario: Teilweise vergleichbare Lebensdaten bleiben zulaessig
- **GIVEN** das Geburtsdatum ist `1900-05` und das Todesdatum `1900-05-01`
- **WHEN** die Benutzerin die Person speichert
- **THEN** wird die Eingabe akzeptiert, weil der unbekannte Tag des Geburtsdatums keinen sicheren Verstoss beweist

#### Scenario: Ungespeicherte Aenderungen bestaetigen
- **GIVEN** der aktuelle Stammbaum wurde seit dem letzten Import oder Export geaendert
- **WHEN** die Benutzerin eine andere Datei importieren oder den aktuellen Stammbaum verwerfen moechte
- **THEN** muss sie den Verlust der ungespeicherten Aenderungen ausdruecklich bestaetigen oder kann den Vorgang abbrechen
