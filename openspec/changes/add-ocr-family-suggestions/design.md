## Context

Die bestehende React/Vite-Anwendung verwaltet ein geladenes `FamilyTreeDocument`, projiziert Personen und Beziehungen in React Flow und bietet bereits Dateiöffnen, YAML-Speichern sowie manuelle Beziehungsbearbeitung. Kirchenbuch-OCR liegt außerhalb des GUI-Repositories als lokale Laufstruktur mit `run.json` und `text/page-*.txt` vor. Der Browser darf weder auf einen festen Schwester-Repository-Pfad zugreifen noch einen Backend-Endpunkt voraussetzen.

Die Beziehung enthält bereits Status-, Quellen- und Ableitungsinformationen. Die Erweiterung muss diese Daten kompatibel ausbauen und die vorhandene Datei- und Visualisierungslogik weiterverwenden. Die fachlichen Anforderungen stehen in `specs/family-tree-ocr-suggestions/spec.md` und `specs/family-tree-editor/spec.md`.

## Goals / Non-Goals

**Goals:**

- Einen vom Benutzer ausgewählten OCR-Ordner im Browser lesen und daraus nachvollziehbare, noch nicht übernommene Vorschläge erzeugen.
- OCR-Auswertung, Vorschlagsannahme und YAML-Serialisierung über kleine testbare Domänen-/Adaptergrenzen trennen.
- Quelle, OCR-Ausschnitt, Begründung und Herkunft sowohl im Vorschlag als auch nach der Übernahme sichtbar halten.
- Die vorhandene Dateiöffnung, das Speichern und die React-Flow-Visualisierung möglichst unverändert weiterverwenden.

**Non-Goals:**

- Kein Zugriff der GUI auf feste lokale Pfade, kein Backend- oder Schwester-Repository-Change und keine automatische OCR-Neuverarbeitung.
- Keine automatische Entscheidung über unsichere genealogische Fakten und keine Änderung der bestehenden YAML-Daten ohne Annahme und anschließendes Speichern.
- Keine allgemeine Volltextsuche, keine externe Genealogie-Abfrage und keine neue persistente Datenbank für offene Vorschläge.

## Decisions

### Lokaler Dateiadapter statt Laufzeit-Zugriff auf das OCR-Repository

Die UI verwendet den bestehenden Browser-Dateidialog als Ordnerauswahl (`webkitdirectory`) und liest ausschließlich die daraus gelieferten `File`-Objekte. Als Fallback bleibt eine Mehrfachauswahl von `run.json` und `page-*.txt` möglich. Ein Adapter gruppiert Dateien anhand ihrer relativen Pfade, liest zunächst `run.json` und danach die passenden Textseiten und liefert normalisierte Seitenquellen samt Fehlern zurück. Bild- und XML-Artefakte werden nicht benötigt und ignoriert.

Das hält die Browser-Sicherheitsgrenze ein und vermeidet CORS-, Server- und Pfadannahmen. Der Import arbeitet zunächst in einem separaten OCR-Zustand; fehlerhafte Dateien können deshalb keinen bereits geladenen Stammbaum verändern.

### Reine, konservative Vorschlagserkennung

Die Erkennung erhält normalisierte OCR-Seiten und den geladenen Dokumentzustand und gibt ausschließlich serialisierbare `OcrSuggestion`-Werte zurück. Sie gleicht Namen zunächst gegen bereits geladene Personen ab und akzeptiert nur Familienregister-Muster, die eine vorhandene Bezugsperson und eine gerichtete Beziehung erkennen lassen, etwa `Sohn/Tochter des`, `Kinder`, `Ehegatte/Ehefrau` oder Geburtsnamen-Marker. Jeder Vorschlag enthält eine stabile Identität aus Bezugsperson, Beziehung, normalisiertem Kandidatennamen und Quelle/Seite.

Die Heuristik wird bewusst auf klare Muster begrenzt: Bei unklarem Namen oder Beziehungstyp entsteht kein Stammbaum-Eintrag. Vorhandene Personen und Beziehungen werden vor der Anzeige dedupliziert. So bleiben OCR-Fehler prüfbar, statt stillschweigend als genealogische Tatsachen gespeichert zu werden.

### Herkunft als kompatibles optionales Beziehungsfeld

`Relationship` erhält ein optionales `origin` mit den Werten `manual`, `ocr-suggestion` und `automatic-inference`. Beim Einlesen älterer YAML-Dateien wird das Feld aus `inferredFrom` abgeleitet, wenn es fehlt; alle übrigen alten Beziehungen gelten als manuell. Beim Erzeugen wird die Herkunft explizit gesetzt: manuelle Eingaben erhalten `manual`, bestehende Ehepartner-Eltern-Ableitungen erhalten `automatic-inference`, angenommene OCR-Vorschläge erhalten `ocr-suggestion`.

Die YAML-Schicht schreibt und liest das Feld ohne Änderung am bestehenden Dateiformat für andere Daten. Die Graph-Projektion und der Relationship-Inspector verwenden eine gemeinsame Herkunftskennzeichnung, damit Kanten und Details dieselbe Bedeutung anzeigen und alte Dateien weiterhin dargestellt werden können.

### Atomare Annahme als Domänenoperation

