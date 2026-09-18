## Context

Die bestehende Graph-Projektion erzeugt die Daten für jeden React-Flow-Personen-Knoten aus dem vollständigen `Person`-Datensatz. Der Knoten zeigt bereits Geschlecht und Lebensdaten, verwendet aber eine gemeinsame CSS-Darstellung. Lebensdaten sind als vollständiges oder partielles Jahr/Monat/Tag modelliert und werden über die bestehende Teildatums-Validierung geparst.

## Goals / Non-Goals

**Goals:**

- Die Projektion liefert eine deterministische Anzeige-Klassifikation für Geschlecht und Minderjährigenstatus.
- Der sichtbare Knoten erhält unterscheidbare Klassen für Frau, Mann, unbekanntes Geschlecht sowie die hellere Minderjährigen-Variante.
- Die Farbentscheidung bleibt rein visuell und verändert keine Dokumentdaten, Beziehungen, Handles oder Exportpfade.

**Non-Goals:**

- Keine neuen Personenfelder, Altersangaben, Filter, Legende oder persistierten Farbwerte.
- Keine Änderung an Beziehungskanten, Ehe-Handles, Layout, Auswahlverhalten oder der Darstellung im Inspector.

## Decisions

- **Klassifikation in der Graph-Projektion:** Die Projektion berechnet aus den bestehenden `birthYear`- und `deathYear`-Werten ein boolesches Anzeige-Merkmal. Dazu werden die Jahreskomponenten mit `parsePartialDate` gelesen; nur bei zwei gültigen Jahren und einer nichtnegativen Differenz kleiner als 18 gilt eine Person als minderjährig. Das hält `PersonNode` präsentationsorientiert und behandelt fehlende bzw. ungültige Werte wie vereinbart als volljährig.
- **Anzeige-Merkmal statt neuer Fachdaten:** `PersonNodeData` erhält `isMinor`. Eine Alterszahl oder ein neues Domain-Feld wäre persistierbare Fachlogik ohne Nutzerbedarf und würde die YAML-Struktur unnötig erweitern.
- **CSS-Klassen statt Inline-Farben:** `PersonNode` ergänzt Klassen für die Geschlechtskategorie und bei Bedarf `person-node--minor`. Bestehende Palette und CSS-Variablen werden wiederverwendet; die Geschlechtsfarben werden als dezente Knotenfläche, oberer Akzent und Glyph-Farbe sichtbar gemacht. Gegenüber Inline-Styles bleibt die Darstellung zentral wartbar und testbar über die gerenderte Knotenklasse.
- **Unbekanntes Geschlecht:** Personen mit `gender: null` erhalten eine neutrale Kategorie. Der Minor-Marker darf bei ihnen keine Frauen- oder Männerfarbe aktivieren; fehlende Geschlechtsdaten bleiben visuell neutral.

## Risks / Trade-offs

- **[Risiko]** Bei nur jahresgenauen oder partiellen Daten kann ein exaktes Alter innerhalb des Jahres nicht bestimmt werden. → Die bestätigte Produktregel verwendet ausschließlich die Jahresdifferenz; fehlende/ungültige Jahreskomponenten werden als volljährig behandelt.
- **[Risiko]** Eine ausgewählte oder per Hover hervorgehobene Person könnte ihre Grundfarbe weniger deutlich zeigen. → Die bestehenden Auswahl-/Hover-Rahmen und Schatten bleiben erhalten, während der geschlechtsspezifische obere Akzent bestehen bleibt.
- **[Trade-off]** Die CSS-Farbe ist über Klassen sichtbar, aber nicht als gespeicherte Konfiguration änderbar. → Farbkonfiguration ist ausdrücklich nicht Teil des gewünschten Umfangs; die bestehende Designpalette liefert die festen Farben.

## Migration Plan

Keine Datenmigration. Die Änderung ist abwärtskompatibel, weil nur zur Laufzeit aus bereits vorhandenen Personendaten Anzeigeinformationen berechnet werden. Ein Rollback entfernt die zusätzlichen Projek­tionsdaten, Klassen und CSS-Regeln; YAML-Dateien bleiben unverändert.
