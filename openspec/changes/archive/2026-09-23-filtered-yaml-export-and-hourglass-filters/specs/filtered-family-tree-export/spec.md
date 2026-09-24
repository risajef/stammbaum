## Purpose

Diese Capability macht die aktuell sichtbare, gefilterte Familienbaumansicht als eigenständige YAML-Datei nutzbar, ohne den vollständigen Arbeitsbaum oder seinen Speicherzustand zu verändern.

## ADDED Requirements

### Requirement: Die aktuelle Filteransicht kann als YAML exportiert werden

Das System MUST einen zugänglichen Button „Exportieren“ anbieten. Beim Auslösen MUSS die Anwendung genau die aktuell sichtbaren Personen und nur Beziehungen exportieren, deren beide Endpunkte sichtbar sind. Der Export MUSS das bestehende YAML-Schema verwenden, beim erneuten Öffnen gültig sein und darf keine Ansichtsfilter oder sonstigen flüchtigen UI-Zustände enthalten. Wenn kein Filter aktiv ist, MUSS der Export dem vollständigen aktuellen Dokument entsprechen.

#### Scenario: Eine direkte Vorfahrenansicht wird als Teilbaum exportiert

- **GIVEN** die Ansicht zeigt nach dem Filter „Direkte Vorfahren“ nur einen Anker, seine direkten Vorfahren und deren eingeschlossene Partner
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** wird eine YAML-Datei mit genau diesen sichtbaren Personen und ihren vollständig sichtbaren Beziehungen erzeugt
- **AND** ausgeblendete Personen und Beziehungen mit ausgeblendeten Endpunkten fehlen

#### Scenario: Ohne Filter bleibt der vollständige Export erhalten

- **GIVEN** keine Ansichtsfilter sind aktiv
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** enthält die YAML-Datei alle Personen und Beziehungen des aktuellen Dokuments

#### Scenario: Ein gefilterter Export bleibt eigenständig gültig

- **GIVEN** eine sichtbare automatisch abgeleitete Beziehung verweist auf eine Quellbeziehung, deren Endpunkt durch den Filter ausgeblendet ist
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** bleibt die exportierte YAML-Datei gültig und enthält keine dangling Referenz auf eine ausgeblendete Quellbeziehung
- **AND** die sichtbare Beziehung bleibt mit ihren Endpunkten und ihrem sichtbaren Status erhalten

#### Scenario: Ein leerer Filterexport ist ein gültiges YAML-Dokument

- **GIVEN** die aktuelle Filterkombination lässt keine Person sichtbar
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** wird ein gültiges YAML-Dokument mit leerer Personen- und Beziehungsliste exportiert

### Requirement: Der Export erhält einen sprechenden Dateinamen

Das System MUST den Dateinamen aus der aktiven Blutlinien- oder Nachkommenansicht und, falls vorhanden, deren gespeicherten Anker bilden. Für kombinierte Vor- und Nachfahrenfilter MUSS der Dateiname die entsprechende kombinierte Bezeichnung verwenden. Der Dateiname MUSS mit `.yaml` enden und darf keine Pfadtrenner oder sonstige unzulässige Dateinamenzeichen enthalten. Ohne aktiven personenbezogenen Filter MUSS ein neutraler Name verwendet werden.

#### Scenario: Direkte Vorfahren erhalten den Ankernamen

- **GIVEN** der Filter „Direkte Vorfahren“ wurde für Ernst Weber angewendet
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** wird als vorgeschlagener Dateiname `Direkte Vorfahren Ernst Weber.yaml` verwendet

#### Scenario: Die erweiterte kombinierte Ansicht erhält einen kombinierten Namen

- **GIVEN** der Filter „Erweiterte direkte Vor und Nachfahren“ wurde für Ernst Weber angewendet
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** enthält der vorgeschlagene Dateiname die Bezeichnung `Erweiterte direkte Vor und Nachfahren Ernst Weber.yaml`

#### Scenario: Der Dateiname verwendet den Filteranker statt der späteren Auswahl

- **GIVEN** der Filter wurde für Person A angewendet und danach Person B ausgewählt
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** bezieht sich der Dateiname weiterhin auf Person A als gespeicherten Filteranker

#### Scenario: Ein Export ohne personenbezogenen Filter erhält einen neutralen Namen

- **GIVEN** kein personenbezogener Blutlinien- oder Nachkommenfilter ist aktiv
- **WHEN** die Benutzerin „Exportieren“ auslöst
- **THEN** beginnt der Dateiname mit `Stammbaum` und endet mit `.yaml`

### Requirement: Ein fehlgeschlagener Filterexport verändert den Arbeitsstand nicht

Das System MUST bei einem fehlgeschlagenen oder abgebrochenen Dateizugriff beim Filterexport den bestehenden Fehlerzustand anzeigen. Dokument, Filter, Auswahl, Dirty-State und der Name der regulären Arbeitsdatei MÜSSEN unverändert bleiben.

#### Scenario: Der Filterexport wird abgebrochen

- **GIVEN** der Browser-Dateidialog wird beim Export abgebrochen
- **WHEN** die Exportaktion abgeschlossen ist
- **THEN** wird der Exportfehler angezeigt
- **AND** der Stammbaum und sein Arbeitsstand bleiben unverändert
