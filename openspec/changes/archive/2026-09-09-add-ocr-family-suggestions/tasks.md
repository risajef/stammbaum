## 1. Herkunft im Beziehungsmodell und YAML

- [x] 1.1 Schreibe zuerst fehlschlagende Unit- und Roundtrip-Tests für `manual`, `ocr-suggestion` und `automatic-inference`, für schemaVersion-1-Dateien ohne `origin` sowie für die Erhaltung von Quelle und Begründung; verifiziere den roten Zustand mit `npm test`.
- [x] 1.2 Ergänze das kompatible optionale `origin` im Beziehungsmodell, in YAML-Parser und -Serializer und setze die Herkunft an manuellen beziehungsweise automatisch abgeleiteten Erzeugungspfaden; verifiziere mit den in 1.1 angelegten Tests und anschließend `npm test`.
- [x] 1.3 Schreibe fehlschlagende Tests für die gemeinsame sichtbare Kennzeichnung der drei Beziehungsherkünfte in Graph-Projektion und Relationship-Inspector; verifiziere den roten Zustand mit `npm test`.
- [x] 1.4 Implementiere Herkunftsbadges/-klassen in Graph und Detailansicht, ohne bestehende Beziehungen oder den vorhandenen Filter-Workflow zu verlieren; verifiziere mit den Tests aus 1.3 und `npm run build`.

## 2. Node-Backend für lokale OCR-Quellen

- [x] 2.1 Schreibe zuerst fehlschlagende Tests für Linux-Pfadvalidierung, rekursive `run.json`-Entdeckung, das Überspringen laufender/unvollständiger Läufe und die Auswahl des neuesten vollständigen Laufs je Buch und Modell; verifiziere den roten Zustand mit `npm test`.
- [x] 2.2 Implementiere den read-only Node-OCR-Reader für `run.json` und `text/page-*.txt`, einschließlich Abschnitts-/Seitenmetadaten, verständlicher Einzeldateifehler und PP-OCRv6-Priorität; verifiziere mit 2.1 und `npm test`.
- [x] 2.3 Schreibe fehlschlagende API-Tests für `POST /api/ocr/read`, Pfad im Request, ungültige Pfade, leere Quellen, CORS/Loopback und eine unveränderte OCR-Quelle nach dem Lesen; verifiziere den roten Zustand mit `npm test`.
- [x] 2.4 Implementiere den lokalen Node-Prozess und das Startskript ohne neue Laufzeitabhängigkeit; verifiziere mit 2.3 und einem gestarteten `npm run backend`.
- [x] 2.5 Aktualisiere die Quellenlink-Tests auf Buch-/Seiten-ID, URL-Kodierung und den Review-Default `http://127.0.0.1:8767/review`; verifiziere mit `npm test`.

## 3. Abschnittsbezogene OCR-Erkennung

- [x] 3.1 Schreibe zuerst fehlschlagende Tests mit kleinen aus den echten OCR-Läufen abgeleiteten Fixtures für `Familienregister`, `Taufen`, `Heiraten` und `Begräbnisse`, einschließlich Tabellen-/Zeilenumbrüchen; verifiziere den roten Zustand mit `npm test`.
- [x] 3.2 Implementiere die Erkennung gegen bekannte Personen mit OCR-Normalisierung, klaren Sohn-/Tochter-/Kinder-, Ehe-/Geburtsnamen-Mustern und dem gerichteten Beziehungstyp; verifiziere mit 3.1 und `npm test`.
- [x] 3.3 Schreibe fehlschlagende Tests für PP-OCRv6-Priorität, Ergänzung durch das Handschriftmodell, unsichere Namen/Beziehungen, gleiche Vorschläge über mehrere Seiten und bereits vorhandene Personen oder Beziehungen; verifiziere den roten Zustand mit `npm test`.
- [x] 3.4 Ergänze Unsicherheitsfilter, stabile Vorschlags-IDs und Deduplizierung, ohne unbestätigte Kandidaten in den Dokumentzustand zu schreiben; verifiziere mit 3.3 und `npm test`.

## 4. Atomare Vorschlagsaktionen

