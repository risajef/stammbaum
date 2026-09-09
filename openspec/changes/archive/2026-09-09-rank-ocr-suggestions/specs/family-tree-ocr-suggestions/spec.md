## Purpose

Diese Fähigkeit bewertet OCR-Hinweise für neue Personen anhand ihrer Bezugsperson, ihrer Datumsangaben und der Quellenqualität, damit falsche gleichnamige Treffer nicht als gleichwertige Stammbaumvorschläge erscheinen.

## ADDED Requirements

### Requirement: OCR-Bezugspersonen werden kontextbezogen zugeordnet

Die Anwendung MUST einen Vorschlag für eine neue Person nur dann erzeugen, wenn die im OCR-Muster genannte Bezugsperson einer vorhandenen Stammbaum-Person ausreichend eindeutig zugeordnet werden kann. Die Zuordnung MUSS kleine OCR-Abweichungen in Vor- und Nachnamen tolerieren und verfügbare Geburtsdaten zur Unterscheidung gleichnamiger Personen verwenden. Bei fehlender oder nicht ausreichend eindeutiger Zuordnung DARF kein normaler Vorschlag entstehen.

#### Scenario: Gleichnamiger, aber zeitlich unpassender Elternteil erzeugt keinen Vorschlag

- **GIVEN** der Stammbaum enthält eine Person `Jacob Weber`, der OCR-Eintrag nennt ebenfalls `Jacob Weber` als Elternteil und das aus dem Eintrag erkennbare Geburtsjahr gehört zu einer anderen, nicht vorhandenen Person
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** wird für das darin genannte Kind kein normaler neuer Personenvorschlag erzeugt

#### Scenario: Passender gleichnamiger Elternteil wird als Bezugsperson verwendet

- **GIVEN** mehrere Personen `Jacob Weber` existieren und eine davon stimmt mit dem OCR-Geburtsjahr, -monat oder -tag überein
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** wird der neue Kindvorschlag nur mit der am besten passenden vorhandenen `Jacob Weber`-Person verknüpft

#### Scenario: OCR-Schreibfehler werden bei der Bezugsperson toleriert

- **GIVEN** der Stammbaum enthält `Hans Müller` und der OCR-Text nennt dieselbe Bezugsperson als `Hane Mueler` oder `Hane Müller`
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** kann `Hans Müller` als Bezugsperson erkannt werden, ohne den originalen OCR-Ausschnitt zu verändern

#### Scenario: Gleichstand zwischen Bezugspersonen wird konservativ behandelt

- **GIVEN** mehrere gleichnamige Stammbaum-Personen haben keine unterscheidbare oder gleich gute Datumsübereinstimmung mit dem OCR-Eintrag
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** wird kein unmarkierter Vorschlag einer beliebig ausgewählten Bezugsperson angezeigt

### Requirement: Vorschläge erhalten eine erklärbare Qualitätsbewertung

Jeder angezeigte Vorschlag MUST eine deterministische Punktzahl von 0 bis 100 und eine lesbare Begründung der Teilbewertungen enthalten. Die Gesamtbewertung MUST die Namensähnlichkeit der Bezugsperson mit bis zu 35 Punkten, Geburtsdatum/-jahr mit bis zu 35 Punkten, Geschlecht mit bis zu 10 Punkten, zeitliche beziehungsweise relationale Plausibilität mit bis zu 10 Punkten sowie Quellen- und Wiederholungsevidenz mit bis zu 10 Punkten berücksichtigen.

#### Scenario: Vollständiges Datum führt zur höchsten Datumsbewertung

- **GIVEN** eine OCR-Bezugsperson und eine Stammbaum-Person stimmen in Geburtsjahr, Monat und Tag überein
- **WHEN** der Vorschlag bewertet wird
- **THEN** erhält die Datumsdimension mehr Punkte als bei gleicher Übereinstimmung nur in Jahr und Monat, und diese mehr Punkte als bei gleicher Übereinstimmung nur im Jahr

#### Scenario: Passendes Geburtsjahr schlägt einen bloßen Namensgleichstand

- **GIVEN** zwei mögliche Bezugspersonen haben denselben Namen, aber nur eine passt zum im OCR-Eintrag erkannten Geburtsjahr
- **WHEN** die Vorschläge bewertet werden
- **THEN** erhält die zeitlich passende Bezugsperson den höheren Score und wird bevorzugt

#### Scenario: Fehlende oder widersprüchliche Datumsbestandteile werden nicht erfunden

- **GIVEN** der OCR-Text enthält kein zuverlässig erkennbares Geburtsdatum oder widerspricht der Stammbaumangabe
- **WHEN** die Anwendung die Datumsdimension berechnet
- **THEN** bleiben unbekannte Bestandteile neutral beziehungsweise schwächer bewertet, und es wird kein fehlender Tag, Monat oder Jahr ergänzt

#### Scenario: Score-Erklärung ist in der Vorschlagskarte sichtbar

- **GIVEN** ein Vorschlag überschreitet die Anzeigeschwelle
- **WHEN** die Vorschlagsliste dargestellt wird
- **THEN** zeigt die Karte den Score und verständliche Hinweise zu Name, Datum, Beziehung und Quellenqualität an

### Requirement: Vorschläge werden qualitätsgeordnet und evidenzbasiert zusammengefasst

