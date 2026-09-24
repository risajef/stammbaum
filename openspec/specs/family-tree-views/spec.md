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

Das System MUST alle Such- und Ansichtsfilter als reine View-Zustaende behandeln. Das vollstaendige Dokument, seine Personen, Beziehungen und IDs MUESSEN unveraendert bleiben. Der normale Vollbaum-YAML-Export MUSS weiterhin alle Grunddaten ohne View-Einstellungen enthalten; der separate Export der aktuell sichtbaren Filteransicht ist in der Capability `filtered-family-tree-export` definiert. Neu angelegte Personen MUESSEN bis zum erfolgreichen YAML-Speichern unabhaengig von aktiven Ansichtsfiltern sichtbar bleiben; nach diesem Speichern MUESSEN sie wie alle anderen Personen den aktiven Filtern unterliegen. Die sichtbaren Personen und Beziehungen MUESSEN anschliessend mit demselben automatischen Layoutalgorithmus wie die Vollansicht angeordnet werden; eine Kante darf nur angezeigt werden, wenn beide Endpunkte sichtbar sind.

#### Scenario: Aktive Filter veraendern den normalen Vollbaumexport nicht

- **GIVEN** ein Stammbaum wird mit einer beliebigen Filterkombination angezeigt
- **WHEN** die Benutzerin den normalen Stammbaum mit „Speichern“ exportiert
- **THEN** enthaelt der Export weiterhin alle Grunddaten und keine View-Einstellungen

#### Scenario: Neu angelegte Personen bleiben bis zum Speichern sichtbar

- **GIVEN** ein Ansichtsfilter blendet eine neu angelegte Person nach seiner normalen Logik aus
- **WHEN** die Benutzerin die Person im Inspektor speichert
- **THEN** wird die neue Person trotzdem sofort in der Ansicht angezeigt

#### Scenario: Nach dem YAML-Speichern werden neue Personen gefiltert

- **GIVEN** eine neu angelegte Person bleibt wegen der Speicherausnahme sichtbar
- **WHEN** die Benutzerin den Stammbaum erfolgreich als YAML speichert
- **THEN** wird die neue Person bei der naechsten Ansichtsberechnung nach den aktiven Filtern behandelt

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

Bei gleicher Priorität MUSS die Reihenfolge stabil aus der Reihenfolge der Personen im Dokument abgeleitet werden. Die Kandidatenpaare MUESSEN in einem sichtbaren Bereich „Duplikate“ am Ende des Arbeitsbereichs unterhalb von Stammbaum-Arbeitsfläche und Detailinspektor erscheinen. Jedes Paar MUSS beide Personen und seine Prioritätsreihenfolge erkennen lassen. Gibt es keine kompatiblen Paare, MUSS der Bereich eine verständliche Leeranzeige zeigen.

Ein Klick auf eine der beiden Personen MUSS diese Person auswählen und den zugehörigen Knoten im aktuellen Graphen fokussieren. Die Navigation MUSS in der bearbeitbaren Übersicht und in der Federungsansicht funktionieren. Wenn eine aktive lokale Ansicht, die Blutsverwandtschaftsansicht oder der Leaf-Filter die Zielperson ausblenden würde, MUSS die Anwendung diese widersprechenden Ansichtsfilter vor der Auswahl zurücksetzen oder so anpassen, dass die Zielperson sichtbar wird. Die Navigation MUSS den Stammbaum nicht verändern.

Der Bereich „Duplikate“ MUSS über einen zugänglichen Toggle im eigenen Header ein- und ausgeblendet werden können. Er MUSS standardmäßig geöffnet sein; beim Ausblenden MUSS der Inhalt verborgen bleiben, während Header, Titel und Toggle zum Wiedereinblenden sichtbar bleiben. Der Sichtbarkeitszustand DARF weder das Familiendokument, den Dirty-State noch den YAML-Export verändern.

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

