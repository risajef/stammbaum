## 1. Herkunft im Beziehungsmodell und YAML

- [ ] 1.1 Schreibe zuerst fehlschlagende Unit- und Roundtrip-Tests für `manual`, `ocr-suggestion` und `automatic-inference`, für schemaVersion-1-Dateien ohne `origin` sowie für die Erhaltung von Quelle und Begründung; verifiziere den roten Zustand mit `npm test`.
- [ ] 1.2 Ergänze das kompatible optionale `origin` im Beziehungsmodell, in YAML-Parser und -Serializer und setze die Herkunft an manuellen beziehungsweise automatisch abgeleiteten Erzeugungspfaden; verifiziere mit den in 1.1 angelegten Tests und anschließend `npm test`.
- [ ] 1.3 Schreibe fehlschlagende Tests für die gemeinsame sichtbare Kennzeichnung der drei Beziehungsherkünfte in Graph-Projektion und Relationship-Inspector; verifiziere den roten Zustand mit `npm test`.
- [ ] 1.4 Implementiere Herkunftsbadges/-klassen in Graph und Detailansicht, ohne bestehende Beziehungen oder den vorhandenen Filter-Workflow zu verlieren; verifiziere mit den Tests aus 1.3 und `npm run build`.

## 2. Browser-Adapter für lokale OCR-Quellen

- [ ] 2.1 Schreibe fehlschlagende Tests für die Gruppierung ausgewählter `run.json`-/`text/page-*.txt`-Dateien, das Überspringen nicht unterstützter oder beschädigter Dateien und die unveränderte Dokumentausgabe bei Importfehlern; verifiziere den roten Zustand mit `npm test`.
- [ ] 2.2 Implementiere einen kleinen OCR-Dateiadapter, der ausschließlich ausgewählte `File`-Objekte liest, Laufmetadaten und Seiten normalisiert und verständliche Fehler/Leerzustände zurückgibt; verifiziere mit 2.1 und `npm test`.
- [ ] 2.3 Schreibe fehlschlagende Tests für URL-Erzeugung aus Lauf-/Seitennachweis, URL-Kodierung und Bevorzugung eines gültigen Links aus `run.json`; verifiziere den roten Zustand mit `npm test`.
- [ ] 2.4 Implementiere den Quellenlink-Builder mit HTTP-/HTTPS-Validierung und dem lokalen Review-Default `http://127.0.0.1:8765`; verifiziere mit 2.3 und `npm test`.

## 3. Konservative OCR-Erkennung

- [ ] 3.1 Schreibe fehlschlagende Erkennungstests für klare Sohn-/Tochter-/Kinder-Muster, Ehe-/Geburtsnamen-Muster, OCR-Normalisierung, Begründung, Ausschnitt und Seitenquelle; verifiziere den roten Zustand mit `npm test`.
- [ ] 3.2 Implementiere die reine Erkennung gegen bekannte Personen mit den vorgesehenen Familienregister-Mustern und einem gerichteten Beziehungstyp; verifiziere mit 3.1 und `npm test`.
- [ ] 3.3 Schreibe fehlschlagende Tests für unsichere Namen/Beziehungen, gleiche Vorschläge über mehrere Seiten und bereits vorhandene Personen oder Beziehungen; verifiziere den roten Zustand mit `npm test`.
- [ ] 3.4 Ergänze Unsicherheitsfilter, stabile Vorschlags-IDs und Deduplizierung, ohne unbestätigte Kandidaten in den Dokumentzustand zu schreiben; verifiziere mit 3.3 und `npm test`.

## 4. Atomare Vorschlagsaktionen

