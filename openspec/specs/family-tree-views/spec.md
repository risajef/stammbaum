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

### Requirement: Mögliche Duplikate werden als bewertete Personenpaare angezeigt und angesprungen

Das System MUST aus dem vollständigen aktuellen Familiendokument alle Paare verschiedener Personen mit identischem normalisiertem Vor- und Nachnamen ermitteln. Für den Vergleich MUESSEN führende und nachgestellte Leerzeichen sowie Groß-/Kleinschreibung normalisiert werden; Umlautvarianten oder andere Schreibweisen DÜRFEN nicht transliteriert werden. Bei drei oder mehr gleichnamigen Personen MUSS jedes eindeutige Personenpaar einzeln betrachtet werden. Paare, zwischen denen eine direkte `parent-child`-Beziehung in beliebiger Richtung besteht, MUESSEN unabhängig von Geburtsdaten, Generationenabstand und sonstiger Kompatibilität ausgeschlossen werden.

Wenn beide Personen ein gültiges Geburtsdatum besitzen, MUSS das Paar nur bei kompatiblen bekannten Datumsbestandteilen aufgenommen werden. Alle in beiden Daten vorhandenen Jahr-, Monats- und Tagesbestandteile MUESSEN übereinstimmen; ein fehlender Bestandteil ist zulässig. Wenn mindestens eine Person kein Geburtsdatum besitzt, MUSS das Paar als kompatibel gelten, sobald sich die nicht persistierte Layout-Generation der beiden Personen um höchstens eine Generation unterscheidet. Gemischte Paare aus einer Person mit und einer Person ohne Geburtsdatum MUESSEN zulässig sein. Ungültige oder nicht kompatible Datumswerte DÜRFEN kein Paar erzeugen.

Jedes kompatible Paar MUSS eine Priorität erhalten und die Treffer MUESSEN aufsteigend nach dieser Priorität sortiert werden:

1. Beide Geburtsdaten sind vollständig (`YYYY-MM-DD`) und stimmen exakt überein.
2. Beide Geburtsdaten sind vorhanden und kompatibel, aber mindestens eines ist unvollständig (`YYYY` oder `YYYY-MM`).
3. Genau eines der beiden Geburtsdaten fehlt.
4. Beide Geburtsdaten fehlen.

Bei gleicher Priorität MUSS die Reihenfolge stabil aus der Reihenfolge der Personen im Dokument abgeleitet werden. Die Kandidatenpaare MUESSEN in einem sichtbaren Bereich „Duplikate“ neben der bestehenden Personensuche erscheinen. Jedes Paar MUSS beide Personen und seine Prioritätsreihenfolge erkennen lassen. Gibt es keine kompatiblen Paare, MUSS der Bereich eine verständliche Leeranzeige zeigen.

Ein Klick auf eine der beiden Personen MUSS diese Person auswählen und den zugehörigen Knoten im aktuellen Graphen fokussieren. Die Navigation MUSS in der bearbeitbaren Übersicht und in der Federungsansicht funktionieren. Wenn eine aktive lokale Ansicht, die Blutsverwandtschaftsansicht oder der Leaf-Filter die Zielperson ausblenden würde, MUSS die Anwendung diese widersprechenden Ansichtsfilter vor der Auswahl zurücksetzen oder so anpassen, dass die Zielperson sichtbar wird. Die Navigation MUSS den Stammbaum nicht verändern.

Der Bereich „Duplikate“ MUSS unabhängig vom Bereich „OCR-Vorschläge“ über einen zugänglichen Toggle im eigenen Header ein- und ausgeblendet werden können. Beide Bereiche MÜSSEN standardmäßig geöffnet sein; beim Ausblenden MUSS der jeweilige Inhalt verborgen bleiben, während Header, Titel und Toggle zum Wiedereinblenden sichtbar bleiben. Der Sichtbarkeitszustand DARF weder das Familiendokument, den Dirty-State, den YAML-Export noch den jeweils anderen Bereich verändern.

Personenkarten MÜSSEN ihre bestehende Größe, Farbgebung, Statusmarkierungen und fachlich notwendigen Handles behalten. Der Vorname MUSS in einer eigenen sichtbaren Zeile und der Nachname darunter dargestellt werden. Das Geschlechtskürzel sowie die ausgeschriebene Geschlechtsbezeichnung „Mann“ oder „Frau“ DÜRFEN nicht mehr in der Karte erscheinen; die bestehende geschlechtsspezifische Farbgebung bleibt die visuelle Unterscheidung.