- **GIVEN** der Bereich „Duplikate“ ist geöffnet und steht am Ende des Arbeitsbereichs
- **WHEN** die Benutzerin den Toggle im Header „Duplikate“ betätigt
- **THEN** wird nur der Inhalt des Duplikatbereichs ausgeblendet, während dessen Header und die übrige Arbeitsfläche unverändert bleiben
- **AND** der Toggle ermöglicht das erneute Einblenden des Duplikatinhalts

#### Scenario: OCR-Vorschläge können unabhängig ausgeblendet werden

- **GIVEN** die Anwendung wird ohne OCR-Vorschlagsbereich angezeigt
- **WHEN** die Benutzerin nach einem OCR-Toggle sucht
- **THEN** wird kein OCR-Bereich und kein OCR-Toggle angeboten
- **AND** der Duplikatbereich bleibt am Ende des Arbeitsbereichs verfügbar

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

Das System MUST die Aktionen „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“, „Erweiterte direkte Vorfahren“, „Nachkommen“, „Erweiterte Nachkommen“, „Direkte Vor und Nachfahren“ und „Erweiterte direkte Vor und Nachfahren“ als Buttons anbieten. Die sieben personenbezogenen Modi MUESSEN beim Klick die zu diesem Zeitpunkt ausgewaehlte Person als Anker verwenden. Ein erneuter Klick auf denselben Button MUSS den Filter erneut mit der dann ausgewaehlten Person berechnen. Die Buttons DÜRFEN keinen dauerhaften Auswahl-, Checked- oder Radiozustand anzeigen. Das Auswaehlen einer anderen sichtbaren Person DARF die bestehende Filterprojektion nicht veraendern; es MUSS nur den Inspektor auf die neue Person umstellen. Ohne ausgewaehlte Person MUESSEN die sieben personenbezogenen Aktionen die Ansicht unveraendert lassen. „Alle Personen“ MUSS den Blutlinienmodus jederzeit zuruecksetzen, ohne andere aktive Ansichtsfilter zu veraendern. Die Modi MUESSEN mit lokaler Ansicht und Leaf-Filter kombinierbar sein; deren bestehende Schnittmengenlogik bleibt erhalten. Alle Modi MUESSEN reine View-Zustaende bleiben und duerfen weder das Dokument noch den normalen Vollbaum-YAML-Export veraendern.

#### Scenario: Die Filteroptionen sind ausloesende Buttons

- **GIVEN** die Ansichtsfilter werden angezeigt
- **WHEN** die Benutzerin die Blutlinien- und Nachkommenfilter betrachtet
- **THEN** sind „Alle Personen“, „Nur Blutsverwandte“, „Direkte Vorfahren“, „Erweiterte direkte Vorfahren“, „Nachkommen“, „Erweiterte Nachkommen“, „Direkte Vor und Nachfahren“ und „Erweiterte direkte Vor und Nachfahren“ als Buttons und nicht als Radio-Selectoren vorhanden
- **AND** kein Button zeigt einen dauerhaften Checked- oder Aktivzustand an

#### Scenario: Ein Blutlinienbutton filtert die aktuell ausgewaehlte Person

- **GIVEN** Person A ist ausgewaehlt und mehrere Personen sind im Stammbaum sichtbar
- **WHEN** die Benutzerin „Nur Blutsverwandte“ klickt
- **THEN** zeigt die Ansicht nur die Blutsverwandten von Person A nach der bestehenden Blutlinienlogik

#### Scenario: Ein Personenwechsel wendet den bestehenden Filter nicht erneut an

- **GIVEN** Person A ist ausgewaehlt und „Nur Blutsverwandte“ wurde fuer Person A angewendet
- **WHEN** die Benutzerin eine andere sichtbare Person B auswaehlt
- **THEN** bleibt die sichtbare Graphprojektion unveraendert
- **AND** der Inspektor zeigt Person B an

#### Scenario: Ein erneuter Klick uebernimmt die neue Person als Anker

