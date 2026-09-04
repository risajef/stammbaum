## Context

Die Arbeitsflaeche besteht aktuell aus einer linken Werkzeug-/Legenden-Rail, einer zentralen React-Flow-Uebersicht und einem rechten Inspektor. Der Button zum Anlegen einer Person sitzt in der linken Rail, waehrend die Uebersichtszeile bereits den passenden Kontext fuer diese Aktion besitzt. Die Anwendung verwendet ausserdem in aktuellen deutschen UI- und Fehlermeldungstexten ASCII-Ersatzformen fuer Umlaute.

## Goals / Non-Goals

### Goals

- Die linke Rail vollstaendig entfernen und dadurch die Graphflaeche verbreitern.
- Den vorhandenen Personen-anlegen-Handler ueber einen Plus-Button in der Uebersichtszeile ausloesen.
- Den zugreifbaren Namen `Person anlegen` beibehalten.
- Aktuelle sichtbare deutsche Texte und die zugehoerigen Testtexte auf echte Umlaute umstellen.
- Desktop-, Tablet- und Mobil-Layout nach dem Entfernen der Spalte funktionsfaehig halten.

### Non-Goals

- Keine Aenderung am Personenformular, Dokumentmodell, YAML-Schema oder Familienlayout.
- Keine Aenderung an internen Symbolnamen, CSS-Klassennamen, IDs oder archivierten OpenSpec-Dokumenten.
- Keine neue UI-Aktion neben dem bereits vorhandenen Erstellungsfluss.

## Decisions

### 1. Bestehenden Erstellungsfluss wiederverwenden

Der neue Button ruft denselben Handler wie bisher auf: Auswahl und Verbindungsentwurf werden geloescht und `isCreatingPerson` wird gesetzt. Dadurch bleibt der Personeninspektor unveraendert und die Komponententests muessen keinen zweiten Erstellungsweg abdecken.

### 2. Button in der Uebersichtszeile

Die `.canvas-heading` erhaelt einen sichtbaren Button mit `+`-Symbol und dem bestehenden zugreifbaren Namen `Person anlegen`. Der Button wird neben Status und Personenanzahl platziert und erhaelt eine stabile kompakte Groesse. Die bisherige linke Rail einschliesslich Legende wird aus dem JSX entfernt.

### 3. Grid ohne Werkzeugspalte

Das Desktop-Grid wird auf `minmax(0, 1fr) 224px` reduziert. Die Tablet-Regel verwendet eine einzelne Graphspalte; der Inspektor bleibt darunter. Mobile bleibt ein vertikaler Flex-Stack. Nicht mehr benoetigte Rail- und Legendenregeln werden entfernt, waehrend gemeinsame Button-Grundstile lokal weiterverwendet werden.

### 4. Sichtbare Texte statt interne Bezeichner

Die Ersetzung betrifft deutschsprachige String-Literale in `src`, sichtbare Accessible-Namen und deren Test-Locators. Fachliche englische Werte, interne Identifier und archivierte Dokumentation bleiben unveraendert. Die Textaenderung wird durch Suche nach den bekannten ASCII-Ersatzformen und durch die bestehende Unit-/E2E-Suite abgesichert.

## Risks / Trade-offs

- Das Entfernen der Rail nimmt die bisherige Legende aus der Ansicht. Das ist durch die Anforderung gedeckt; Beziehungstypen bleiben weiterhin an Kanten und im Inspektor erkennbar.
- Unicode-Umlaute erfordern UTF-8 in Quell- und Testdateien. Die betroffenen Dateien enthalten bereits deutschsprachige Texte und werden mit der bestehenden TypeScript-/Testkette validiert.
- E2E-Locators fuer geaenderte sichtbare Texte muessen gemeinsam aktualisiert werden, damit sie weiterhin die tatsaechliche Benutzeroberflaeche pruefen.
