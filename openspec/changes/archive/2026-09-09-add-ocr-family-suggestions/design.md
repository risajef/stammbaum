## Context

Die bestehende React/Vite-Anwendung verwaltet ein geladenes `FamilyTreeDocument`, projiziert Personen und Beziehungen in React Flow und bietet bereits Dateiöffnen, YAML-Speichern sowie manuelle Beziehungsbearbeitung. Die reale OCR-Ausgabe unter `ocr-gpu-optimized` umfasst verschachtelte Laufverzeichnisse mit `run.json`, `text/page-*.txt`, PAGE/ALTO-Artefakten und Review-Protokollen. Sie enthält mehrere Modelle, doppelte Läufe sowie laufende und unvollständige Läufe.

Der Browser darf den lokalen Linux-Pfad nicht selbst lesen und darf die rund 36.788 Dateien nicht als Upload anfordern. Stattdessen läuft ein read-only Node-Prozess lokal auf Loopback und liefert der GUI nur normalisierte OCR-Metadaten und Textseiten. Die Beziehung enthält bereits Status-, Quellen- und Ableitungsinformationen. Die Erweiterung muss diese Daten kompatibel ausbauen und die vorhandene Datei- und Visualisierungslogik weiterverwenden. Die fachlichen Anforderungen stehen in `specs/family-tree-ocr-suggestions/spec.md` und `specs/family-tree-editor/spec.md`.

## Goals / Non-Goals

**Goals:**

- Einen vom Benutzer eingegebenen Linux-Pfad über einen lokalen Node-Prozess lesen und daraus nachvollziehbare, noch nicht übernommene Vorschläge erzeugen.
- OCR-Dateizugriff, Vorschlagsannahme und YAML-Serialisierung über kleine testbare Domänen-/Adaptergrenzen trennen.
- Quelle, OCR-Ausschnitt, Begründung und Herkunft sowohl im Vorschlag als auch nach der Übernahme erhalten; jede Vorschlagskarte bietet einen direkten Link zur Review-Anwendung mit Dokumenten-, Modell- und Seitenangabe, während interne OCR-Dateipfade verborgen bleiben.
- Die vorhandene Dateiöffnung, das Speichern und die React-Flow-Visualisierung möglichst unverändert weiterverwenden.

**Non-Goals:**

- Kein Browserzugriff auf lokale Dateien, kein Zugriff auf das Schwester-Repository als Laufzeitcode und keine automatische OCR-Neuverarbeitung.
- Keine automatische Entscheidung über unsichere genealogische Fakten und keine Änderung der bestehenden YAML-Daten ohne Annahme und anschließendes Speichern.
- Keine allgemeine Volltextsuche, keine externe Genealogie-Abfrage und keine neue persistente Datenbank für offene Vorschläge.

## Decisions

### Lokaler Node-Reader statt Browser-Upload

Die UI übergibt ein Pfadobjekt an den lokalen Node-Prozess. Der Prozess akzeptiert einen bestehenden Verzeichnispfad, prüft ihn und liest read-only. Er bindet ausschließlich an `127.0.0.1` und bietet eine kleine JSON-API mit `POST /api/ocr/read`; die Anfrage enthält den Pfad. Die GUI lädt damit weder Verzeichnisse noch einzelne Dateien hoch. Native Node-Datei- und HTTP-APIs vermeiden eine neue Laufzeitabhängigkeit.

Der Reader entdeckt `run.json` rekursiv, verwirft Läufe mit Status `running` oder `incomplete`, gruppiert vollständige Läufe nach Buch und Modell und wählt jeweils den neuesten `created_at`-Lauf. Für jedes Buch wird der PP-OCRv6-Lauf als primäre Quelle behandelt; das deutsche Handschriftmodell kann zusätzliche Evidenz liefern, aber bei doppelten Vorschlägen verliert es gegen PP-OCRv6. Fehlende oder beschädigte Seiten werden als einzelne Importprobleme zurückgegeben und verhindern nicht die Nutzung anderer Seiten.

### Normalisierte OCR-Seiten als Adaptergrenze

Der Backend-Reader liefert nur die für die Erkennung nötigen Werte aus `run.json` und `text/page-*.txt`: Buch-ID, Lauf-ID, Modell-ID, Seiten-ID, Seitennummer, Abschnitt, relativer Artefaktpfad, Text und Review-Quelllink. PAGE/ALTO-Bilder werden für die Vorschlagserkennung nicht übertragen. Die reine Erkennung bleibt im Frontend testbar und arbeitet auf diesem serialisierbaren DTO; sie sieht keinen Dateisystemzugriff.