- **GIVEN** die Ansicht zeigt weiterhin den fuer Person A angewendeten Blutlinienfilter und Person B ist ausgewaehlt
- **WHEN** die Benutzerin erneut „Nur Blutsverwandte“ klickt
- **THEN** wird der Filter mit Person B als Anker neu berechnet

#### Scenario: Die Modi ersetzen sich erst durch einen neuen Buttonklick

- **GIVEN** „Nur Blutsverwandte“ wurde fuer eine ausgewaehlte Person angewendet
- **WHEN** die Benutzerin „Direkte Vorfahren“ klickt
- **THEN** wird nur „Direkte Vorfahren“ als neuer Blutlinienmodus angewendet
- **AND** der vorherige Blutlinienmodus wird ersetzt

#### Scenario: Kein Anker laesst die Vollansicht unveraendert

- **GIVEN** keine Person ist ausgewaehlt
- **WHEN** die Benutzerin einen personenbezogenen Vorfahren- oder Nachkommenbutton klickt
- **THEN** bleibt die vollstaendige Personenmenge sichtbar und es werden keine Beziehungen aus dem Dokument entfernt

#### Scenario: Alle Personen setzt nur den Blutlinienfilter zurueck

- **GIVEN** ein Blutlinien- oder Nachkommenmodus ist aktiv und ein Leaf-Filter oder eine lokale Ansicht kann ebenfalls aktiv sein
- **WHEN** die Benutzerin „Alle Personen“ klickt
- **THEN** wird der Blutlinien- und Nachkommenfilter entfernt
- **AND** die anderen aktiven Ansichtsfilter bleiben unveraendert

#### Scenario: Der Nachkommenbutton übernimmt die aktuelle Person

- **GIVEN** Person A ist ausgewaehlt und mehrere Personen sind im Stammbaum sichtbar
- **WHEN** die Benutzerin „Nachkommen“ klickt
- **THEN** zeigt die Ansicht die Nachkommenansicht mit Person A als Anker
- **AND** ein späterer Wechsel zu Person B verändert die sichtbare Graphprojektion nicht

#### Scenario: Der erweiterte Nachkommenbutton kann erneut angewendet werden

- **GIVEN** die erweiterte Nachkommenansicht wurde für Person A angewendet und Person B ist danach ausgewählt
- **WHEN** die Benutzerin erneut „Erweiterte Nachkommen“ klickt
- **THEN** wird die erweiterte Nachkommenansicht mit Person B als neuem Anker berechnet

#### Scenario: Filter veraendern keine gespeicherten Daten

- **GIVEN** ein Vorfahren- oder Nachkommenmodus ist aktiv und die Ansicht ist gefiltert
- **WHEN** die Benutzerin den Stammbaum mit „Speichern“ sichert
- **THEN** enthaelt der normale Export weiterhin alle Personen und Beziehungen ohne Ansichtsmodus

### Requirement: Kombinierte direkte Vor- und Nachfahrenfilter

Das System MUST einen Filter „Direkte Vor und Nachfahren“ anbieten. Er MUSS die Vereinigung der bestehenden Filter „Direkte Vorfahren“ und „Nachkommen“ mit demselben Anker bilden: Alle direkten Vorfahren des Ankers samt den im direkten Vorfahrenfilter eingeschlossenen Partnern sowie alle direkten Nachkommen des Ankers und deren direkte Partner werden angezeigt. Der direkte Partner des Ankers MUSS ebenfalls angezeigt werden. Familienlinien, die ausschliesslich über einen dieser Nachkommenpartner oder den Ankerpartner erreichbar sind, MUESSEN in diesem direkten kombinierten Filter ausgeschlossen bleiben, sofern sie nicht durch eine andere aktive Filterregel sichtbar werden. Die resultierende sichtbare Teilmenge MUSS automatisch mit dem bestehenden Layoutalgorithmus angeordnet werden; ein eigener Sanduhr-Layoutmodus ist nicht erforderlich.

