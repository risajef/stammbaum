## MODIFIED Requirements

### Requirement: Beziehungen lassen sich direkt in der Arbeitsflaeche bedienen

Das System MUST eine direkte Interaktion anbieten, mit der die Benutzerin eine Person auswaehlt und eine zweite Person ueber sichtbare Handles verbindet, ohne interne IDs oder YAML bearbeiten zu muessen. Ein seitlicher Handle MUSS bei einer Person mit Geschlecht `Mann` rechts und bei einer Person mit Geschlecht `Frau` links sichtbar sein. Eine Verbindung zwischen dem rechten Handle eines Mannes und dem linken Handle einer Frau MUSS als Ehe klassifiziert werden, unabhaengig davon, in welche Richtung die Verbindung gezogen wird. Bei Personen ohne Geschlechtsangabe DARF kein seitlicher Ehe-Handle angeboten werden.

Eine Verbindung vom unteren Handle der ersten verbundenen Person zum oberen Handle der zweiten verbundenen Person MUSS als gerichtete Eltern-Kind-Beziehung klassifiziert werden. Die erste Person MUSS dabei als Elternteil und die zweite Person als Kind gespeichert werden. Für diese Klassifikation MUSS ausschließlich die Art der verbundenen Handles gelten; die aktuelle Höhe oder Position der Nodes DARF keine Rolle spielen. Das automatische Layout darf sich nach dem Speichern an die neue Beziehung anpassen.

Jede neue Verbindung MUSS vor der Übernahme in einem Beziehunginspektor ausdrücklich bestätigt werden. Der durch die Handles bestimmte Beziehungstyp MUSS dort bereits feststehen. Kommentar und Quelle MUESSEN optional bleiben. Auswahl, Bearbeitung und Detailansicht von Personen und Beziehungen muessen eindeutig erkennbar sein.

#### Scenario: Beziehung per direkter Verbindung erstellen

- **GIVEN** mindestens zwei Personen sind sichtbar
- **WHEN** die Benutzerin sie über passende seitliche oder vertikale Handles verbindet, den dadurch bestimmten Beziehungstyp prüft und die Beziehung bestätigt
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
