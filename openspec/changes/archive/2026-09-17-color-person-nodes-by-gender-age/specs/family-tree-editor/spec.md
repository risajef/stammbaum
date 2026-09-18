## ADDED Requirements

### Requirement: Personen-Knoten unterscheiden Geschlecht und frühes Todesalter durch Farben

Die Arbeitsfläche MUST Personen-Knoten anhand des bekannten Geschlechts mit zwei unterschiedlichen Grundfarben darstellen. Frauen MUST einen Korallton und Männer MUST einen Türkiston erhalten. Wenn die bekannten Jahreskomponenten von Geburt und Tod eine Differenz kleiner als 18 ergeben, MUSS der Knoten eine hellere Variante seiner Geschlechtsfarbe erhalten. Fehlt das Geburts- oder Todesjahr oder ist es nicht sicher auswertbar, MUSS die Person wie volljährig dargestellt werden. Personen ohne Geschlechtsangabe MUESSEN neutral bleiben.

#### Scenario: Frauen und Männer erhalten unterschiedliche Grundfarben

- **GIVEN** eine Frau und ein Mann sind auf der Arbeitsfläche sichtbar und für beide ist kein Todesalter unter 18 Jahren ableitbar
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhält der Frauen-Knoten die Korall-Grundfarbe und der Männer-Knoten die Türkis-Grundfarbe

#### Scenario: Minderjährige erhalten eine hellere Geschlechtsfarbe

- **GIVEN** eine Frau und ein Mann haben jeweils ein bekanntes Geburts- und Todesjahr mit einer Differenz von 17
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhalten beide Knoten jeweils eine hellere Variante ihrer eigenen Geschlechtsfarbe

#### Scenario: Genau 18 Jahre gelten als volljährig

- **GIVEN** eine Person hat ein bekanntes Geburtsjahr und ein Todesjahr genau 18 Jahre später
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhält der Knoten die normale Geschlechtsfarbe und nicht die Minderjährigen-Variante

#### Scenario: Unbekannte Lebensdaten gelten als volljährig

- **GIVEN** das Geburtsjahr oder das Todesjahr einer Person fehlt oder ist nicht sicher auswertbar
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** erhält der Knoten die normale Geschlechtsfarbe und nicht die Minderjährigen-Variante

#### Scenario: Unbekanntes Geschlecht bleibt neutral

- **GIVEN** eine Person ohne Geschlechtsangabe ist auf der Arbeitsfläche sichtbar
- **WHEN** die Arbeitsfläche dargestellt wird
- **THEN** bleibt der Knoten neutral eingefärbt und erhält keine Frauen- oder Männerfarbe

#### Scenario: Farbgebung verändert keine Fachdaten

- **GIVEN** ein Stammbaum enthält Personen und Beziehungen mit beliebigen Lebensdaten
- **WHEN** die Arbeitsfläche mit der Farbgebung dargestellt wird
- **THEN** bleiben Personen, Beziehungen, IDs und die exportierbaren Grunddaten unverändert