- [ ] 4.1 Schreibe fehlschlagende Domänentests für Annahme eines Eltern-Kind- und eines Ehevorschlags, Erhaltung von Quelle/Begründung/Herkunft, Ablehnung ohne Dokumentänderung und Fehler bei Duplikaten/ungültigen Kandidaten; verifiziere den roten Zustand mit `npm test`.
- [ ] 4.2 Implementiere die atomare Annahme- und Ablehnungsoperation als testbare Domänengrenze; verifiziere mit 4.1, dass bei Fehlern weder Person noch Beziehung teilweise übernommen wird.
- [ ] 4.3 Schreibe fehlschlagende Tests dafür, dass offene Vorschläge nicht Teil des YAML-Exports sind und angenommene Vorschläge erst über den bestehenden Speichern-Workflow exportiert werden; verifiziere den roten Zustand mit `npm test`.
- [ ] 4.4 Verbinde Annahme mit Dirty-State und bestehendem YAML-Speichern, ohne automatisch eine Datei zu schreiben; verifiziere mit 4.3 und `npm test`.

## 5. Vorschlagsoberfläche

- [ ] 5.1 Schreibe fehlschlagende Komponententests für OCR-Ordner-/Dateiauswahl, Importstatus, Quellen-/Seitenanzeige, Fehlerzustand und die leere Vorschlagsliste; verifiziere den roten Zustand mit `npm test`.
- [ ] 5.2 Ergänze die OCR-Importaktion neben dem vorhandenen Öffnen-Dialog und zeige geladene Quellen, Fortschritt sowie verständliche Importfehler an; verifiziere mit 5.1 und `npm run build`.
- [ ] 5.3 Schreibe fehlschlagende Komponententests für Vorschlagskarten mit neuer Person, Bezugsperson, Beziehung, Begründung, OCR-Ausschnitt, klickbarem HTTP-/HTTPS-Link und OCR-Herkunftsbadge; verifiziere den roten Zustand mit `npm test`.
- [ ] 5.4 Implementiere Vorschlagsliste und Karten mit Link in neuem Browserkontext sowie einzelnem Annehmen/Ablehnen; verifiziere mit 5.3 und `npm test`.
- [ ] 5.5 Schreibe fehlschlagende Tests für sichtbare Unterschiede zwischen offenen OCR-Vorschlägen, angenommenen OCR-Beziehungen, manuellen Beziehungen und automatischen Ableitungen; verifiziere den roten Zustand mit `npm test`.
- [ ] 5.6 Integriere die Herkunftsdarstellung in Arbeitsfläche und Inspector und aktualisiere Auswahl/Ansicht nach Annahme oder Ablehnung; verifiziere mit 5.5 und `npm run build`.

## 6. Ende-zu-Ende-Arbeitsablauf

- [ ] 6.1 Lege kleine OCR-Fixtures und einen fehlschlagenden Playwright-Test für Stammbaum öffnen, OCR-Ordner importieren, Vorschlag prüfen und Quelle öffnen an; verifiziere den roten Zustand mit `npm run test:e2e`.
- [ ] 6.2 Vervollständige den Playwright-Happy-Path um Annahme, sichtbaren Dirty-State und erneutes Speichern/Öffnen mit erhaltener `ocr-suggestion`-Herkunft; verifiziere mit `npm run test:e2e`.
- [ ] 6.3 Ergänze den E2E-Fall für Ablehnung und stelle fest, dass Personen- und Beziehungszahl unverändert bleiben; verifiziere mit `npm run test:e2e`.

## 7. Abschlussprüfung

- [ ] 7.1 Führe die vollständige Testsuite mit `npm test` aus und behebe Regressionen, ohne die bereits vorhandenen uncommitteten Benutzeränderungen zu überschreiben.
- [ ] 7.2 Führe `npm run build` und `npm run test:e2e` aus; verifiziere den lieferbaren Build und dokumentiere verbleibende Umgebungsrisiken wie einen nicht laufenden lokalen Review-Server.
- [ ] 7.3 Prüfe `git diff` und `git status --short`, dass nur die OCR-Vorschlagsimplementierung und ihre OpenSpec-Artefakte auf `feat/ocr-family-suggestions` enthalten sind; verifiziere, dass weder Kirchenbuch-OCR-Dateien noch die bestehende Stammbaum-YAML verändert wurden.