#### Scenario: Alle gleichnamigen Personenpaare werden betrachtet

- **GIVEN** drei Personen heißen `Anna Weber` und besitzen kompatible Geburtsdaten
- **WHEN** der Bereich „Duplikate“ berechnet wird
- **THEN** erscheinen alle drei eindeutigen Paare einzeln in der Trefferliste

#### Scenario: Direkte Eltern-Kind-Beziehungen werden ausgeschlossen

- **GIVEN** ein Elternteil und sein Kind heißen gleich und besitzen kein Geburtsdatum, sodass sie höchstens eine Layout-Generation auseinanderliegen
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** wird das direkte Eltern-Kind-Paar nicht angezeigt

#### Scenario: Vollständige gleiche Geburtsdaten erhalten die höchste Priorität

- **GIVEN** zwei gleichnamige Personen besitzen beide das vollständige Geburtsdatum `1900-05-20`
- **WHEN** die möglichen Duplikate sortiert werden
- **THEN** erhält das Paar Priorität 1 und steht vor allen Paaren mit ungenaueren oder fehlenden Daten

#### Scenario: Kompatible unvollständige Geburtsdaten erhalten Priorität 2

- **GIVEN** zwei gleichnamige Personen besitzen die Geburtsdaten `1900-05` und `1900-05-20`
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** wird das Paar aufgenommen und mit Priorität 2 hinter Priorität-1-Paaren eingeordnet

#### Scenario: Kompatible gemischte Daten erhalten Priorität 3

- **GIVEN** eine Person heißt `Anna Weber` und besitzt `1900-05-20`, eine gleichnamige Person besitzt kein Geburtsdatum und beide liegen höchstens eine Layout-Generation auseinander
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** wird das Paar aufgenommen und mit Priorität 3 eingeordnet

#### Scenario: Zwei fehlende Geburtsdaten erhalten Priorität 4

- **GIVEN** zwei gleichnamige Personen besitzen kein Geburtsdatum und liegen in derselben oder einer benachbarten Layout-Generation
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** wird das Paar aufgenommen und mit Priorität 4 hinter allen Paaren mit bekannten Daten eingeordnet

#### Scenario: Fehlende Daten erlauben höchstens eine Generation Unterschied

- **GIVEN** zwei gleichnamige Personen haben mindestens ein fehlendes Geburtsdatum und ihre Layout-Generationen unterscheiden sich um zwei oder mehr
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** wird das Paar nicht aufgenommen

#### Scenario: Bekannte inkompatible Geburtsdaten werden ausgeschlossen

- **GIVEN** zwei gleichnamige Personen besitzen die Geburtsdaten `1900-05` und `1900-06`
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** wird das Paar unabhängig von seiner Layout-Generation nicht angezeigt

#### Scenario: Namen werden ohne Groß-/Kleinschreibung verglichen

- **GIVEN** eine Person heißt `Anna Weber` und eine weitere `anna weber`
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** werden beide als gleichnamiges Paar betrachtet, sofern ihre Daten oder Generationen kompatibel sind

#### Scenario: Umlautvarianten gelten nicht automatisch als gleicher Name

- **GIVEN** eine Person heißt `Müller` und eine weitere `Mueller`
- **WHEN** die möglichen Duplikate berechnet werden
- **THEN** werden die Personen nicht allein wegen der phonetisch ähnlichen Schreibweise als Paar angezeigt

#### Scenario: Keine kompatiblen Paare zeigen den Leerzustand

- **GIVEN** das vollständige Dokument enthält keine kompatiblen gleichnamigen Personenpaare
- **WHEN** die Duplikatsuche angezeigt wird
- **THEN** erscheint eine verständliche Meldung, dass keine möglichen Duplikate gefunden wurden

#### Scenario: Duplikatperson wird im Übersicht-Graphen fokussiert

- **GIVEN** ein Duplikatpaar ist sichtbar und eine seiner Personen ist im aktuellen Graphen vorhanden
- **WHEN** die Benutzerin den Personeneintrag anklickt
- **THEN** wird diese Person ausgewählt und ihr Knoten im Übersicht-Graphen fokussiert

