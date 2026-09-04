## MODIFIED Requirements

### Requirement: Personen koennen erfasst und bearbeitet werden

Das System MUST Personen mit einem Vor- und Nachnamen anlegen koennen. Geschlecht darf als Frau oder Mann angegeben werden und ist fuer die Erstellung einer Ehebeziehung erforderlich; Geburts- und Todesdaten sind optional und duerfen als Jahr, Jahr-Monat oder vollstaendiges Datum angegeben werden. Eine bestehende Person MUST ohne Verlust ihrer Beziehungen bearbeitbar sein.

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

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Stammbaeume werden als YAML-Datei importiert und exportiert

Das System MUST den vollstaendigen Stammbaum als eine versionierte YAML-Datei exportieren und eine gueltige Datei wieder importieren koennen. Der Roundtrip MUST Personen, stabile Identitaeten, Teil-Datumswerte oder leere Lebensdaten, Beziehungstypen, Richtung, Quellen und Schlussfolgerungsstatus erhalten. Eine Datenbank oder ein Server MUST fuer das Arbeiten mit einer Datei nicht erforderlich sein.

#### Scenario: Gueltigen Stammbaum exportieren und wieder importieren
- **GIVEN** ein Stammbaum enthaelt Personen mit `YYYY`, `YYYY-MM` und `YYYY-MM-DD` sowie explizite und geschlussfolgerte Beziehungen
- **WHEN** die Benutzerin ihn als YAML exportiert und diese Datei anschliessend importiert
- **THEN** entspricht der importierte Stammbaum dem vorherigen Zustand einschliesslich der Genauigkeit aller Personendaten und Beziehungsmetadaten

#### Scenario: YAML-Validierungsfehler beim Import
- **GIVEN** eine ausgewaehlte YAML-Datei ist syntaktisch ungueltig oder enthaelt ein ungueltiges Geburts- oder Todesdatum
- **WHEN** die Benutzerin den Import startet
- **THEN** wird die Datei abgelehnt, ein verstaendlicher Fehler angezeigt und der aktuell geoeffnete Stammbaum nicht teilweise ueberschrieben

#### Scenario: Alte Jahreswerte bleiben importierbar
- **GIVEN** eine schemaVersion-1-YAML-Datei enthaelt eine numerische Angabe `birthYear: 1900`
- **WHEN** die Benutzerin die Datei importiert
- **THEN** wird die Angabe als `1900` ohne zusaetzliche unbekannte Komponenten geladen

#### Scenario: Datei kann ohne erweiterte Dateisystem-API genutzt werden
- **GIVEN** der Browser stellt keine direkte Dateisystem-API zur Verfuegung
- **WHEN** die Benutzerin einen Stammbaum speichern oder oeffnen moechte
- **THEN** kann sie die YAML-Datei trotzdem herunterladen bzw. ueber eine lokale Dateiauswahl laden

### Requirement: Eingaben und ungespeicherte Aenderungen werden sicher behandelt

Das System MUST fehlerhafte Eingaben vor dem Speichern sichtbar markieren und darf bei einem Validierungsfehler keine gueltigen bestehenden Daten veraendern. Geburts- und Todesdaten muessen dem Format `YYYY`, `YYYY-MM` oder `YYYY-MM-DD` entsprechen und gueltige Kalendertage enthalten; wenn beide Daten mit den bekannten Komponenten sicher vergleichbar sind, darf das Todesdatum nicht vor dem Geburtsdatum liegen. Bei ungespeicherten Aenderungen MUST ein Vorgang, der den aktuellen Stammbaum ersetzen oder verwerfen wuerde, eine Bestaetigung verlangen.

#### Scenario: Ungueltige Lebensdaten ablehnen
- **GIVEN** eine Person wird mit einem nicht erlaubten Datumsformat, einem ungueltigen Kalendertag oder einem sicher frueheren Todesdatum bearbeitet
- **WHEN** die Benutzerin die Aenderung speichert
- **THEN** wird das Formular mit einem konkreten Fehler markiert und die zuletzt gueltigen Personendaten bleiben erhalten

#### Scenario: Teilweise vergleichbare Lebensdaten bleiben zulaessig
- **GIVEN** das Geburtsdatum ist `1900-05` und das Todesdatum `1900-05-01`
- **WHEN** die Benutzerin die Person speichert
- **THEN** wird die Eingabe akzeptiert, weil der unbekannte Tag des Geburtsdatums keinen sicheren Verstoss beweist

#### Scenario: Ungespeicherte Aenderungen bestaetigen
- **GIVEN** der aktuelle Stammbaum wurde seit dem letzten Import oder Export geaendert
- **WHEN** die Benutzerin eine andere Datei importieren oder den aktuellen Stammbaum verwerfen moechte
- **THEN** muss sie den Verlust der ungespeicherten Aenderungen ausdruecklich bestaetigen oder kann den Vorgang abbrechen