- [x] 4.1 Schreibe fehlschlagende Domänentests für Annahme eines Eltern-Kind- und eines Ehevorschlags, Erhaltung von Quelle/Begründung/Herkunft, Ablehnung ohne Dokumentänderung und Fehler bei Duplikaten/ungültigen Kandidaten; verifiziere den roten Zustand mit `npm test`.
- [x] 4.2 Implementiere die atomare Annahme- und Ablehnungsoperation als testbare Domänengrenze; verifiziere mit 4.1, dass bei Fehlern weder Person noch Beziehung teilweise übernommen wird.
- [x] 4.3 Schreibe fehlschlagende Tests dafür, dass offene Vorschläge nicht Teil des YAML-Exports sind und angenommene Vorschläge erst über den bestehenden Speichern-Workflow exportiert werden; verifiziere den roten Zustand mit `npm test`.
- [x] 4.4 Verbinde Annahme mit Dirty-State und bestehendem YAML-Speichern, ohne automatisch eine Datei zu schreiben; verifiziere mit 4.3 und `npm test`.

## 5. Vorschlagsoberfläche

- [x] 5.1 Schreibe fehlschlagende Komponententests für Linux-Pfadeingabe, Backend-Verbindungsstatus, Importstatus, zusammengefasste Quellen-/Seitenanzeige, Fehlerzustand und die leere Vorschlagsliste; verifiziere den roten Zustand mit `npm test`.
- [x] 5.2 Ersetze die OCR-Ordner-/Dateiauswahl durch eine Pfadaktion neben dem vorhandenen Öffnen-Dialog und zeige geladene Quellen, Fortschritt sowie verständliche, pfadbereinigte Backend-/Importfehler an; verifiziere mit 5.1 und `npm run build`.
- [x] 5.3 Schreibe fehlschlagende Komponententests für Vorschlagskarten mit Dokumenten-/Buchname, Modell, Seite, klickbarem Review-Link (`target="_blank"`) und OCR-Herkunftsbadge; verifiziere den roten Zustand mit `npm test`.
- [x] 5.4 Implementiere die Dokumentbezeichnung in `OcrPage`/`OcrSuggestion` und den klickbaren Quelllink in `OcrSuggestionsPanel`; verifiziere mit 5.3 und `npm test`.
- [x] 5.5 Schreibe fehlschlagende Tests für sichtbare Unterschiede zwischen offenen OCR-Vorschlägen, angenommenen OCR-Beziehungen, manuellen Beziehungen und automatischen Ableitungen; verifiziere den roten Zustand mit `npm test`.
- [x] 5.6 Integriere die Herkunftsdarstellung in Arbeitsfläche und Inspector und aktualisiere Auswahl/Ansicht nach Annahme oder Ablehnung; verifiziere mit 5.5 und `npm run build`.

## 6. Ende-zu-Ende-Arbeitsablauf

- [x] 6.1 Aktualisiere den Playwright-Test für Stammbaum öffnen, lokalen Backend-Prozess starten, Linux-Pfad eingeben und den Graphen mit darunterliegender Vorschlagsliste inklusive klickbarem Quelllink und Dokumentenname prüfen; verifiziere mit `npm run test:e2e`.
- [x] 6.2 Vervollständige den Playwright-Happy-Path um Annahme, sichtbaren Dirty-State und erneutes Speichern/Öffnen mit erhaltener `ocr-suggestion`-Herkunft; verifiziere mit `npm run test:e2e`.
- [x] 6.3 Ergänze den E2E-Fall für Ablehnung und stelle fest, dass Personen- und Beziehungszahl unverändert bleiben; verifiziere mit `npm run test:e2e`.

## 7. Abschlussprüfung

- [x] 7.1 Führe die vollständige Testsuite mit `npm test` aus und behebe Regressionen, ohne die bereits vorhandenen uncommitteten Benutzeränderungen zu überschreiben.
- [x] 7.2 Führe `npm run build` und `npm run test:e2e` mit dem Node-Backend aus; verifiziere den lieferbaren Build und dokumentiere verbleibende Umgebungsrisiken wie einen nicht laufenden lokalen Review-Server.
- [x] 7.3 Prüfe `git diff` und `git status --short`, dass nur die OCR-Vorschlagsimplementierung und ihre OpenSpec-Artefakte auf `feat/ocr-family-suggestions` enthalten sind; verifiziere, dass weder Kirchenbuch-OCR-Dateien noch die bestehende Stammbaum-YAML verändert wurden.