#### Scenario: Ausgeblendete Duplikatperson wird sichtbar gemacht

- **GIVEN** eine Duplikatperson wird durch die lokale Ansicht, die Blutsverwandtschaftsansicht oder den Leaf-Filter ausgeblendet
- **WHEN** die Benutzerin ihren Eintrag anklickt
- **THEN** werden die widersprechenden Ansichtsfilter zurückgesetzt oder angepasst, die Person wird sichtbar und anschließend ausgewählt und fokussiert

#### Scenario: Duplikatperson wird in der Federungsansicht fokussiert

- **GIVEN** die Federungsansicht ist aktiv und ein Duplikatpaar sichtbar
- **WHEN** die Benutzerin einen Personeneintrag anklickt
- **THEN** wird der zugehörige Knoten in der Federungsansicht fokussiert, ohne eine fachliche Dokumentänderung auszulösen

#### Scenario: Duplikatsuche verändert keine Stammbaumdaten

- **GIVEN** mögliche Duplikatspaare werden angezeigt oder eine Person aus einem Paar wird fokussiert
- **WHEN** die Benutzerin den Stammbaum exportiert oder den Speicherstatus prüft
- **THEN** bleiben Personen, Beziehungen, IDs, YAML-Inhalt und Dirty-State unverändert

#### Scenario: Duplikatbereich kann unabhängig ausgeblendet werden

- **GIVEN** der Bereich „Duplikate“ und der Bereich „OCR-Vorschläge“ sind geöffnet
- **WHEN** die Benutzerin den Toggle im Header „Duplikate“ betätigt
- **THEN** wird nur der Inhalt des Duplikatbereichs ausgeblendet, während dessen Header und der OCR-Bereich geöffnet bleiben
- **AND** der Toggle ermöglicht das erneute Einblenden des Duplikatinhalts

#### Scenario: OCR-Vorschläge können unabhängig ausgeblendet werden

- **GIVEN** der Bereich „OCR-Vorschläge“ und der Bereich „Duplikate“ sind geöffnet
- **WHEN** die Benutzerin den Toggle im Header „OCR-Vorschläge“ betätigt
- **THEN** wird nur der Inhalt des OCR-Bereichs ausgeblendet, während dessen Header und der Duplikatbereich geöffnet bleiben
- **AND** der Toggle ermöglicht das erneute Einblenden des OCR-Inhalts

#### Scenario: Personenkarten zeigen Namen kompakt und ohne Geschlechtslabel

- **GIVEN** eine Person mit Vorname `Anna`, Nachname `Weber` und Geschlecht `Frau` wird im Graphen angezeigt
- **WHEN** die Personenkarten gerendert werden
- **THEN** erscheint `Anna` in einer Zeile und `Weber` in der folgenden Zeile
- **AND** weder `W`/`Frau` noch `M`/`Mann` wird als Geschlechtsanzeige in der Karte gerendert
- **AND** die geschlechtsspezifische Kartenfarbe bleibt erhalten

### Requirement: Eine direkte Vorfahrenansicht kann gefiltert werden

Das System MUST neben der bestehenden Blutsverwandtschaftsansicht eine Ansicht „Direkte Vorfahren“ anbieten. Wenn eine Person als Anker ausgewaehlt ist, MUSS die Ansicht den Anker, alle direkten Vorfahren ueber beliebig viele Generationen und alle Partner dieser direkten Vorfahren enthalten. Partner MUESSEN ueber Ehebeziehungen in beide Richtungen ermittelt werden. Andere Kinder oder Geschwister der direkten Vorfahren sowie die Familienlinien ihrer Partner MUESSEN ausgeschlossen bleiben, sofern sie nicht durch eine andere Einschlussregel sichtbar werden.

#### Scenario: Direkte Vorfahren und ihre Partner bleiben sichtbar

- **GIVEN** der Anker hat Eltern, Grosseltern und ein Elternteil hat einen Partner
- **WHEN** die Ansicht „Direkte Vorfahren“ aktiviert wird
- **THEN** werden der Anker, die Eltern, die Grosseltern und der Partner des Elternteils angezeigt

#### Scenario: Seitenlinien der Vorfahren bleiben ausgeschlossen