Die Anwendung MUST normale Vorschläge absteigend nach ihrer Qualitätsbewertung anzeigen. Gleiche neue Person, gleiche Bezugsperson, gleiche Beziehung und gleiches erkannte Geburtsdatum aus mehreren OCR-Belegen MUSS zu einem Vorschlag zusammengefasst werden; die zusammengefasste Evidenz MUSS die Zahl oder die relevanten Quellen der Belege nachvollziehbar erhalten. Die Reihenfolge MUSS bei gleichem Eingang deterministisch bleiben.

#### Scenario: Ein besser passender Treffer steht vor einem Namensgleichstand

- **GIVEN** zwei neue Personenvorschläge haben denselben OCR-Namen, aber nur einer besitzt eine passende Bezugsperson und ein passendes Geburtsjahr
- **WHEN** die Vorschlagsliste sortiert wird
- **THEN** steht der zeitlich und relational besser passende Vorschlag vor dem anderen oder der schwache Vorschlag wird unterdrückt

#### Scenario: Wiederholte OCR-Evidenz erzeugt keine Kartenflut

- **GIVEN** derselbe neue Name mit derselben Beziehung und demselben Geburtsdatum wird auf mehreren Seiten oder durch beide OCR-Modelle erkannt
- **WHEN** die Anwendung Vorschläge dedupliziert
- **THEN** erscheint eine Karte mit zusammengefasster Evidenz, wobei die primäre Quelle nach der bestehenden Modellpriorität gewählt wird

#### Scenario: Schwache Vorschläge bleiben aus der normalen Liste entfernt

- **GIVEN** ein OCR-Muster hat weder ausreichende Namensähnlichkeit noch eine passende Datums- oder Beziehungsevidenz
- **WHEN** die Anwendung die Vorschläge berechnet
- **THEN** erscheint dieses Muster nicht in der normalen offenen Vorschlagsliste und verändert den Stammbaum nicht

### Requirement: Neue Personenvorschläge bleiben von vorhandenen Personen unterscheidbar

Die Anwendung MUST weiterhin ausschließlich neue Personen zur Erfassung vorschlagen und keine vorhandene Person automatisch bearbeiten oder zusammenführen. Ein gleicher Name allein DARF einen neuen Vorschlag nicht verhindern, wenn ein deutlich anderes Geburtsdatum und eine ausreichend starke neue Beziehungsevidenz eine eigenständige Person belegen. Ohne diese zusätzliche Evidenz MUSS ein gleichnamiger Kandidat unterdrückt werden.

#### Scenario: Gleichnamige neue Person mit anderem Geburtsdatum bleibt möglich

- **GIVEN** der Stammbaum enthält bereits `Georg Weber` und ein OCR-Eintrag nennt einen weiteren `Georg Weber` mit abweichendem, plausibel erkanntem Geburtsdatum und passender Bezugsperson
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** erscheint ein neuer Vorschlag, ohne die bestehende `Georg Weber`-Person zu verändern

#### Scenario: Gleichnamiger Kandidat ohne unterscheidende Evidenz wird nicht vorgeschlagen

- **GIVEN** der Stammbaum enthält bereits eine Person mit demselben Namen und der OCR-Eintrag liefert weder ein unterscheidbares Datum noch eine ausreichende Beziehungsevidenz
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** wird keine zweite Person mit diesem Namen als normaler Vorschlag angezeigt

### Requirement: Vorschläge werden über die korrigierbare Personenmaske übernommen

Das Öffnen eines OCR-Vorschlags MUST die bestehende Maske zum Anlegen einer neuen Person mit den erkannten OCR-Daten als Vorausfüllung öffnen. Die Benutzerin MUST Name, Geschlecht, Geburtsdatum, Todesdatum und Kommentar vor dem Speichern ändern können. Erst ein erfolgreiches Speichern DARF Person und Beziehung in den Dokumentzustand übernehmen; Abbrechen MUST den Stammbaum und den offenen Vorschlag unverändert lassen.

#### Scenario: OCR-Daten werden in der Personenmaske vorausgefüllt

- **GIVEN** ein bewerteter Vorschlag enthält einen Namen, ein erkennbares Geburtsdatum und gegebenenfalls ein Geschlecht
- **WHEN** die Benutzerin den Vorschlag zur Bearbeitung öffnet
- **THEN** zeigt die Personenmaske diese Werte vorausgefüllt und lässt sie vor dem Speichern editieren

#### Scenario: Korrigierter Vorschlag wird erst beim Speichern übernommen

- **GIVEN** die Benutzerin ändert mindestens ein vorausgefülltes OCR-Feld
- **WHEN** sie die Personenmaske speichert und die Domänenvalidierung erfolgreich ist
- **THEN** werden die korrigierte neue Person und die OCR-gekennzeichnete Beziehung atomar angelegt, der Vorschlag entfernt und der bestehende Speicherstatus auf ungespeichert gesetzt

#### Scenario: Abbrechen verändert weder Vorschlag noch Stammbaum

- **GIVEN** die Personenmaske für einen OCR-Vorschlag ist geöffnet
- **WHEN** die Benutzerin die Maske abbricht
- **THEN** bleibt der Vorschlag offen und Personen, Beziehungen sowie Dirty-State des Stammbaums bleiben unverändert

#### Scenario: Fehler beim Speichern lässt den Vorschlag offen

- **GIVEN** die korrigierten Werte verletzen eine Personen- oder Beziehungsvalidierung
- **WHEN** die Benutzerin speichert
- **THEN** zeigt die Anwendung den konkreten Fehler, übernimmt keine Teiländerung und lässt die Maske sowie den OCR-Vorschlag zur Korrektur geöffnet