#### Scenario: Direkte Vor- und Nachfahren zeigen beide Richtungen entlang direkter Linien

- **GIVEN** ein Anker hat Eltern, Grosseltern, Kinder und Enkel sowie einen Partner eines direkten Vorfahren
- **WHEN** der Filter „Direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden der Anker, sein direkter Partner, alle direkten Vorfahren, deren eingeschlossene Partner, alle direkten Nachkommen, deren direkte Partner und die Beziehungen zwischen sichtbaren Personen angezeigt
- **AND** die sichtbare Teilmenge wird mit dem bestehenden Layoutalgorithmus angeordnet

#### Scenario: Direkte Nachkommenpartner bleiben im einfachen kombinierten Filter verborgen

- **GIVEN** ein direkter Nachkomme des Ankers hat einen Partner und ein weiteres Kind, das ausschliesslich über diesen Partner erreichbar ist
- **WHEN** der Filter „Direkte Vor und Nachfahren“ angewendet wird
- **THEN** bleibt der Partner als direkter Nachkommenpartner sichtbar
- **AND** das ausschliesslich über den Partner erreichbare Kind bleibt in dieser Ansicht unsichtbar

### Requirement: Erweiterter kombinierter Vor- und Nachfahrenfilter

Das System MUST einen Filter „Erweiterte direkte Vor und Nachfahren“ anbieten. Er MUSS die Vereinigung der bestehenden Filter „Erweiterte direkte Vorfahren“ und „Erweiterte Nachkommen“ mit demselben Anker bilden. Oberhalb des Ankers MUESSEN dadurch Geschwister direkter Vorfahren und deren Partner eingeschlossen werden. Unterhalb des Ankers MUESSEN Partner von Nachkommen sowie deren gemeinsame Kinder eingeschlossen werden. Der Filter DARF keiner Partnerkette folgen: Eltern, Kinder oder weitere Familienlinien eines nur als Partner eingeschlossenen Menschen MUESSEN ausgeschlossen bleiben, sofern sie nicht durch eine ausdrücklich beschriebene Einschlussregel erreicht werden. Die resultierende sichtbare Teilmenge MUSS automatisch mit dem bestehenden Layoutalgorithmus angeordnet werden; ein eigener Sanduhr-Layoutmodus ist nicht erforderlich.

#### Scenario: Der erweiterte kombinierte Filter zeigt beide Seiten

- **GIVEN** direkte Vorfahren haben Geschwister mit Partnern und direkte Nachkommen haben Partner mit gemeinsamen Kindern
- **WHEN** der Filter „Erweiterte direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden die direkte Vorfahrenlinie, die erweiterten Seitenlinien oben, die direkte Nachkommenlinie, die Nachkommenpartner und deren Kinder unten angezeigt
- **AND** die sichtbare Teilmenge wird mit dem bestehenden Layoutalgorithmus angeordnet

#### Scenario: Der erweiterte kombinierte Filter folgt keiner Partnerkette

- **GIVEN** ein eingeschlossener Nachkommenpartner hat eigene Eltern und ein eingeschlossenes Geschwister eines Vorfahrenpartners hat weitere Kinder
- **WHEN** der Filter „Erweiterte direkte Vor und Nachfahren“ angewendet wird
- **THEN** werden diese zusätzlichen Familienlinien nicht allein wegen der eingeschlossenen Partner angezeigt

#### Scenario: Die kombinierten Modi übernehmen den ausgewählten Anker erst beim Klick

- **GIVEN** Person A ist ausgewaehlt und ein kombinierter Modus wurde angewendet
- **WHEN** Person B ausgewaehlt wird, ohne den Filterbutton erneut zu klicken
- **THEN** bleibt die sichtbare gefilterte Projektion um Person A unveraendert
- **AND** ein erneuter Klick auf denselben kombinierten Button berechnet den Filter mit Person B als Anker und ordnet die neue Projektion mit dem bestehenden Layoutalgorithmus an