Die Annahme eines Vorschlags wird über eine reine Domänenoperation oder einen entsprechend kleinen, öffentlich testbaren Service ausgeführt. Sie validiert Kandidatenperson und Beziehung, prüft Duplikate und erzeugt dann in einem neuen Dokumentzustand Person und Beziehung mit `origin: ocr-suggestion`, Quellen-URL und Begründung. Bei einem Fehler wird kein Teilresultat in den React-State übernommen. Die Ablehnung entfernt ausschließlich den Vorschlag aus dem flüchtigen Vorschlagszustand.

Damit bleibt die UI für Statusmeldungen und Dirty-State zuständig, während die fachliche Atomizität ohne Browser- oder React-Tests abgesichert werden kann.

### Vorschlagsbereich als separater UI-Zustand

Die Anwendung erhält eine eigene OCR-Aktion neben dem vorhandenen Öffnen-Dialog und einen Vorschlagsbereich mit Importstatus, Quellen-/Seitenanzahl, Fehlern und Karten je Vorschlag. Jede Karte zeigt neue Person, Bezugsperson, Beziehung, Begründung, kurzen OCR-Ausschnitt, Herkunftsbadge und einen Link.

Offene und abgelehnte Vorschläge werden nicht Teil des `FamilyTreeDocument` und damit nicht exportiert. Nach Annahme wird der normale ungespeicherte Zustand aktiviert und die bestehende Speicheraktion verwendet. Die angenommene Beziehung ist in Graph und Inspector weiterhin mit `ocr-suggestion` gekennzeichnet; manuelle und automatische Beziehungen behalten eigene Kennzeichnungen.

### Quellenlinks aus Lauf- und Seitennachweis

Wenn `run.json` keinen konkreten Viewer-Link liefert, baut der Adapter als Standard `http://127.0.0.1:8765/?run_id=<runId>&page_number=<pageNumber>`, wobei Parameter URL-kodiert werden. Ein vorhandener gültiger HTTP-/HTTPS-Link wird bevorzugt. Der Link öffnet in einem neuen Browserkontext mit `noopener noreferrer`; seine Nichterreichbarkeit verhindert weder Annahme noch Ablehnung, weil OCR-Ausschnitt und Lauf-/Seitennachweis im Vorschlag erhalten bleiben.

### Teststrategie entlang öffentlicher Grenzen

Die Umsetzung folgt TDD in vertikalen Scheiben:

- Parser-/Normalisierungstests prüfen Dateigruppierung, ungültige Eingaben und Viewer-URLs.
- Erkennungstests prüfen klare Eltern-Kind-/Ehe-Muster, unsichere OCR und Deduplizierung.
- Domänentests prüfen atomare Annahme, Ablehnung sowie Herkunft und Duplikatfehler.
- YAML-Roundtrip- und Komponententests prüfen Herkunftsbadges, Quelllinks, Dirty-State und den bestehenden Öffnen-/Speichern-Workflow.
- Ein Playwright-Happy-Path verwendet kleine Fixture-Dateien, lädt einen Stammbaum, importiert OCR, nimmt einen Vorschlag an und prüft die sichtbare Herkunft.

Es werden keine neuen Laufzeitabhängigkeiten eingeführt. Bestehende Tests bleiben Teil jedes Prüflaufs.

## Risks / Trade-offs

- **OCR-Fehler erzeugen falsche Kandidaten** → Nur klare Muster vorschlagen, Textausschnitt und Quelle anzeigen und niemals automatisch übernehmen.
- **Sehr große Ordner verlangsamen den Browser** → Nur `run.json` und Textseiten verarbeiten, Fortschritt/Fehlerstatus anzeigen und Parsing sequenziell mit kleinen testbaren Einheiten ausführen.
- **Ordnerauswahl ist browserabhängig** → `webkitdirectory` nutzen, Mehrfachdatei-Fallback anbieten und bei leerem/inkompatiblem Input einen erklärenden Zustand anzeigen.
- **Lokaler Review-Server läuft nicht** → Link trotzdem als Quelle anbieten; Prüfung, Ablehnung und Übernahme dürfen nicht von der Erreichbarkeit abhängen.
- **Alte YAML-Dateien besitzen kein `origin`** → Beim Import kompatible Defaults ableiten und beim Export nur die neue optionale Information ergänzen.
- **Gleichnamige Personen sind genealogisch nicht zwingend identisch** → Gleichnamigkeit nur zur Deduplizierung verwenden, niemals als automatische Identitätsentscheidung; die Vorschlagsbegründung macht den OCR-Kontext sichtbar.

## Migration Plan

1. In TDD-Scheiben Domänenmodell, YAML-Roundtrip, OCR-Adapter, Erkennung, Vorschlagsaktionen und UI implementieren.
2. Die bestehende YAML-Datei unverändert als Ausgangsformat weiter öffnen; `origin` beim nächsten Speichern optional ergänzen.
3. Bestehende manuelle und automatische Beziehungen beim Laden mit kompatiblen Herkunftswerten versehen.
4. Vor Übergabe `npm test`, `npm run build` und den relevanten Playwright-Test ausführen.
5. Rollback erfolgt durch Entfernen der neuen GUI-Änderungen beziehungsweise Zurücksetzen des Feature-Branches; vorhandene Stammbaumdateien bleiben unberührt.

## Open Questions

Keine. Die für Spezifikation und Aufgabenaufteilung relevanten Entscheidungen sind mit dem Benutzer geklärt.
