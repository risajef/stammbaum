## MODIFIED Requirements

### Requirement: Quellen und Schlussfolgerungsstatus sind Teil jeder Beziehung

Das System MUST jede Beziehung mit dem Status `explizit` oder `geschlussfolgert` speichern. Der Status ist beim Anlegen und spaeteren Bearbeiten aenderbar. Eine Beziehung darf eine einzelne optionale Quellen-URL tragen; eine angegebene Quelle MUST eine gueltige HTTP- oder HTTPS-URL sein. Jede Beziehung MUST außerdem eine Herkunft `manual`, `ocr-suggestion` oder `automatic-inference` tragen. Beim Einlesen älterer schemaVersion-1-Dateien ohne Herkunft MUSS eine Beziehung mit automatischer Herkunft als `automatic-inference`, jede andere als `manual` behandelt werden. Die Herkunft MUSS beim Export erhalten bleiben und in der Arbeitsfläche sowie der Detailansicht sichtbar unterscheidbar sein.

#### Scenario: Beziehung mit Quelle speichern

- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung
- **WHEN** sie eine HTTP- oder HTTPS-URL als Quelle angibt und den Status waehlt
- **THEN** werden URL und Status zusammen mit der Beziehung gespeichert und in deren Detailansicht angezeigt

#### Scenario: Beziehung ohne Quelle speichern

- **GIVEN** die Benutzerin erstellt eine gültige Beziehung ohne bekannte Quelle
- **WHEN** sie die Beziehung bestätigt
- **THEN** wird die Beziehung ohne Quelle, aber mit dem gewählten Status und ihrer Herkunft gespeichert

#### Scenario: Ungueltige Quelle ablehnen

- **GIVEN** die Benutzerin gibt eine leere, fehlerhafte oder nicht als HTTP-/HTTPS-URL erkennbare Quellenangabe ein
- **WHEN** sie die Beziehung bestaetigt oder die Quelle speichert
- **THEN** wird die ungueltige Quellenangabe abgelehnt, die Beziehung bleibt unveraendert und der Fehler wird am Quellenfeld angezeigt

#### Scenario: Beziehung mit Herkunft speichern

- **GIVEN** die Benutzerin erstellt eine gueltige Beziehung mit einer HTTP- oder HTTPS-URL und einer Herkunft
- **WHEN** sie die Beziehung bestaetigt und den Stammbaum speichert
- **THEN** werden URL, Status und Herkunft gemeinsam gespeichert und in der Detailansicht angezeigt

#### Scenario: Geschlussfolgerte Beziehung unterscheiden

- **GIVEN** eine Beziehung ist als `geschlussfolgert` gespeichert
- **WHEN** die Arbeitsfläche oder eine Beziehungsliste angezeigt wird
- **THEN** ist der Status ohne Öffnen eines versteckten Menüs visuell von `explizit` unterscheidbar und die Herkunft zusätzlich erkennbar

#### Scenario: Alte Datei ohne Herkunft bleibt kompatibel

- **GIVEN** eine gültige schemaVersion-1-YAML-Datei enthält noch kein Herkunftsfeld
- **WHEN** die Datei geöffnet wird
- **THEN** wird sie ohne Fehler geladen und die Beziehung erhält die kompatible Herkunft `manual` oder bei automatischer Herkunft `automatic-inference`
