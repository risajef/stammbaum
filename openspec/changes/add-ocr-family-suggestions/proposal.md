## Why

Die bestehende Stammbaum-GUI kann eine YAML-Datei anzeigen und Beziehungen manuell erfassen, bietet aber noch keine Arbeitsoberfläche, um Personen aus den bereits lokal vorliegenden Kirchenbuch- und OCR-Daten systematisch zu prüfen. Dadurch müssen mögliche Verwandte außerhalb des Stammbaums gesucht und anschließend ohne durchgängigen Quellenbezug nachgetragen werden.

## What Changes

- Die GUI kann einen lokalen OCR-Datenordner mit den vorhandenen `run.json`- `alto/page-*.xml` und `text/page-*.txt`-Artefakten einlesen.
- Für geladene Stammbäume werden aus erkannten Familienregister-Mustern prüfbare Vorschläge für neue Personen und Beziehungen erzeugt.
- Jeder Vorschlag zeigt die vorgeschlagenen Personendaten, Beziehung, Begründung, OCR-Textausschnitt und einen klickbaren Seitenlink zur lokalen Review-GUI.
- Vorschläge können einzeln angenommen oder abgelehnt werden; eine Ablehnung verändert den Stammbaum nicht.
- Beim Annehmen werden Person und Beziehung in den aktuellen Dokumentzustand übernommen und erst über den bestehenden Speichern-Dialog in YAML geschrieben.
- Beziehungen erhalten eine persistente Herkunft, damit manuelle Beziehungen, OCR-Vorschläge und bestehende automatische Ableitungen in der GUI unterscheidbar bleiben.
- Bestehende YAML-Dateien ohne Herkunftsfeld bleiben importierbar und werden kompatibel als manuell beziehungsweise bei vorhandener automatischer Herkunft als automatische Ableitung behandelt.

## Capabilities

### New Capabilities

- `family-tree-ocr-suggestions`: Lokales Einlesen von OCR-Daten sowie Erzeugung, Anzeige, Annahme und Ablehnung quellenbezogener Personenvorschläge.

### Modified Capabilities

- `family-tree-editor`: Beziehungen erhalten eine kompatible Herkunftskennzeichnung, die beim Import, Export und in der visuellen Arbeitsfläche erhalten bleibt.

## Impact

- Betroffen sind die React-Arbeitsfläche, die Domänenmodelle und YAML-Serialisierung im Repository `/home/wer/Code/stammbaum`.
- Es wird kein Zugriff auf das Schwester-Repository zur Laufzeit benötigt und kein Kirchenbuch- oder YAML-Bestand direkt verändert.
- Die lokale Browser-GUI erhält einen zusätzlichen Ordner-/Dateiimport für OCR-Text und nutzt standardmäßig Seitenlinks zur laufenden Review-Anwendung unter `http://127.0.0.1:8765`.
- Es werden keine neuen Laufzeitabhängigkeiten benötigt. Bestehende manuelle Beziehungen, Dateioperationen und automatische Ehepartner-Eltern-Ableitungen bleiben funktionsfähig.
- Die Erkennung ist bewusst ein Vorschlagsmechanismus: OCR-Fehler und mehrdeutige Namen werden nicht stillschweigend als gesicherte Genealogie gespeichert.
