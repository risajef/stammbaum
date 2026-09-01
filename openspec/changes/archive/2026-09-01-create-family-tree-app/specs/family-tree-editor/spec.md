## Purpose

Diese Capability ermoeglicht es, genealogische Personen und ihre belegten oder geschlussfolgerten Familienbeziehungen visuell zu erfassen, zu bearbeiten und als portable YAML-Datei zu erhalten.

## ADDED Requirements

### Requirement: Personen koennen erfasst und bearbeitet werden

Das System MUST Personen mit einem Vor- und Nachnamen anlegen koennen. Geschlecht darf als Frau oder Mann angegeben werden und ist fuer die Erstellung einer Ehebeziehung erforderlich; Geburts- und Todesjahr sind optional. Eine bestehende Person MUST ohne Verlust ihrer Beziehungen bearbeitbar sein.

#### Scenario: Person mit vollstaendigen Angaben anlegen
- **GIVEN** die Arbeitsflaeche ist geoeffnet
- **WHEN** die Benutzerin eine Person mit Vorname, Nachname, Geschlecht, Geburtsjahr und Todesjahr anlegt und bestaetigt
- **THEN** erscheint genau eine neue Person mit diesen Angaben auf der Arbeitsflaeche

#### Scenario: Unbekannte Lebensdaten leer lassen
- **GIVEN** die Benutzerin legt eine Person ohne bekanntes Geburts- oder Todesjahr an
- **WHEN** sie die Person bestaetigt
- **THEN** wird die Person mit leeren Lebensdaten gespeichert und als gueltig angezeigt

#### Scenario: Person bearbeiten ohne Beziehungen zu verlieren
- **GIVEN** eine Person hat mindestens eine Ehe- oder Eltern-Kind-Beziehung
- **WHEN** die Benutzerin den Nachnamen oder ein Lebensjahr aendert und speichert
- **THEN** wird die Angabe aktualisiert und jede bestehende Beziehung bleibt erhalten

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

### Requirement: Stammbaeume werden als YAML-Datei importiert und exportiert

Das System MUST den vollstaendigen Stammbaum als eine versionierte YAML-Datei exportieren und eine gueltige Datei wieder importieren koennen. Der Roundtrip MUST Personen, stabile Identitaeten, Beziehungstypen, Richtung, Quellen und Schlussfolgerungsstatus erhalten. Eine Datenbank oder ein Server MUST fuer das Arbeiten mit einer Datei nicht erforderlich sein.

#### Scenario: Gueltigen Stammbaum exportieren und wieder importieren
- **GIVEN** ein Stammbaum enthaelt Personen sowie explizite und geschlussfolgerte Beziehungen mit und ohne Quellen
- **WHEN** die Benutzerin ihn als YAML exportiert und diese Datei anschliessend importiert
- **THEN** entspricht der importierte Stammbaum dem vorherigen Zustand einschliesslich aller Personendaten und Beziehungsmetadaten

#### Scenario: YAML-Validierungsfehler beim Import
- **GIVEN** eine ausgewaehlte YAML-Datei ist syntaktisch ungueltig oder verletzt die erforderliche Struktur, etwa durch unbekannte Personenreferenzen oder eine ungueltige URL
- **WHEN** die Benutzerin den Import startet
- **THEN** wird die Datei abgelehnt, ein verstaendlicher Fehler angezeigt und der aktuell geoeffnete Stammbaum nicht teilweise ueberschrieben

#### Scenario: Datei kann ohne erweiterte Dateisystem-API genutzt werden
- **GIVEN** der Browser stellt keine direkte Dateisystem-API zur Verfuegung
- **WHEN** die Benutzerin einen Stammbaum speichern oder oeffnen moechte
- **THEN** kann sie die YAML-Datei trotzdem herunterladen bzw. ueber eine lokale Dateiauswahl laden

### Requirement: Eingaben und ungespeicherte Aenderungen werden sicher behandelt

Das System MUST fehlerhafte Eingaben vor dem Speichern sichtbar markieren und darf bei einem Validierungsfehler keine gueltigen bestehenden Daten veraendern. Jahresangaben muessen ganze Jahreszahlen sein; wenn beide Lebensdaten bekannt sind, darf das Todesjahr nicht vor dem Geburtsjahr liegen. Bei ungespeicherten Aenderungen MUST ein Vorgang, der den aktuellen Stammbaum ersetzen oder verwerfen wuerde, eine Bestaetigung verlangen.

#### Scenario: Ungueltige Lebensdaten ablehnen
- **GIVEN** eine Person wird mit einem nicht-ganzzahligen Jahr oder einem Todesjahr vor dem Geburtsjahr bearbeitet
- **WHEN** die Benutzerin die Aenderung speichert
- **THEN** wird das Formular mit einem konkreten Fehler markiert und die zuletzt gueltigen Personendaten bleiben erhalten

#### Scenario: Ungespeicherte Aenderungen bestaetigen
- **GIVEN** der aktuelle Stammbaum wurde seit dem letzten Import oder Export geaendert
- **WHEN** die Benutzerin eine andere Datei importieren oder den aktuellen Stammbaum verwerfen moechte
- **THEN** muss sie den Verlust der ungespeicherten Aenderungen ausdruecklich bestaetigen oder kann den Vorgang abbrechen