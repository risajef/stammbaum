## Context

Die Anwendung berechnet in `App` bereits eine `visibleDocument`-Projektion aus den nicht persistierten Ansichtsfiltern. Die bestehende YAML-Serialisierung und der Browser-Dateiport können wiederverwendet werden; der reguläre Speichervorgang darf dabei seinen bisherigen Vollbaum- und Dirty-State-Vertrag behalten.

## Goals / Non-Goals

**Goals:**

- Zwei kombinierte Blutlinienmodi auf Basis der vorhandenen Vorfahren- und Nachkommenregeln ergänzen.
- Einen separaten Exportpfad für die sichtbare Projektion mit robustem Dateinamen anbieten.
- Gefilterte Exporte als eigenständige, erneut öffnungsfähige YAML-Dokumente erzeugen.
- Die Exportaktion ohne Nebenwirkungen auf Dokument, Filter, Auswahl, reguläre Datei und Dirty-State halten.

**Non-Goals:**

- Keine Änderung am YAML-Schema.
- Keine Änderung an der normalen Vollbaum-Speicherung.
- Keine neue Persistierung von Ansichtsfiltern.
- Keine rekursive Erweiterung über Partnerketten.

## Decisions

### Kombinierte Modi als Vereinigungen bestehender Mengen

Die beiden neuen Modi werden als zusätzliche `BloodlineMode`-Werte modelliert. Der einfache kombinierte Modus vereinigt die IDs der bestehenden direkten Vorfahren- und Nachkommenansicht. Der erweiterte Modus vereinigt die IDs der bestehenden erweiterten direkten Vorfahren- und erweiterten Nachkommenansicht. Dadurch bleiben Partnerregeln und die Begrenzung der Partnerketten an einer Stelle definiert. Die daraus entstehende sichtbare Teilmenge wird anschließend unverändert an den bestehenden Layoutalgorithmus übergeben; es wird kein separater Sanduhr-Layoutalgorithmus eingeführt.

Alternative: Eine neue gemeinsame Traversierung würde die bereits getesteten Regeln duplizieren und könnte bei späteren Änderungen auseinanderlaufen.

### Export aus der sichtbaren Dokumentprojektion

Der Export serialisiert `visibleDocument`, nicht das Grunddokument. Beziehungen mit unsichtbaren Endpunkten sind dadurch bereits entfernt. Für eine sichtbare automatische Beziehung, deren `inferredFrom.sourceRelationshipId` in der Teilprojektion fehlt, wird nur diese Herkunftsmetadaten-Referenz entfernt und die Beziehung als manuelle Beziehung mit unverändertem sichtbarem Status exportiert. So bleibt der sichtbare Eintrag erhalten, ohne zusätzliche ausgeblendete Personen oder Beziehungen in den Export einzuschleusen.

Alternative: Die Quellbeziehung samt ihren Endpunkten mitexportieren würde den Vertrag „genau die aktuelle Ansicht“ verletzen; die Beziehung komplett wegzulassen würde sichtbare Inhalte verlieren.

### Separater Exporthandler und sprechender Dateiname

`App` erhält einen eigenen Exporthandler. Er ruft die bestehende Serialisierung und den bestehenden `filePort` auf, setzt aber weder `fileName`, `isDirty`, `saveState` noch `unfilteredPersonIds` zurück. Ein reiner Dateinamen-Helfer bildet die sichtbare Filterbezeichnung und den beim Filterklick gespeicherten Anker ab. Für die direkte Vorfahrenansicht entsteht beispielsweise `Direkte Vorfahren Ernst Weber.yaml`; ohne personenbezogenen Filter wird `Stammbaum.yaml` verwendet. Zusätzliche aktive lokale/Leaf-Filter werden im zusammengesetzten Namen berücksichtigt, ohne den gespeicherten Filteranker durch eine spätere Auswahl zu ersetzen.

Der bestehende Downloadpfad erhält den Namen bereits über `link.download`. Der native `showSaveFilePicker` bekommt zusätzlich `suggestedName`, damit beide Browserpfade denselben Vorschlag verwenden.

### Verifikation mit TDD

Zuerst werden fehlschlagende Graph-View-Tests für beide kombinierten Filtermengen, Tests für Dateiname/Exportprojektion sowie ein App-/Playwright-Test für die sichtbare Exportdatei ergänzt. Danach werden Filterlogik, Exportprojektion, Dateiname, Button und Picker-Integration implementiert. Die bestehende Vollbaum-Speicherung wird mit ihren aktuellen Tests abgesichert.

## Risks / Trade-offs

- **[Risiko]** Ein gefilterter Export kann weniger Beziehungen enthalten als der Ursprungsbaum und dadurch fachlichen Kontext verlieren. → Der Dateiname und die UI kennzeichnen ihn als Export der aktuellen Filteransicht; das reguläre „Speichern“ bleibt der vollständige Export.
- **[Risiko]** Das Entfernen einer ausgeblendeten Inferenzquelle verändert deren automatische Herkunft im Teilbaum. → Nur die dangling Referenz und die automatische Herkunft werden für diesen isolierten Export entfernt; Status, Endpunkte, Kommentar und übrige Metadaten bleiben erhalten.
- **[Risiko]** Native Dateipicker unterstützen je nach Browser nicht dieselben Optionen. → Der Download-Fallback verwendet weiterhin `link.download`; `suggestedName` ist nur ein zusätzlicher Vorschlag.