### Reine, konservative Vorschlagserkennung

Die Erkennung erhält normalisierte OCR-Seiten und den geladenen Dokumentzustand und gibt ausschließlich serialisierbare `OcrSuggestion`-Werte zurück. Sie wertet bevorzugt die Abschnitte `Familienregister`, `Taufen`, `Heiraten` und `Begräbnisse` aus und ignoriert Register-/Verwaltungsseiten ohne Beziehungsmarker. Sie gleicht Namen zunächst gegen bereits geladene Personen ab und akzeptiert nur klare Muster, die eine vorhandene Bezugsperson und eine gerichtete Beziehung erkennen lassen, etwa `Sohn/Tochter des`, `Kinder`, `Ehegatte/Ehefrau` oder Geburtsnamen-Marker. Jeder Vorschlag enthält eine stabile Identität aus Bezugsperson, Beziehung, normalisiertem Kandidatennamen und Quelle/Seite.

Die Heuristik wird bewusst auf klare Muster begrenzt: Bei unklarem Namen oder Beziehungstyp entsteht kein Stammbaum-Eintrag. Vorhandene Personen und Beziehungen werden vor der Anzeige dedupliziert. So bleiben OCR-Fehler prüfbar, statt stillschweigend als genealogische Tatsachen gespeichert zu werden.

### Herkunft als kompatibles optionales Beziehungsfeld

`Relationship` erhält ein optionales `origin` mit den Werten `manual`, `ocr-suggestion` und `automatic-inference`. Beim Einlesen älterer YAML-Dateien wird das Feld aus `inferredFrom` abgeleitet, wenn es fehlt; alle übrigen alten Beziehungen gelten als manuell. Beim Erzeugen wird die Herkunft explizit gesetzt: manuelle Eingaben erhalten `manual`, bestehende Ehepartner-Eltern-Ableitungen erhalten `automatic-inference`, angenommene OCR-Vorschläge erhalten `ocr-suggestion`.

Die YAML-Schicht schreibt und liest das Feld ohne Änderung am bestehenden Dateiformat für andere Daten. Die Graph-Projektion und der Relationship-Inspector verwenden eine gemeinsame Herkunftskennzeichnung, damit Kanten und Details dieselbe Bedeutung anzeigen und alte Dateien weiterhin dargestellt werden können.

### Atomare Annahme als Domänenoperation

Die Annahme eines Vorschlags wird über eine reine Domänenoperation oder einen entsprechend kleinen, öffentlich testbaren Service ausgeführt. Sie validiert Kandidatenperson und Beziehung, prüft Duplikate und erzeugt dann in einem neuen Dokumentzustand Person und Beziehung mit `origin: ocr-suggestion`, Quellen-URL und Begründung. Bei einem Fehler wird kein Teilresultat in den React-State übernommen. Die Ablehnung entfernt ausschließlich den Vorschlag aus dem flüchtigen Vorschlagszustand.

Damit bleibt die UI für Statusmeldungen und Dirty-State zuständig, während die fachliche Atomizität ohne Browser- oder React-Tests abgesichert werden kann.

### Vorschlagsbereich als separater UI-Zustand

Die Anwendung erhält eine eigene OCR-Aktion neben dem vorhandenen Öffnen-Dialog und einen Vorschlagsbereich unterhalb der Stammbaum-Arbeitsfläche mit Importstatus, zusammengefasster Quellen-/Seitenanzahl, zusammengefassten Lesefehlern und Karten je Vorschlag. Jede Karte zeigt neue Person, Bezugsperson, Beziehung, Begründung, kurzen OCR-Ausschnitt, Herkunftsbadge sowie einen klickbaren Quellenlink mit Dokumenten-/Buchname, Modell und Seite zur Review-Anwendung (`target="_blank"`). Interne Dateipfade bleiben verborgen. Die vollständige Quelle bleibt im Vorschlagsobjekt und nach der Übernahme im YAML erhalten.

Offene und abgelehnte Vorschläge werden nicht Teil des `FamilyTreeDocument` und damit nicht exportiert. Nach Annahme wird der normale ungespeicherte Zustand aktiviert und die bestehende Speicheraktion verwendet. Die angenommene Beziehung ist in Graph und Inspector weiterhin mit `ocr-suggestion` gekennzeichnet; manuelle und automatische Beziehungen behalten eigene Kennzeichnungen.

### Verlinkte Quellenreferenz mit Dokumenten- und Seitennachweis

