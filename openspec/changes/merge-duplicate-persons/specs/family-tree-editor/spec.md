## ADDED Requirements

### Requirement: Doppelte Personen koennen bewusst fusioniert werden

Das System MUST eine bestehende Person aus dem Personeninspektor heraus fuer eine Fusion markieren und anschliessend eine zweite vorhandene Person ueber die Arbeitsflaeche oder die Personensuche auswaehlen lassen. Die zuerst ausgewaehlte Person MUST mit ihrer ID bestehen bleiben; die zweite Person MUST nach erfolgreicher Bestaetigung entfernt sein. Vor der Ausfuehrung MUSS eine sichtbare Warnung darauf hinweisen, dass die Fusion destruktiv und nicht rueckgaengig zu machen ist. Eine abgebrochene oder abgelehnte Fusion MUST den bisherigen Stammbaum unveraendert lassen.

#### Scenario: Zwei Personen erfolgreich fusionieren

- **GIVEN** die Benutzerin hat Person A ausgewaehlt und die Fusion gestartet
- **WHEN** sie Person B als zweite Person auswaehlt und die destruktive Fusion bestaetigt
- **THEN** bleibt Person A mit ihrer bisherigen ID als eine Person erhalten, Person B ist nicht mehr im Dokument vorhanden und der Stammbaum wird als ungespeicherte Aenderung markiert

#### Scenario: Fusion ueber die Arbeitsflaeche oder Suche starten

- **GIVEN** Person A ist ausgewaehlt und mehrere Personen sind im Dokument vorhanden
- **WHEN** die Benutzerin die Fusion startet und eine andere sichtbare Person per Node oder Personensuche auswaehlt
- **THEN** wird diese Person als Fusionspartner angezeigt und erst nach der expliziten Bestaetigung als zweite Person verwendet

#### Scenario: Fusion abbrechen

- **GIVEN** eine zweite Person ist fuer die Fusion ausgewaehlt und die Warnung wird angezeigt
- **WHEN** die Benutzerin die Warnung abbricht
- **THEN** bleiben beide Personen, alle Beziehungen und der bisherige Speicherstatus unveraendert

### Requirement: Personendaten werden konfliktbewusst zusammengefuehrt

Bei einer Fusion MUST das System die Personendaten feldweise zusammenfuehren. Vorhandene Vor- und Nachnamen sowie vorhandene Geschlechtsangaben MUESSEN nach Normalisierung uebereinstimmen; unterschiedliche vorhandene Werte MUESSEN die Fusion ablehnen. Bei Geschlecht, Geburtsdatum und Todesdatum MUSS ein fehlender Wert durch den vorhandenen Wert der anderen Person ergaenzt werden. Bei zwei kompatiblen Teil-Datumswerten MUSS der praezisere Wert uebernommen werden, wenn alle gemeinsam bekannten Komponenten uebereinstimmen; widerspruechliche Datumswerte MUESSEN abgelehnt werden. Beide unterschiedlichen nichtleeren Kommentare MUESSEN in der Reihenfolge der zuerst und danach ausgewaehlten Person erhalten bleiben. Die Positionen der beiden Personen duerfen keinen Datenkonflikt erzeugen.

#### Scenario: Fehlende Lebensdaten werden ergaenzt

- **GIVEN** Person A hat nur ein Geburtsdatum und Person B nur ein Todesdatum
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** besitzt die verbleibende Person beide Lebensdaten

#### Scenario: Praeziseres Teildatum wird uebernommen

- **GIVEN** eine Person hat das Geburtsjahr `1900` und die andere das kompatible Geburtsdatum `1900-05-20`
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** wird `1900-05-20` als Geburtsdatum der verbleibenden Person gespeichert

#### Scenario: Widerspruechliche Personendaten blockieren die Fusion

- **GIVEN** beide Personen haben fuer mindestens ein Pflicht- oder Lebensdatenfeld unterschiedliche, nicht kompatible vorhandene Werte
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** wird ein verstaendlicher Konflikt angezeigt, keine Person entfernt und keine Beziehung oder Position geaendert

#### Scenario: Kommentare beider Personen bleiben erhalten

