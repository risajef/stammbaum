## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Personen koennen erfasst und bearbeitet werden

Das System MUST Personen mit einem Vor- und Nachnamen anlegen koennen. Geschlecht darf als Frau oder Mann angegeben werden und ist fuer die Erstellung einer Ehebeziehung erforderlich; Geburts- und Todesjahr sind optional. Eine bestehende Person MUST ohne Verlust ihrer Beziehungen bearbeitbar sein. Die Aktion zum Anlegen einer Person MUSS direkt in der Uebersichtszeile der Arbeitsflaeche erreichbar sein; ein separates Werkzeugfenster dafuer ist nicht erforderlich.

#### Scenario: Person mit vollstaendigen Angaben anlegen
- **GIVEN** die Arbeitsflaeche ist geoeffnet
- **WHEN** die Benutzerin die Aktion zum Anlegen einer Person in der Uebersichtszeile auswaehlt und eine Person mit Vorname, Nachname, Geschlecht, Geburtsjahr und Todesjahr anlegt und bestaetigt
- **THEN** erscheint genau eine neue Person mit diesen Angaben auf der Arbeitsflaeche

#### Scenario: Unbekannte Lebensdaten leer lassen
- **GIVEN** die Benutzerin legt eine Person ohne bekanntes Geburts- oder Todesjahr an
- **WHEN** sie die Person bestaetigt
- **THEN** wird die Person mit leeren Lebensdaten gespeichert und als gueltig angezeigt

#### Scenario: Person bearbeiten ohne Beziehungen zu verlieren
- **GIVEN** eine Person hat mindestens eine Ehe- oder Eltern-Kind-Beziehung
- **WHEN** die Benutzerin den Nachnamen oder ein Lebensjahr aendert und speichert
- **THEN** wird die Angabe aktualisiert und jede bestehende Beziehung bleibt erhalten

#### Scenario: Person aus der Uebersicht anlegen
- **GIVEN** die Uebersicht der Arbeitsflaeche ist sichtbar
- **WHEN** die Benutzerin den `+`-Button zum Anlegen einer Person auswaehlt
- **THEN** wird der bestehende Personeninspektor zum Anlegen geoeffnet, ohne dass ein separates Werkzeugfenster angezeigt wird
