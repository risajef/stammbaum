## Why

Grosse Stammbäume lassen sich bereits lokal filtern, aber die aktuell sichtbare Teilfamilie kann nicht als eigenständige Datei weitergegeben werden. Zusätzlich fehlen kombinierte Vor- und Nachfahrenfilter, mit denen eine Person nach oben und unten verfolgt werden kann.

## What Changes

- Einen Export-Button für die aktuell angewendete Ansicht ergänzen.
- Den gefilterten Export als YAML mit nur sichtbaren Personen und Beziehungen erzeugen, ohne das Arbeitsdokument oder den Dirty-State zu verändern.
- Einen sprechenden Dateinamen aus Filter und ausgewählter Person bilden, zum Beispiel `Direkte Vorfahren Ernst Weber.yaml`.
- Die Blutlinienfilter um `Direkte Vor und Nachfahren` und `Erweiterte direkte Vor und Nachfahren` ergänzen.
- Die Blutlinienfilter um zwei kombinierte Modi ergänzen; ihre sichtbare Teilmenge wird anschließend automatisch mit dem bestehenden Layoutalgorithmus angeordnet.

## Capabilities

### New Capabilities

- `filtered-family-tree-export`: Gefilterte YAML-Teilbäume mit automatisch gebildeten Dateinamen exportieren.

### Modified Capabilities

- `family-tree-views`: Kombinierte direkte und erweiterte Vor-/Nachfahrenfilter als zusätzliche lokale Ansichten anbieten.

## Impact

- Ansichtsfilter und Filterprojektion in `src/graph/graph-view.ts`.
- Filtertoolbar und Exportaktion in `src/App.tsx` sowie die zugehörigen Styles.
- Wiederverwendung der bestehenden YAML-Serialisierung und Browser-Dateischnittstelle.
- Unit-, Komponenten- und Playwright-Tests für Filtermenge, Dateiname und Exportinhalt.

Nicht im Scope sind Änderungen am YAML-Schema, an der normalen Vollbaum-Speicherung oder an den bestehenden Filtersemantiken.
