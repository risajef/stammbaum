## MODIFIED Requirements

### Requirement: Personenalter histogrammieren

Das Tool SHALL für jede Person mit auswertbarem Geburtsdatum und auswertbarem Todesdatum das Alter beim Tod berechnen und als Histogramm darstellen. Personen ohne Todesdatum MUESSEN aus dieser Auswertung ausgeschlossen werden; das gewählte Auswertungsdatum DARF nicht als Ersatz-Ende für ein unbekanntes Todesdatum verwendet werden. Teil-Datumsangaben MUST über ihre bekannten Bestandteile berücksichtigt und als Näherungen gekennzeichnet werden. Die x-Achse MUSS nur die Altersklassen bis zum höchsten tatsächlich vorhandenen Alterswert darstellen und darf nicht durch ausgeschlossene Personen oder einen künstlichen Auswertungszeitpunkt verlängert werden.

#### Scenario: Lebende und verstorbene Personen werden berücksichtigt

- **WHEN** Personen sowohl ein Todesdatum als auch kein Todesdatum haben
- **THEN** verwendet das Tool für Verstorbene das Alter beim Tod
- **AND** Personen ohne Todesdatum erscheinen nicht im Personenalter-Histogramm, auch wenn ein Auswertungsdatum angegeben ist

#### Scenario: Historische Personen ohne Todesdatum erzeugen keinen unrealistischen Ausreißer

- **GIVEN** eine Person hat ein sehr frühes Geburtsjahr, aber kein Todesdatum
- **WHEN** die Statistik mit einem späteren Auswertungsdatum erzeugt wird
- **THEN** wird diese Person nicht als mehrere hundert Jahre alt gezählt
- **AND** die x-Achse endet bei der höchsten Altersklasse der auswertbaren Todesalter

#### Scenario: Geburtsdatum fehlt

- **WHEN** eine Person kein gültiges Geburtsdatum besitzt
- **THEN** wird diese Person aus dem Personenalter-Histogramm ausgeschlossen, ohne die übrigen Auswertungen abzubrechen