- **GIVEN** beide Personen haben unterschiedliche nichtleere Kommentare
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** enthaelt der Kommentar der verbleibenden Person beide Kommentare in der Reihenfolge der Auswahl; ein identischer Kommentar wird nicht doppelt gespeichert

### Requirement: Beziehungen werden bei der Fusion konsolidiert

Nach einer erfolgreichen Fusion MUST jede Ehe- und Eltern-Kind-Beziehung, deren `fromId` oder `toId` auf eine der beiden Personen zeigt, auf die ID der verbleibenden Person verweisen. Beziehungen, die dadurch dieselben Endpunkte und denselben Typ erhalten, MUESSEN zu einer Beziehung konsolidiert werden. Beziehungen, die dadurch zu einer Selbstbeziehung werden, MUESSEN entfernt werden. Nach der Umschreibung MUSS das System die eindeutigen Eltern pro Kind zaehlen; wenn ein Kind dadurch mehr als zwei Eltern hat, MUSS die Fusion abgelehnt werden. Explizite und automatisch abgeleitete Eltern-Kind-Beziehungen MUESSEN bei dieser Pruefung beruecksichtigt werden. Sichere automatische Beziehungen MUESSEN im resultierenden Dokument weiterhin korrekt abgeleitet und ungueltig gewordene automatische Beziehungen entfernt werden.

#### Scenario: Beziehungen in beide Richtungen zeigen auf die verbleibende Person

- **GIVEN** eine der beiden Personen ist Elternteil oder Kind in einer Eltern-Kind-Beziehung und an einer Ehe beteiligt
- **WHEN** die Fusion erfolgreich abgeschlossen wird
- **THEN** verweisen alle betroffenen Beziehungsendpunkte auf die verbleibende Person und keine Beziehung verweist mehr auf den entfernten Datensatz

#### Scenario: Gemeinsame Kinder erzeugen keine doppelte Elternkante

- **GIVEN** Person A und Person B sind beide als Elternteil desselben Kindes erfasst
- **WHEN** die Benutzerin A und B fusioniert
- **THEN** bleibt fuer dieses Kind genau eine Eltern-Kind-Beziehung zur verbleibenden Person bestehen und die Fusion ist zulaessig

#### Scenario: Gemeinsamer Ehepartner erzeugt keine doppelte Ehe

- **GIVEN** Person A und Person B haben jeweils eine Ehebeziehung mit derselben dritten Person
- **WHEN** die Benutzerin A und B fusioniert
- **THEN** bleibt genau eine Ehebeziehung zwischen der verbleibenden Person und der dritten Person bestehen

#### Scenario: Mehr als zwei Eltern blockieren die Fusion atomar

- **GIVEN** die Umschreibung der Beziehungen wuerde fuer ein Kind drei oder mehr eindeutige Eltern ergeben
- **WHEN** die Benutzerin die Fusion bestaetigt
- **THEN** wird die Fusion mit einem konkreten Fehler abgelehnt und der gesamte vorherige Dokumentzustand bleibt unveraendert

#### Scenario: Selbstbeziehungen werden bedeutungslos entfernt

- **GIVEN** eine Beziehung zwischen den beiden zu fusionierenden Personen wuerde nach der Umschreibung auf dieselbe Person zeigen
- **WHEN** die Benutzerin die Fusion bestaetigt und die Elternanzahlgrenze nicht verletzt wird
- **THEN** wird diese Selbstbeziehung entfernt und die verbleibende Person wird ohne diese Kante gespeichert

### Requirement: Die Arbeitsflaeche berechnet nach der Fusion das Layout neu

Nach einer erfolgreichen Fusion MUST die Arbeitsflaeche die Positionen aller sichtbaren Personen aus dem resultierenden Familiengraphen mit dem bestehenden automatischen Layout neu berechnen. Die Position der entfernten Person darf nicht als feste Position in den neuen Zustand uebernommen werden. Die verbleibende Person MUSS nach Abschluss weiterhin ausgewaehlt sein und der YAML-SchemaVersion-1-Zustand MUSS speicherbar bleiben.

#### Scenario: Resultierender Familiengraph wird neu angeordnet

- **GIVEN** die beiden Personen haben vor der Fusion unterschiedliche sichtbare Positionen und mindestens eine ihrer Beziehungen wird umgeschrieben
- **WHEN** die Fusion erfolgreich abgeschlossen wird
- **THEN** wird die Arbeitsflaeche anhand des resultierenden Familiengraphen neu angeordnet und die verbleibende Person bleibt ausgewaehlt

