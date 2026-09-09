## Why

Die bestehende Stammbaum-GUI kann eine YAML-Datei anzeigen und Beziehungen manuell erfassen, aber der Browser-Upload ist für die bereits lokal vorliegenden OCR-Daten ungeeignet: Ein Ordner mit rund 36.788 Dateien würde vollständig an die Website übertragen. Die OCR-Ergebnisse sollen deshalb von einem lokalen Node-Prozess aus einem ausdrücklich eingegebenen Linux-Pfad gelesen und als prüfbare Familienhinweise genutzt werden.

## What Changes

- Ein lokaler Node-Prozess liest den eingegebenen Linux-Pfad rekursiv und stellt die normalisierten OCR-Seiten über eine lokale API bereit.
- Die GUI verwendet ein Pfad-Eingabefeld und keinen Browser-Ordnerupload beziehungsweise keine `File`-Objekte mehr für OCR.
- Der Backend-Scan berücksichtigt nur vollständige OCR-Läufe und wählt pro Buch und Modell den neuesten Lauf; PP-OCRv6 ist die primäre Evidenz, das deutsche Handschriftmodell ergänzt nur bei abweichenden oder fehlenden Hinweisen.
- Für geladene Stammbäume werden aus erkannten Mustern der Kirchenbuchabschnitte `Familienregister`, `Taufen`, `Heiraten` und `Begräbnisse` prüfbare Vorschläge für neue Personen und Beziehungen erzeugt.
- Jeder Vorschlag zeigt die vorgeschlagenen Personendaten, Beziehung, Begründung, OCR-Textausschnitt und einen klickbaren Quellenlink mit Dokumenten-/Buchname, Modell und Seite zur Review-Anwendung; interne OCR-Dateipfade werden in der GUI nicht angezeigt.
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
- Der Node-Prozess benötigt keinen Zugriff auf das Schwester-Repository als Code, liest aber den vom Benutzer angegebenen OCR-Ausgabepfad read-only; Kirchenbuch- und YAML-Bestände werden nicht verändert.
- Die lokale GUI erhält einen Pfadimport und verlinkt die Vorschläge direkt zur Review-Anwendung unter `http://127.0.0.1:8767` mit Dokument-, Modell- und Seitenangabe.
- Es werden keine neuen Laufzeitabhängigkeiten benötigt. Bestehende manuelle Beziehungen, Dateioperationen und automatische Ehepartner-Eltern-Ableitungen bleiben funktionsfähig.
- Die Erkennung ist bewusst ein Vorschlagsmechanismus: OCR-Fehler und mehrdeutige Namen werden nicht stillschweigend als gesicherte Genealogie gespeichert.
