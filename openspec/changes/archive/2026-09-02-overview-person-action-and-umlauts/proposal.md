## Why

Die linke Werkzeugspalte nimmt dauerhaft Platz ein, obwohl die wichtigste Aktion dort nur eine Person anlegt. Die Aktion soll dort erscheinen, wo die Benutzerin die Übersicht bedient: direkt in der Übersichtszeile. Gleichzeitig wirken ausgeschriebene Umlaute wie `Ue`, `Ae` und `Oe` in der deutschsprachigen Oberfläche uneinheitlich und sollen durch echte deutsche Schriftzeichen ersetzt werden.

## What Changes

- Das separate Fenster bzw. die linke Rail mit der Überschrift „Werkzeuge“ wird aus der Arbeitsfläche entfernt.
- Ein klarer `+`-Button zum Anlegen einer Person wird in die Übersichtszeile des Graphen verschoben.
- Der bestehende Erstellungsfluss und der zugängliche Name „Person anlegen“ bleiben erhalten.
- Deutschsprachige UI-Texte, Fehlermeldungen und zugreifbare Testtexte verwenden `ä`, `ö`, `ü` und `Ä`, `Ö`, `Ü` statt ihrer ausgeschriebenen Varianten.
- Das zweispaltige Layout bleibt auf Desktop und mobilen Breiten erreichbar; die Legende entfällt mit dem Werkzeugfenster.

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `family-tree-editor`: Die Personenerstellung ist direkt in der Übersicht erreichbar, das unnötige Werkzeugfenster entfällt, und deutschsprachige Oberflächetexte verwenden korrekte Umlaute.

## Impact

- `src/App.tsx` für die neue Platzierung des Erstellungsbuttons und die UI-Texte.
- `src/index.css` für die reduzierte Grid-Struktur und den Button in der Übersichtszeile.
- Domain-, Persistence- und Inspector-Fehlermeldungen für konsistente sichtbare Umlaute.
- Komponententests und E2E-Selektoren für die geänderten zugänglichen Texte.
- Keine Änderung am Dokumentmodell, YAML-Schema oder an der Familienlogik.

## Assumptions

- „Alle Umlaute“ bezieht sich auf aktuelle deutschsprachige Produkttexte und die zugehörigen Testtexte, nicht auf interne JavaScript-/TypeScript-Identifier oder archivierte OpenSpec-Historie.
- Der bestehende Legendeninhalt wird zusammen mit dem Werkzeugfenster entfernt, weil die Anforderung das gesamte Fenster als unnötig bezeichnet.
