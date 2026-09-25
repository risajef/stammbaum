## Why

Gefilterte Teilstammbäume, etwa die Vor- und Nachkommen von Ruth beziehungsweise Ernst, können bereits einzeln als gültige YAML-Dateien exportiert werden. Es fehlt ein sicherer Arbeitsablauf, um eine beliebige Liste solcher Dateien anhand ihrer stabilen IDs zu einem gemeinsam geöffneten Stammbaum zu vereinigen, ohne die Daten manuell zusammenkopieren zu müssen.

## What Changes

- Eine eigene zugängliche Aktion „Stammbäume fusionieren“ nimmt eine beliebige Liste von YAML-Dateien zur Fusion entgegen.
- Alle ausgewählten Dateien werden vollständig eingelesen, geparst und validiert, bevor der aktuelle Stammbaum ersetzt wird.
- Personen und Beziehungen werden ausschließlich anhand ihrer stabilen IDs vereinigt; identische Einträge werden nur einmal übernommen.
- Unterschiedliche Inhalte unter derselben Personen- oder Beziehungs-ID erzeugen einen verständlichen Konfliktbericht und brechen die gesamte Fusion ohne Teilübernahme ab.
- Nach erfolgreicher Fusion wird das Ergebnis als neuer, ungespeicherter aktueller Stammbaum geöffnet; Auswahl, Ansichtsfilter und flüchtiger Arbeitszustand werden zurückgesetzt. Die Quelldateien bleiben unverändert.
- Wenn der aktuelle Stammbaum ungespeicherte Änderungen enthält, muss vor der Fusion eine Warnung bestätigt werden. Abbruch, Dateiauswahl-Abbruch, Parsefehler, Validierungsfehler und Konflikte lassen den bisherigen Arbeitsstand unverändert.
- Der normale Einzeldatei-Öffnen-, Speichern- und Export-Workflow sowie das YAML-Schema bleiben unverändert.

## Capabilities

### New Capabilities

- `family-tree-merge`: Mehrere gültige Stammbaum-YAML-Dateien anhand stabiler Personen- und Beziehungs-IDs atomar zu einem neuen aktuellen Stammbaum fusionieren.

### Modified Capabilities

Keine bestehenden Capability-Anforderungen werden geändert.

## Impact

- Die Dateifunktionen und die Arbeitsflächenintegration in `App` erhalten einen separaten Mehrdatei-Fusionspfad neben dem bestehenden Einzeldatei-Öffnen.
- Der Dateiport benötigt eine Mehrfachauswahl für YAML-Dateien beziehungsweise einen gleichwertigen Fallback, wenn die native Mehrfachauswahl nicht verfügbar ist.
- Eine getestete Domänen-/Persistenzfunktion vereinigt bereits normalisierte Dokumente, erkennt ID-Konflikte und validiert das zusammengeführte Ergebnis vor der Übernahme.
- Es sind keine neuen Abhängigkeiten, keine Schema-Migration und keine Änderungen an den Quelldateien erforderlich.
- Verifikation: fokussierte Fusions-, Dateiport- und App-Tests, anschließend `npm test` und `npm run build`.