### Requirement: Eine Nachkommenansicht kann gefiltert werden

Das System MUST eine Ansicht „Nachkommen“ anbieten, die den ausgewaehlten Anker und alle Personen enthaelt, die ueber beliebig viele gerichtete parent-child-Beziehungen abwaerts vom Anker erreichbar sind. Die Ansicht MUSS den Partner des Ankers sowie die direkten Partner aller angezeigten Nachkommen enthalten. Sie MUSS Eltern, Kinder und alle sonst ausschliesslich ueber einen Partner erreichbaren Personen ausschliessen. Die Auswertung MUSS fuer jede Generation gelten und darf nicht auf eine feste Tiefe begrenzt sein.

#### Scenario: Kinder und Enkel des Ankers bleiben sichtbar

- **GIVEN** der Anker hat ein Kind, ein Enkelkind und eine getrennte Person
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** werden der Anker, das Kind und das Enkelkind angezeigt
- **AND** die getrennte Person bleibt unsichtbar

#### Scenario: Partner der Nachkommen werden ausgeschlossen

- **GIVEN** der Anker hat einen Partner und ein Nachkomme hat einen Partner, der eigene Eltern und ein weiteres Kind aus einer anderen Beziehung hat
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** werden der Anker, sein Partner, der Nachkomme und dessen Partner angezeigt
- **AND** die Eltern des Nachkommenpartners und das weitere Kind bleiben unsichtbar

#### Scenario: Eine lange Nachkommenlinie wird nicht auf eine feste Generation begrenzt

- **GIVEN** der Anker hat eine Nachkommenlinie über mehr als zehn Generationen
- **WHEN** die Ansicht „Nachkommen“ aktiviert wird
- **THEN** bleiben alle über parent-child-Beziehungen erreichbaren Nachkommen sichtbar

### Requirement: Eine erweiterte Nachkommenansicht kann gefiltert werden

Das System MUST eine Ansicht „Erweiterte Nachkommen“ anbieten. Sie MUSS den Anker und alle Nachkommen des Ankers sowie den direkten Partner des Ankers und alle direkten Partner jedes tatsächlichen Nachkommens enthalten. Zusätzlich MUSS sie jedes Kind jedes Partners eines tatsächlichen Nachkommens enthalten, auch wenn dieses Kind nicht über den Anker abstammt. Der Partner des Ankers MUSS als einzelner Knoten sichtbar sein; seine eigene Familienlinie DARF nicht allein durch diese Ansicht eingeschlossen werden. Die Erweiterung DARF keine Partner der neu hinzugekommenen Kinder, keine Eltern der Partner und keine weiteren Personen aus einer Partnerkette rekursiv einbeziehen.

#### Scenario: Alle Partner der Nachkommen und deren Kinder bleiben sichtbar

- **GIVEN** ein Nachkomme hat zwei Partner und diese Partner haben jeweils Kinder
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** werden der Anker, der Nachkomme, beide Partner und alle Kinder dieser Partner angezeigt

#### Scenario: Der Partner des Ankers bleibt ausgeschlossen

- **GIVEN** der Anker hat einen Partner und dieser Partner hat ein eigenes Kind sowie der Anker ein Kind
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** werden der Anker, sein Partner und das Kind des Ankers angezeigt
- **AND** das eigene Kind des Ankerpartners bleibt unsichtbar

#### Scenario: Die Erweiterung folgt keiner Partnerkette

- **GIVEN** ein Partner eines Nachkommens hat ein Kind mit einer weiteren Person und diese weitere Person hat eigene Eltern
- **WHEN** die Ansicht „Erweiterte Nachkommen“ aktiviert wird
- **THEN** wird das Kind des eingeschlossenen Partners angezeigt
- **AND** die weitere Person, ihre Eltern und der Partner des Kindes werden nicht allein deshalb angezeigt
