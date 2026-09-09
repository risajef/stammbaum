# family-tree-views Specification

## Purpose

Diese Capability verbessert die Orientierung in grossen Stammbauemen durch Suche und lokale, nichtpersistente Sichtfilter. Sie arbeitet auf einer Projektion der vorhandenen Familienbeziehungen und laesst die fachlichen Grunddaten unveraendert.

## Requirements

### Requirement: Personen koennen in der aktuellen Ansicht gesucht und angesprungen werden

Das System MUST eine Suche nach Teiltreffern in Vor- und Nachnamen der aktuell sichtbaren Personen anbieten. Die Suche MUST Gross- und Kleinschreibung ignorieren. Treffer MUESSEN vom aeltesten zum juengsten bekannten Geburtsdatum geordnet werden; ein Vergleich darf nur bekannte Jahr-, Monats- und Tageskomponenten verwenden. Unbekannte, ungueltige oder nicht sicher vergleichbare Geburtsdaten MUESSEN am Ende beziehungsweise in stabiler Dokumentreihenfolge verbleiben. Die Aktionen fuer naechsten und vorherigen Treffer MUESSEN den jeweiligen Node auswaehlen und in der aktuellen Arbeitsflaeche anspringen; am Ende MUSS die Navigation zyklisch am anderen Ende fortsetzen. Bei null Treffern MUESSEN die Navigationsaktionen deaktiviert sein.

#### Scenario: Teiltreffer finden und zum naechsten Treffer springen

- **GIVEN** mehrere sichtbare Personen enthalten den gesuchten Namensbestandteil
- **WHEN** die Benutzerin den Bestandteil eingibt und die Aktion fuer den naechsten Treffer ausloest
- **THEN** wird der naechste Treffer ausgewaehlt und auf der Arbeitsflaeche fokussiert

#### Scenario: Treffer werden nach Geburtsdatum geordnet

- **GIVEN** sichtbare Treffer haben bekannte, teilweise bekannte und fehlende Geburtsdaten
- **WHEN** die Benutzerin zwischen den Treffern navigiert
- **THEN** erscheinen bekannte Daten aufsteigend, nicht sicher vergleichbare Daten stabil in Dokumentreihenfolge und unbekannte Daten zuletzt

#### Scenario: Suche ist unabhaengig von Grossschreibung

- **GIVEN** eine sichtbare Person heisst etwa `Anna Weber`
- **WHEN** die Benutzerin nach `anna` oder `WEBER` sucht
- **THEN** wird die Person als Treffer erkannt

#### Scenario: Keine Treffer deaktivieren die Navigation

- **GIVEN** kein sichtbarer Vor- oder Nachname passt zur Suche
- **WHEN** die Suchergebnisse angezeigt werden
- **THEN** wird kein Node ausgewaehlt und die Vor-/Naechster-Treffer-Aktionen sind deaktiviert

### Requirement: Ansichtsfilter veraendern nicht die Grunddaten

Das System MUST alle Such- und Ansichtsfilter als reine View-Zustaende behandeln. Das vollstaendige Dokument, seine Personen, Beziehungen, IDs und exportierten YAML-Daten MUESSEN unveraendert bleiben. Die sichtbaren Personen und Beziehungen MUESSEN anschliessend mit demselben automatischen Layoutalgorithmus wie die Vollansicht angeordnet werden; eine Kante darf nur angezeigt werden, wenn beide Endpunkte sichtbar sind.

#### Scenario: Aktive Filter veraendern den exportierten Stammbaum nicht

- **GIVEN** ein Stammbaum wird mit einer beliebigen Filterkombination angezeigt
- **WHEN** die Benutzerin den Stammbaum exportiert
- **THEN** enthaelt der Export weiterhin alle Grunddaten und keine View-Einstellungen

#### Scenario: Gefilterte Personen werden mit dem normalen Layout angeordnet

- **GIVEN** eine Filterkombination laesst nur einen Teil der Personen sichtbar
- **WHEN** die Ansicht neu berechnet wird
- **THEN** liegen die sichtbaren Personen nach denselben Layer- und Familiengruppenregeln wie in einem entsprechend reduzierten Stammbaum

### Requirement: Eine lokale Ansicht begrenzt die Beziehungsdistanz

Das System MUST eine lokale Ansicht mit einem ausgewaehlten Person-Node als Anker und einer waehlbaren nichtnegativen Distanz anbieten. Die kuerzeste Distanz MUSS im ungerichteten Gesamtgraphen aller Eltern-Kind- und Ehebeziehungen berechnet werden; jede Beziehung zaehlt als ein Schritt. Bei Distanz `0` wird nur der Anker angezeigt, bei Distanz `2` werden insbesondere Grosseltern, Enkel und ueber Eltern-Kind-Beziehungen erreichbare Geschwister bis zu zwei Schritten angezeigt. Der Anker MUSS enthalten sein, solange kein anderer aktiver Filter ihn ausblendet.

#### Scenario: Distanz null zeigt nur den Anker

- **GIVEN** eine Person ist ausgewaehlt und die lokale Ansicht ist auf Distanz `0` gestellt
- **WHEN** die Ansicht angezeigt wird
- **THEN** ist nur die ausgewaehlte Person sichtbar und es werden keine Beziehungen angezeigt

#### Scenario: Distanz zwei folgt auch Ehebeziehungen

