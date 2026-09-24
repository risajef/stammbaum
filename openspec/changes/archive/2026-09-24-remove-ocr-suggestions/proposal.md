## Why

Die OCR-Vorschläge werden nicht genutzt und erschweren die Bedienung neben der manuellen Personensuche. Die zugehörige Oberfläche, der lokale Dienst und die zusätzliche Herkunftslogik verursachen zudem unnötige Wartungs- und Testlast.

## What Changes

- **BREAKING** Die OCR-Importaktion, OCR-Personensuche, Vorschlagskarten, OCR-Backend, OCR-Parser, Fixtures und ihre Tests werden vollständig entfernt.
- **BREAKING** Neue Beziehungen kennen nur noch die Herkünfte `manual` und `automatic-inference`; bereits gespeicherte `ocr-suggestion`-Herkünfte werden beim Laden kompatibel als `manual` behandelt.
- Der Bereich „Duplikate“ bleibt mit manueller Suche, Navigation und Toggle erhalten und wird als eigener Bereich unterhalb von Arbeitsfläche und Inspektor angezeigt.
- Die fachlichen Spezifikationen werden um die entfernte OCR-Fähigkeit und die neue Duplikatposition bereinigt.

## Capabilities

### New Capabilities

Keine neuen Fähigkeiten.

### Modified Capabilities

- `family-tree-ocr-suggestions`: Die nicht mehr angebotene OCR-Fähigkeit wird vollständig entfernt.
- `family-tree-editor`: Die Beziehungsherkunft wird auf manuelle und automatische Ableitungen reduziert; alte OCR-Herkünfte werden kompatibel eingelesen.
- `family-tree-views`: Der Duplikatbereich steht am Ende des Arbeitsbereichs und ist nicht mehr an einen OCR-Bereich gekoppelt.

## Impact

- Betroffen sind `src/App.tsx`, die Beziehungs-/YAML-Domäne, die Graphdarstellung, CSS, OCR- und Serverdateien sowie zugehörige Tests und E2E-Fixtures.
- Das `backend`-NPM-Skript und der lokale OCR-Server entfallen.
- Bestehende Stammbaumdaten bleiben ladbar; nur die historische OCR-Herkunft wird beim Laden in `manual` normalisiert.
