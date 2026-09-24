## MODIFIED Requirements

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

Personenkarten MÜSSEN ihre bestehende Größe, Farbgebung, Statusmarkierungen und fachlich notwendigen Handles behalten. Der Vorname MUSS in einer eigenen sichtbaren Zeile und der Nachname darunter dargestellt werden. Das Geschlechtskürzel sowie die ausgeschriebene Geschlechtsbezeichnung „Mann“ oder „Frau“ DÜRFEN nicht mehr in der Karte erscheinen; die bestehende geschlechtsspezifische Kartenfarbe bleibt die visuelle Unterscheidung.

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