Der Reader identifiziert eine Seite stabil über Buch-ID und Seiten-ID und reicht den Buch-/Dokumentnamen aus `run.label` (bzw. `metadata.title` / `bookId`) über `OcrPage` bis in den Vorschlag durch. Die GUI rendert daraus einen klickbaren Link (z. B. `Kirchenbuch 1840 · PP-OCRv6 · Seite 103`), der direkt zur Review-Referenz führt (`http://127.0.0.1:8767/review?book_id=...&page_id=...`). Die Nichterreichbarkeit des lokalen Review-Servers verhindert weder Annahme noch Ablehnung, weil OCR-Ausschnitt und Herkunftsnachweis im Vorschlag erhalten bleiben.

### Teststrategie entlang öffentlicher Grenzen

Die Umsetzung folgt TDD in vertikalen Scheiben:

- Node-Reader- und API-Tests prüfen Pfadvalidierung, rekursive Laufentdeckung, Auswahl vollständiger/neuster Läufe, Modellpriorität und verständliche Fehler.
- Parser-/Normalisierungstests prüfen Seitenmetadaten, Abschnittsfilter und Review-URLs.
- Erkennungstests prüfen klare Eltern-Kind-/Ehe-Muster, unsichere OCR und Deduplizierung.
- Domänentests prüfen atomare Annahme, Ablehnung sowie Herkunft und Duplikatfehler.
- YAML-Roundtrip- und Komponententests prüfen Herkunftsbadges, Quellreferenzen mit klickbarem Link und Dokumentenbezeichnung, zusammengefasste Fehler, Dirty-State, Pfadeingabe und den bestehenden Öffnen-/Speichern-Workflow.
- Ein Playwright-Happy-Path startet den lokalen Backend-Prozess mit kleinen Fixture-Dateien, gibt einen Linux-Pfad ein, prüft den Graphen mit darunterliegender Vorschlagsliste inklusive klickbarem Quelllink und nimmt einen Vorschlag an.

Es werden keine neuen Laufzeitabhängigkeiten eingeführt. Bestehende Tests bleiben Teil jedes Prüflaufs.

## Risks / Trade-offs

- **OCR-Fehler erzeugen falsche Kandidaten** → Nur klare Muster vorschlagen, Textausschnitt und Quelle anzeigen und niemals automatisch übernehmen.
- **Sehr große OCR-Bäume verlangsamen den Import** → Dateisuche und Textlesen in den Node-Prozess verlagern, nur `run.json` und Textseiten verarbeiten und Fortschritt/Fehlerstatus als zusammengefasste Importstatistik anzeigen.
- **Der lokale Dienst läuft nicht** → Die GUI zeigt eine verständliche Verbindungsanweisung; der Stammbaum bleibt unverändert.
- **Lokaler Review-Server läuft nicht** → Die interne Quellenreferenz bleibt für Herkunft und YAML erhalten; Prüfung, Ablehnung und Übernahme hängen nicht von seiner Erreichbarkeit ab.
- **Mehrere Modelle und historische Duplikate erzeugen doppelte Kandidaten** → Neueste vollständige Läufe wählen, PP-OCRv6 priorisieren und Vorschläge anhand einer stabilen fachlichen Identität deduplizieren.
- **Alte YAML-Dateien besitzen kein `origin`** → Beim Import kompatible Defaults ableiten und beim Export nur die neue optionale Information ergänzen.
- **Gleichnamige Personen sind genealogisch nicht zwingend identisch** → Gleichnamigkeit nur zur Deduplizierung verwenden, niemals als automatische Identitätsentscheidung; die Vorschlagsbegründung macht den OCR-Kontext sichtbar.

## Migration Plan

1. In TDD-Scheiben Node-Reader/API, Domänenmodell, YAML-Roundtrip, Erkennung, Vorschlagsaktionen und UI implementieren.
2. Die bestehende YAML-Datei unverändert als Ausgangsformat weiter öffnen; `origin` beim nächsten Speichern optional ergänzen.
3. Bestehende manuelle und automatische Beziehungen beim Laden mit kompatiblen Herkunftswerten versehen.
4. Vor Übergabe `npm test`, `npm run build` und den relevanten Playwright-Test mit lokalem Node-Backend ausführen.
5. Rollback erfolgt durch Entfernen der neuen GUI-Änderungen beziehungsweise Zurücksetzen des Feature-Branches; vorhandene Stammbaumdateien bleiben unberührt.

## Open Questions

Keine. Die für Spezifikation und Aufgabenaufteilung relevanten Entscheidungen sind mit dem Benutzer geklärt.