- **GIVEN** ein direkter Vorfahr hat ein Geschwister, dessen Partner und dessen Kind
- **WHEN** die Ansicht „Direkte Vorfahren“ aktiviert wird
- **THEN** bleiben das Geschwister, dessen Partner und dessen Kind unsichtbar

#### Scenario: Eine lange Vorfahrenlinie wird nicht auf eine feste Generation begrenzt

- **GIVEN** der Anker hat eine direkte Vorfahrenlinie ueber mehr als zehn Generationen
- **WHEN** die Ansicht „Direkte Vorfahren“ aktiviert wird
- **THEN** bleiben alle erreichbaren direkten Vorfahren und ihre Partner sichtbar

### Requirement: Eine erweiterte direkte Vorfahrenansicht kann gefiltert werden

Das System MUST eine Ansicht „Erweiterte direkte Vorfahren“ anbieten. Sie MUSS die gesamte direkte Vorfahrenansicht sowie alle Geschwister jedes direkten Vorfahren und deren Partner enthalten. Kinder der Geschwister direkter Vorfahren und alle ausschliesslich ueber diese Kinder erreichbaren Nachkommen MUESSEN ausgeschlossen bleiben. Ein Partner darf nur als einzelne eingeschlossene Person hinzukommen; seine eigene Familienlinie darf nicht rekursiv erweitert werden.

#### Scenario: Geschwister direkter Vorfahren und ihre Partner bleiben sichtbar

- **GIVEN** ein direkter Vorfahr hat ein Geschwister mit einem Partner
- **WHEN** die Ansicht „Erweiterte direkte Vorfahren“ aktiviert wird
- **THEN** werden der direkte Vorfahr, das Geschwister und der Partner des Geschwisters angezeigt

#### Scenario: Kinder der Geschwister bleiben ausgeschlossen

- **GIVEN** ein Geschwister eines direkten Vorfahren hat ein Kind, einen Enkel und einen Partner des Kindes
- **WHEN** die Ansicht „Erweiterte direkte Vorfahren“ aktiviert wird
- **THEN** bleiben das Kind, der Enkel und der Partner des Kindes unsichtbar

#### Scenario: Die Erweiterung folgt nicht der Partnerfamilie

- **GIVEN** ein eingeschlossenes Geschwister hat einen Partner mit eigenen Eltern und Kindern
- **WHEN** die Ansicht „Erweiterte direkte Vorfahren“ aktiviert wird
- **THEN** wird der Partner des Geschwisters angezeigt, aber dessen Eltern und Kinder werden nicht allein deshalb angezeigt

### Requirement: Vorfahrenansichten sind auswählbare, nicht persistierte Filter

Das System MUST die Modi „Nur Blutsverwandte“, „Direkte Vorfahren“ und „Erweiterte direkte Vorfahren“ als alternative Ansichtsmodi anbieten. Es darf höchstens ein dieser drei Modi gleichzeitig aktiv sein. Ohne ausgewählte Ankerperson MUSS ein Vorfahrenmodus keinen Teilgraphen berechnen und die vollständige Personenmenge sichtbar lassen. Die Modi MUESSEN mit lokaler Ansicht und Leaf-Filter kombinierbar sein; deren bestehende Schnittmengenlogik bleibt erhalten. Alle Modi MUESSEN reine View-Zustaende bleiben und duerfen weder das Dokument noch den YAML-Export veraendern.

#### Scenario: Die Modi ersetzen sich gegenseitig

- **GIVEN** „Nur Blutsverwandte“ ist aktiv
- **WHEN** die Benutzerin „Direkte Vorfahren“ aktiviert
- **THEN** wird nur „Direkte Vorfahren“ als Blutlinienmodus angewendet und „Nur Blutsverwandte“ deaktiviert

#### Scenario: Kein Anker laesst die Vollansicht unveraendert

- **GIVEN** keine Person ist ausgewaehlt
- **WHEN** ein Vorfahrenmodus aktiviert wird
- **THEN** bleibt die vollstaendige Personenmenge sichtbar und es werden keine Beziehungen aus dem Dokument entfernt

#### Scenario: Filter veraendern keine gespeicherten Daten

- **GIVEN** ein Vorfahrenmodus ist aktiv und die Ansicht ist gefiltert
- **WHEN** der Stammbaum exportiert wird
- **THEN** enthaelt der Export weiterhin alle Personen und Beziehungen ohne Ansichtsmodus