- **GIVEN** die ausgewaehlte Person ist ueber Eltern-Kind- und Ehebeziehungen mit weiteren Personen verbunden
- **WHEN** die lokale Ansicht auf Distanz `2` gestellt wird
- **THEN** werden alle Personen mit kuerzester ungerichteter Beziehungsdistanz bis `2` angezeigt, einschliesslich erreichbarer Partnerpfade

#### Scenario: Nicht erreichbare Personen bleiben verborgen

- **GIVEN** ein Stammbaum enthaelt eine getrennte Familienkomponente
- **WHEN** die lokale Ansicht mit einem Anker und endlicher Distanz aktiv ist
- **THEN** bleibt die getrennte Komponente unsichtbar

### Requirement: Die Blutsverwandtschaftsansicht schliesst verschwaegerte Personen aus

Das System MUST eine gerichtete Blutsverwandtschaftsansicht des ausgewaehlten Nodes anbieten. Eine Person gilt als verwandt, wenn sie vom Anker aus ueber eine Folge von null oder mehr Aufwaertsschritten auf Eltern-Kind-Kanten und danach null oder mehr Abwaertsschritten erreichbar ist. Eltern, Kinder, Geschwister, Tanten, Onkel, Cousins und weitere ueber solche Ketten verbundene Personen MUESSEN enthalten sein. Nach dem ersten Abwaertsschritt darf kein Aufwaertsschritt mehr folgen. Dadurch MUESSEN die andere Elternperson eines Kindes, Partner von Nachkommen und deren ausschliesslich ueber diese Personen erreichbare Familien ausgeschlossen werden. Ehebeziehungen duerfen weder als Verbindungspfad noch als Grund dafuer dienen, eine Person einzubeziehen. Automatisch abgeleitete Eltern-Kind-Beziehungen werden wie alle anderen Eltern-Kind-Beziehungen beruecksichtigt.

#### Scenario: Geschwister und Cousins bleiben sichtbar

- **GIVEN** der ausgewaehlte Node hat Geschwister und Cousins, die ueber Eltern-Kind-Ketten verbunden sind
- **WHEN** die Blutsverwandtschaftsansicht aktiv ist
- **THEN** bleiben diese Personen zusammen mit dem Anker sichtbar

#### Scenario: Partner und Partnerfamilie werden ausgeschlossen

- **GIVEN** der Anker hat ein Kind mit einer anderen Elternperson und diese Elternperson hat eigene Eltern oder Kinder
- **WHEN** die Blutsverwandtschaftsansicht aktiv ist
- **THEN** werden die andere Elternperson und Personen, die nur ueber sie erreichbar sind, nicht angezeigt

#### Scenario: Partner von Nachkommen werden ausgeschlossen

- **GIVEN** ein Kind des Ankers hat mit einer weiteren Person ein Kind und diese weitere Person hat eigene Eltern
- **WHEN** die Blutsverwandtschaftsansicht aktiv ist
- **THEN** werden die weitere Person und Personen, die nur ueber sie erreichbar sind, nicht angezeigt

### Requirement: Personen ohne Kinder koennen ausgeblendet werden

Das System MUST einen Leaf-Filter anbieten, der jede Person ausblendet, von der im vollstaendigen Grunddokument keine Eltern-Kind-Beziehung zu einem Kind ausgeht. Die Auswertung MUSS vor den anderen View-Filtern auf den vollstaendigen Grunddaten erfolgen. Der Filter MUSS mit der lokalen und der Blutsverwandtschaftsansicht kombinierbar sein.

#### Scenario: Leaf-Personen werden verborgen

- **GIVEN** ein Stammbaum enthaelt Personen mit und ohne Kinder
- **WHEN** der Leaf-Filter aktiviert wird
- **THEN** bleiben nur Personen mit mindestens einem Kind sichtbar

#### Scenario: Leaf-Filter nutzt die Grunddaten

- **GIVEN** ein Elternteil wird durch einen anderen Filter ausgeblendet, hat aber im vollstaendigen Dokument ein Kind
- **WHEN** der Leaf-Filter aktiv ist
- **THEN** wird das Elternteil nicht wegen der Sichtbarkeit des Kindes als Leaf behandelt

### Requirement: Ausgeblendete Auswahl wird synchronisiert

Das System MUST die Personenauswahl aufheben, sobald ein aktiver Filter die ausgewaehlte Person aus der sichtbaren Menge entfernt. Eine dadurch nicht mehr sichtbare Beziehungsauswahl MUSS ebenfalls aufgehoben werden. Die Inspector-Ansicht DARF keine Bearbeitung einer ausgeblendeten Person oder Beziehung vortaeuschen.

#### Scenario: Verdeckter Anker hebt die Auswahl auf

- **GIVEN** eine Person ist ausgewaehlt und ein Filter blendet sie aus
- **WHEN** die gefilterte Ansicht berechnet wird
- **THEN** wird die Auswahl aufgehoben und der Inspector zeigt keine ausgeblendete Person weiter an

#### Scenario: Sichtbare Auswahl bleibt erhalten

- **GIVEN** eine ausgewaehlte Person besteht alle aktiven Filter
- **WHEN** ein anderer Filter aktiviert wird
- **THEN** bleibt die Person ausgewaehlt und ihr Inspector bleibt erreichbar
