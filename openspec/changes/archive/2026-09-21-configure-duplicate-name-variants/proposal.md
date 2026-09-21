## Why

Die Duplikatsuche erkennt derzeit nur exakt gleiche Schreibweisen von Vor- und Nachnamen. Historische Daten enthalten jedoch häufig Schreibvarianten wie `Schelling`/`Schilling`, `Weber`/`Wäber` oder `Jacob`/`Jakob`; außerdem kann ein zweiter Vorname bei einer Erfassung fehlen.

## What Changes

- Führe eine editierbare `duplicate-name-variants.yaml` im Projekt-Root ein.
- Definiere getrennte, symmetrische Namensvariantengruppen für Vor- und Nachnamen.
- Erlaube bei Vornamen einen Match, wenn die Tokens des kürzeren Namens vollständig im zusammengesetzten längeren Vornamen enthalten sind.
- Bewahre die bestehende Geburtsdatumskompatibilität, Priorisierung, den Eltern-Kind-Ausschluss und die unveränderte readonly-Navigation bei.
- Binde die Root-Konfiguration beim Build in die Browser-Anwendung ein.

## Capabilities

### New Capabilities

- `duplicate-name-variants`: Konfigurierbare Schreibvarianten und Teilmatches für die Duplikaterkennung.

### Modified Capabilities

Keine.

## Impact

- Neue Root-Datei `duplicate-name-variants.yaml`.
- Neue Konfigurations-/Matchinglogik unter `src/graph/`.
- Anpassung der Duplikatpaarbildung in `src/graph/graph-view.ts` sowie Graph-Tests.
- Keine Änderung am YAML-Stammbaumformat und keine automatische Fusion oder Datenmutation.
