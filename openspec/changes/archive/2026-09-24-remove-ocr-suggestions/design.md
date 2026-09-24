## Context

Die Anwendung enthält aktuell eine OCR-Funktion über mehrere Grenzen hinweg: React-Zustand und Panel, OCR-Erkennungs- und Importmodule, einen lokalen Node-Dienst, YAML-Herkunftsmetadaten sowie Unit- und E2E-Tests. Der Duplikatbereich liegt momentan innerhalb des Canvas und war in der Spezifikation mit dem OCR-Bereich gekoppelt.

## Goals / Non-Goals

**Goals:**

- Den OCR-Laufzeitpfad einschließlich UI, Backend, Parsern, Fixtures, Tests und Startskript vollständig entfernen.
- Den Datenvertrag auf `manual` und `automatic-inference` reduzieren und ältere `ocr-suggestion`-Werte beim YAML-Laden verlustarm als `manual` übernehmen.
- Den bestehenden manuellen Such- und Duplikatworkflow erhalten.
- Den Duplikatbereich als letzten Arbeitsbereich-Abschnitt unterhalb von Canvas und Inspektor rendern.

**Non-Goals:**

- Keine Änderung der manuellen Namenssuche oder der Duplikatbewertung.
- Keine Entfernung allgemeiner Quellen-URLs, Kommentare oder automatischer Beziehungsableitungen.
- Keine Änderung bereits gespeicherter Personen- oder Beziehungsdaten außer der Normalisierung der entfernten OCR-Herkunft beim Laden.

## Decisions

1. **OCR-Dateien werden entfernt statt deaktiviert.**
   Die Import- und Analysegrenzen werden gelöscht und nicht nur aus der Oberfläche ausgeblendet. Dadurch bleiben keine ungenutzten Endpunkte, Abhängigkeiten oder asynchronen Zustände zurück. Die Alternative eines versteckten Panels würde weiterhin Wartungs- und Sicherheitsfläche behalten.

2. **Historische OCR-Herkünfte werden beim Einlesen zu `manual`.**
   Der YAML-Parser akzeptiert den alten Wert ausschließlich als Kompatibilitätsmigration und normalisiert ihn sofort. Der interne Typ, die Validierung, der Export und die UI kennen danach nur noch `manual` und `automatic-inference`. So bleiben alte Dateien ladbar, ohne OCR als aktuelle Funktion fortzuführen.

3. **Der Duplikatbereich wird aus dem Canvas herausgezogen.**
   `DuplicatePairsPanel` bleibt fachlich unverändert und wird als letzter Grid-Eintrag nach dem Inspektor gerendert. Ein eigenes Layoutattribut sorgt dafür, dass er auf Desktop die volle Breite einnimmt; die bestehenden mobilen Reihenfolgen bleiben dadurch ebenfalls eindeutig.

4. **OCR-spezifische Tests werden gelöscht, allgemeine Verträge angepasst.**
   Tests für den entfernten OCR-Workflow und den Server entfallen. YAML-, Domain- und Projektionsprüfungen decken weiterhin manuelle/automatische Herkunft sowie die Legacy-Normalisierung ab. Ein App-Test prüft das Nichtvorhandensein des OCR-Bereichs und die Position des Duplikatbereichs.

## Risks / Trade-offs

- **[Risiko]** Alte YAML-Dateien mit `ocr-suggestion` könnten beim Entfernen des Enum-Werts nicht mehr laden. → Der Parser akzeptiert diesen Legacy-Wert einmalig und normalisiert ihn zu `manual`; der Roundtrip exportiert keinen OCR-Wert mehr.
- **[Risiko]** Das Herausziehen des Duplikatbereichs verändert die DOM-/Grid-Reihenfolge. → Ein UI-Test prüft, dass der Bereich nach Canvas und Inspektor gerendert wird; Navigation und Toggle bleiben über dieselbe Komponente erhalten.
- **[Risiko]** Verwaiste OCR-Referenzen bleiben in CSS oder Spezifikationen zurück. → Nach der Löschung wird der Quellbaum nach `ocr`, `OCR` und `ocr-suggestion` geprüft; nur historische archivierte OpenSpec-Dokumente dürfen diese Begriffe weiterhin enthalten.

## Migration Plan

1. OCR-UI, Backend, Parser, Tests und Fixtures entfernen; das `backend`-Skript aus `package.json` löschen.
2. Legacy-YAML-Normalisierung und allgemeine Herkunftstests aktualisieren.
3. Duplikatbereich unterhalb des Inspektors platzieren und UI-/E2E-Prüfungen anpassen.
4. Unit-Tests, Build und verbleibende E2E-Tests ausführen. Ein Rollback besteht aus dem Wiederherstellen des archivierten OCR-Changes und der entfernten Dateien.