#### Scenario: Erfolgreiche Fusion bleibt speicher- und importierbar

- **GIVEN** eine Fusion wurde erfolgreich abgeschlossen
- **WHEN** die Benutzerin den Stammbaum als YAML speichert und wieder oeffnet
- **THEN** enthaelt die Datei nur die verbleibende Person, die konsolidierten Beziehungen und die fusionierten Personendaten in einem gueltigen SchemaVersion-1-Dokument

### Requirement: Genealogische Ebenen folgen einem Root-relativen DAG

Die Arbeitsflaeche MUST die erste Person im Dokument als Root-Komponente auf Ebene 0 verwenden und die Ebenen aller erreichbaren Familienkomponenten durch das gerichtete Eltern-Kind-DAG sowie die umgekehrte Traversierung fuer Vorfahren bestimmen. Fuer jede Eltern-Kind-Kante MUST die Kindkomponente unter ihren Eltern liegen und sie SOLLTE genau eine Ebene tiefer liegen. Wenn unterschiedlich lange DAG-Pfade eine exakte Ein-Ebenen-Zuordnung verhindern, DARF der Abstand zwei Ebenen betragen, MUST aber fuer normale azyklische Daten auf hoechstens zwei Ebenen begrenzt bleiben. Eine Kindkomponente MUST nicht wegen eines laengeren Seitenastes kuenstlich bis zur tiefsten Blattgeneration verschoben werden. Ehepartner und gemeinsame Eltern MUST weiterhin auf derselben Ebene ausgerichtet werden. Fuer voneinander getrennte Graphgruppen MUSS ein deterministischer lokaler Anker verwendet werden. Geburtsdaten koennen weiterhin fuer die horizontale Reihenfolge verwendet werden, duerfen aber die relationale Ebenenzuweisung nicht durch eine chronologische Zeitleiste ersetzen. Fehlende Geburtsdaten MUST die Ebenenzuweisung nicht unberechenbar machen.

#### Scenario: Erste YAML-Person definiert die Root-Ebene

- **GIVEN** die erste Person im Dokument ist nicht die aelteste bekannte Person und hat einen Elternteil sowie ein Kind
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegt die erste Person auf Ebene 0, ihr Elternteil auf Ebene -1 und ihr Kind auf Ebene 1

#### Scenario: Direkte Eltern werden auf die vorherige Generation gelegt

- **GIVEN** eine Person hat direkte Eltern, deren Pfade gleich oder nahezu gleich lang sind
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegen die Eltern auf der direkt vorherigen Ebene; bei einem unvermeidbaren Pfadkonflikt liegt keine Eltern-Kind-Kante mehr als zwei Ebenen auseinander

#### Scenario: Flacher Seitenast bleibt ueber einer tieferen Blattgeneration

- **GIVEN** zwei Seitenaste gehoeren zum selben Familiengraphen, ein Blatt liegt nach zwei Eltern-Kind-Schritten und ein anderes nach dreizehn Schritten
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegt das Blatt des flacheren Astes auf einer hoeheren Ebene als das Blatt des tieferen Astes und wird nicht kuenstlich an dessen tiefste Ebene verschoben

#### Scenario: Eltern-Kind-Topologie bestimmt die vertikale Reihenfolge

- **GIVEN** eine Kindkomponente hat eine oder mehrere Elternkomponenten und die Daten bilden einen gerichteten azyklischen Graphen
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** liegt jede Elternkomponente oberhalb der Kindkomponente, waehrend Ehepartner und gemeinsam erfasste Eltern auf einer gemeinsamen Ebene bleiben

#### Scenario: Fehlende Geburtsdaten beeinflussen die Generationsebene nicht

- **GIVEN** ein Seitenast enthaelt Personen ohne Geburtsdatum und ein anderer Ast enthaelt bekannte Geburtsdaten
- **WHEN** die Arbeitsflaeche das Layout berechnet
- **THEN** werden die Ebenen aus den vorhandenen Beziehungen deterministisch berechnet und nicht wegen fehlender Geburtsdaten zusammengelegt oder verworfen
