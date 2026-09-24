## REMOVED Requirements

### Requirement: Lokale OCR-Quellen können über einen Pfad geladen werden

**Reason**: Die OCR-Importfunktion wird vollständig entfernt, weil die Benutzerin die manuelle Suche bevorzugt.

**Migration**: OCR-Quellen werden nicht mehr in der Anwendung geladen; vorhandene Stammbaum-YAML-Dateien bleiben über die allgemeine Dateifunktion nutzbar.

### Requirement: OCR-Läufe werden nachvollziehbar ausgewählt

**Reason**: Der lokale OCR-Dienst und die OCR-Laufverarbeitung werden entfernt.

**Migration**: Es gibt keine OCR-Quellenauswahl mehr; genealogische Daten werden manuell gepflegt.

### Requirement: OCR-Daten erzeugen nachvollziehbare Personenvorschläge

**Reason**: OCR-basierte Personenvorschläge werden nicht mehr angeboten.

**Migration**: Neue Personen und Beziehungen werden ausschließlich über die manuelle Arbeitsfläche erfasst.

### Requirement: Vorschläge zeigen ihre Herkunft mit verlinktem Quell- und Dokumentennachweis

**Reason**: Das OCR-Vorschlags- und Quellenpanel wird entfernt.

**Migration**: Bestehende Quellen-URLs und Kommentare von Beziehungen bleiben erhalten; frühere `ocr-suggestion`-Herkünfte werden als `manual` geladen.

### Requirement: Vorschläge können einzeln angenommen oder abgelehnt werden

**Reason**: Es gibt keine offenen OCR-Vorschläge mehr, die angenommen oder abgelehnt werden könnten.

**Migration**: Beziehungen werden über den bestehenden Beziehunginspektor erstellt und bestätigt.

### Requirement: Annahmen werden über den bestehenden Datei-Workflow gespeichert

**Reason**: Der OCR-Vorschlagszustand und seine Übernahmeaktionen entfallen.

**Migration**: Der normale YAML-Speicher- und Öffnen-Workflow bleibt für manuell erfasste Beziehungen bestehen.

### Requirement: OCR-Bezugspersonen werden kontextbezogen zugeordnet

**Reason**: Die OCR-Zuordnung und ihre Heuristiken werden nicht mehr ausgeführt.

**Migration**: Die vorhandene manuelle Personensuche und Auswahl wird verwendet.

### Requirement: Vorschläge erhalten eine erklärbare Qualitätsbewertung

**Reason**: OCR-Vorschlagsbewertungen werden vollständig entfernt.

**Migration**: Es wird keine automatische Qualitätsbewertung für neue Personen erzeugt.

### Requirement: Vorschläge werden qualitätsgeordnet und evidenzbasiert zusammengefasst

**Reason**: OCR-Vorschläge und ihre Evidenzzusammenfassung werden nicht mehr angezeigt.

**Migration**: Für mögliche Dubletten steht die bestehende manuelle Duplikatsuche zur Verfügung.

### Requirement: Neue Personenvorschläge bleiben von vorhandenen Personen unterscheidbar

**Reason**: Es werden keine neuen OCR-Personenvorschläge mehr erstellt.

**Migration**: Die manuelle Personenerfassung bleibt der einzige Erstellungsweg.

### Requirement: Vorschläge werden über die korrigierbare Personenmaske übernommen

**Reason**: Die OCR-spezifische Übernahme in die Personenmaske entfällt.

**Migration**: Personen werden direkt über die normale Personenmaske angelegt.

### Requirement: Bezugspersonen eines OCR-Vorschlags sind direkt erreichbar

**Reason**: OCR-Vorschlagsnavigation wird entfernt.

**Migration**: Personen werden über die manuelle Suche und den Duplikatbereich gefunden.

### Requirement: Eltern-Kind-Altersabstände begrenzen die OCR-Plausibilität

**Reason**: OCR-Plausibilitätsprüfungen sind ohne OCR-Vorschläge nicht mehr erforderlich.

**Migration**: Die bestehenden allgemeinen Beziehungsvalidierungen bleiben unverändert.

### Requirement: OCR-Stellen einer vorhandenen Person können gesucht werden

**Reason**: Die OCR-Personensuche wird zusammen mit dem OCR-Panel entfernt.

**Migration**: Die allgemeine manuelle Personensuche im Arbeitsbereich bleibt verfügbar.
