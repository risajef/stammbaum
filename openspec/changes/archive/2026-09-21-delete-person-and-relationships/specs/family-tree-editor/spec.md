## ADDED Requirements

### Requirement: Personen können über den Inspektor gelöscht werden

Der Personen-Inspektor MUST bei einer bestehenden Person einen sichtbaren Button „Person entfernen“ anbieten, analog zum Entfernen einer Beziehung. Die Anwendung MUST den Löschvorgang vor der Ausführung bestätigen lassen. Nach der Bestätigung MUSS die Person aus dem Dokument entfernt werden und alle Ehe- und Eltern-Kind-Beziehungen, deren Endpunkt diese Person ist, MUESSEN automatisch entfernt werden. Das Löschen MUSS den Stammbaum als ungespeichert markieren und die Auswahl aufheben; Abbrechen der Bestätigung MUSS den Stammbaum unverändert lassen.

#### Scenario: Person mit Beziehungen entfernen

- **GIVEN** eine bestehende Person ist ausgewählt und besitzt mindestens eine Ehe- oder Eltern-Kind-Beziehung
- **WHEN** die Benutzerin im Personen-Inspektor „Person entfernen“ auswählt und die Bestätigung bejaht
- **THEN** verschwindet die Person aus der Arbeitsfläche
- **AND** alle Beziehungen zu dieser Person sind entfernt
- **AND** die übrigen Personen und ihre Beziehungen bleiben erhalten
- **AND** der Stammbaum ist als ungespeichert markiert

#### Scenario: Entfernen abbrechen

- **GIVEN** eine bestehende Person ist ausgewählt
- **WHEN** die Benutzerin „Person entfernen“ auswählt und die Bestätigung ablehnt
- **THEN** bleiben die Person, alle Beziehungen und der Speicherstatus unverändert

#### Scenario: Unbekannte Person kann nicht entfernt werden

- **WHEN** eine Löschoperation für eine nicht vorhandene Personen-ID angefordert wird
- **THEN** liefert die Domänenoperation einen verständlichen Fehler
- **AND** das Dokument bleibt unverändert
