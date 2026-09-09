## ADDED Requirements

### Requirement: Eltern-Kind-Altersabstände begrenzen die OCR-Plausibilität

Die Anwendung MUST bei einem Eltern-Kind-OCR-Vorschlag bekannte Geburtsjahre der neuen Person und der vorhandenen Bezugsperson als zeitliche Plausibilität prüfen. Bei einer neuen Person als Kind MUSS der Abstand als `Geburtsjahr Kind - Geburtsjahr Elternteil`, bei einer neuen Person als Elternteil umgekehrt berechnet werden. Ein Abstand von 20 bis 45 Jahren MUSS die volle zeitliche Beziehungsbewertung erhalten. Außergewöhnliche, aber mögliche Abstände MUESSEN abgewertet und in der Score-Begründung erkennbar gemacht werden. Ein Abstand unter 12 oder über 70 Jahren MUSS als extrem unplausibel gelten und DARF keinen normalen Personenvorschlag erzeugen. Fehlt eines der relevanten Geburtsjahre, MUSS die Altersprüfung neutral bleiben. Das erkannte Geburtsdatum der neuen Person DARF dabei nicht als Identitätsübereinstimmung mit sich selbst bewertet werden, sondern nur als OCR-Datumspräzision und, falls möglich, für die Altersprüfung.

#### Scenario: Normales Elternalter erhält volle Plausibilität

- **GIVEN** eine vorhandene Bezugsperson ist 1810 geboren und der OCR-Vorschlag für ihr Kind ist 1840 geboren
- **WHEN** die Anwendung den Eltern-Kind-Vorschlag bewertet
- **THEN** erhält die zeitliche Beziehungsdimension die volle Bewertung und der Score erklärt den plausiblen Altersabstand

#### Scenario: Extremes Elternalter unterdrückt den Vorschlag

- **GIVEN** die vorhandene Bezugsperson ist 1684 geboren und die im OCR erkannte neue Person ist 1790 geboren
- **WHEN** die Anwendung den Eltern-Kind-Vorschlag bewertet
- **THEN** erscheint dafür kein normaler Vorschlag mit hohem Score in der offenen Vorschlagsliste

#### Scenario: Richtung der Beziehung wird korrekt berücksichtigt

- **GIVEN** eine bekannte Person ist 1840 geboren und der OCR-Vorschlag nennt einen neuen Elternteil mit Geburtsjahr 1810
- **WHEN** die Anwendung den Vorschlag als neue Person in Elternrichtung bewertet
- **THEN** wird derselbe Abstand von 30 Jahren als plausibel bewertet

#### Scenario: Fehlendes Geburtsjahr bleibt neutral

- **GIVEN** nur die neue Person oder nur die vorhandene Bezugsperson hat ein bekanntes Geburtsjahr
- **WHEN** die Anwendung die Eltern-Kind-Plausibilität berechnet
- **THEN** wird kein Altersabstand erfunden und der Vorschlag wird nicht allein wegen des fehlenden Vergleichswerts abgewertet

### Requirement: OCR-Stellen einer vorhandenen Person können gesucht werden

Die Anwendung MUST eine explizite Aktion anbieten, mit der eine im Stammbaum ausgewählte Person in allen bereits geladenen OCR-Seiten gesucht wird. Die Suche MUSS kleine OCR-Abweichungen in Vor- und Nachnamen tolerieren und für jede passende Stelle einen lesbaren Treffer mit OCR-Ausschnitt, Quelle und Seite liefern. Die Treffer MUESSEN mit derselben 0–100-Score-Struktur aus Namensähnlichkeit, Datumsübereinstimmung, erkennbarem Beziehungskontext und Quellenqualität bewertet und absteigend sortiert werden. Die Suche MUSS ausschließlich lesend arbeiten und darf keine Person, Beziehung, offene Vorschlagskarte oder Dirty-State verändern.

#### Scenario: Ausgewählte Person wird in OCR-Stellen gefunden

- **GIVEN** eine vorhandene Person `Hans Müller` ist ausgewählt und OCR-Seiten sind geladen
- **WHEN** die Benutzerin die OCR-Suche für diese Person auslöst
- **THEN** werden alle passenden Stellen einschließlich tolerierter Schreibvarianten wie `Hane Mueler` als Treffer angezeigt

#### Scenario: Treffer mit passendem Datum werden höher bewertet

- **GIVEN** mehrere OCR-Stellen enthalten einen ähnlichen Namen und nur eine Stelle enthält das bekannte Geburtsjahr der ausgewählten Person
- **WHEN** die Treffer bewertet und sortiert werden
- **THEN** steht die Stelle mit passendem Geburtsjahr vor einem bloßen Namensgleichstand und zeigt die Teilbewertung an

#### Scenario: OCR-Personensuche zeigt prüfbare Herkunft

- **GIVEN** mindestens eine passende OCR-Stelle wurde gefunden
- **WHEN** die Trefferliste angezeigt wird
- **THEN** enthält jeder Treffer den OCR-Ausschnitt, Score, Begründung und einen klickbaren Link mit Buch, Modell und Seite

#### Scenario: OCR-Personensuche verändert den Stammbaum nicht

- **GIVEN** ein unveränderter Stammbaum und offene OCR-Vorschläge werden angezeigt
- **WHEN** die Benutzerin die OCR-Stellensuche für eine ausgewählte Person ausführt
- **THEN** bleiben Personen, Beziehungen, offene Vorschläge und der Speichern-Status unverändert
