## Context

Die bestehende Anwendung speichert `FamilyTreeDocument` als einzige Datenquelle und projiziert Personen und Beziehungen auf React Flow. Bisher werden vorhandene Positionen bevorzugt, Knoten koennen gezogen werden, und eine Beziehung wird nur dann gespeichert, wenn sie explizit oder manuell als geschlussfolgert erfasst wurde. Die neue Funktion muss deshalb Dokumentmodell, YAML-Schema, Domainoperationen, Graphprojektion und Formulare gemeinsam aendern, ohne eine zweite Zustandsquelle einzufuehren.

## Goals / Non-Goals

### Goals

- Automatische, deterministische Positionen aus Ehe- und Eltern-Kind-Beziehungen berechnen.
- Ehekomponenten als horizontale Gruppen behandeln und Eltern-Kind-Kanten generationenweise nach unten anordnen.
- Sichere Ehepartner-Elternschaften nach jeder erfolgreichen Dokumentaenderung synchronisieren.
- Automatische Beziehungen von manuell als `inferred` markierten Beziehungen unterscheiden koennen.
- Kommentare an Personen und Beziehungen validiert, editierbar und YAML-roundtrip-faehig machen.
- Bestehende manuelle Beziehungen und deren Kommentare bei der Synchronisierung erhalten.
- Keine neue Abhaengigkeit und keine serverseitige oder versteckte Persistenz einfuehren.

### Non-Goals

- Keine automatische genealogische Bewertung jenseits der beschriebenen Ehe-/Elternregel.
- Keine automatische Ermittlung von Heiratsdaten oder weiteren Lebensereignissen.
- Kein freies grafisches Positionieren, kein zusaetzlicher Layout-Editor und keine automatische Namens- oder Quellenrecherche.
- Keine Loeschung oder Umdeutung manuell erfasster Beziehungen, auch wenn sie den automatisch ableitbaren Beziehungen aehneln.

## Decisions

### 1. Kommentare und Herkunft im Domainmodell

`Person` und `Relationship` erhalten jeweils `comment: string | null`. Ein leerer oder nur aus Leerraum bestehender Wert wird beim Speichern zu `null` normalisiert.

Eine Beziehung erhaelt zusaetzlich `inferredFrom: RelationshipInference | null`. Die Herkunft hat im MVP die Form:

```ts
interface RelationshipInference {
  rule: 'spouse-parent'
  sourceRelationshipId: string
}
```

Manuell erfasste Beziehungen behalten `inferredFrom: null`; auch eine manuell als `inferred` markierte Beziehung ist dadurch von einer automatisch erzeugten Beziehung unterscheidbar. Automatische Beziehungen sind immer `status: 'inferred'`. Die Dokumentvalidierung verlangt fuer eine Herkunft eine vorhandene, manuelle Eltern-Kind-Quellbeziehung und lehnt andere Kombinationen ab.

### 2. Zentrale Synchronisierung der automatischen Elternschaften

Eine frameworkfreie Funktion `synchronizeInferredRelationships(document)` entfernt zuerst alle automatisch markierten Beziehungen und berechnet sie aus den verbleibenden manuellen Beziehungen neu. Sie wird nach erfolgreichem Anlegen, Aendern oder Entfernen von Personen und Beziehungen sowie nach einem validierten Import aufgerufen.

Fuer jede manuelle Eltern-Kind-Beziehung `A -> C` werden die Ehepartner von A symmetrisch gesammelt:

- Bei genau einem Ehepartner B wird `B -> C` erzeugt, falls diese gerichtete Beziehung noch nicht manuell vorhanden ist.
- Bei mehreren Ehepartnern wird nur weitergeprueft, wenn C ein `birthYear` besitzt und jeder Ehepartner ein `deathYear` besitzt.
- Es bleiben genau die Ehepartner als Kandidaten, deren `deathYear >= C.birthYear` gilt. Genau ein Kandidat erzeugt die inferred-Beziehung; null oder mehrere Kandidaten erzeugen keine.

Die automatisch erzeugte ID ist aus Eltern- und Kind-ID deterministisch, damit Kommentare und optionale Quellen bei einer weiterhin gueltigen Beziehung erhalten bleiben. Die Herkunft verweist auf eine gueltige Quellbeziehung und wird bei einer erneuten Berechnung aktualisiert. Ein automatisch erzeugter Kommentar nennt die Quellbeziehung und die Eheableitung; ein bereits geaenderter Kommentar wird ueber die stabile ID bewahrt. Automatische Beziehungen koennen nicht direkt entfernt werden; sie verschwinden, wenn ihre Quellbeziehung oder Voraussetzung entfaellt. Manuelle Beziehungen bleiben unberuehrt.

### 3. Automatisches Layout als reine Graphprojektion

`projectFamilyTree` ignoriert gespeicherte oder importierte Positionen fuer die Darstellung und berechnet sie deterministisch neu. Ehebeziehungen werden mit Union-Find zu Ehekomponenten zusammengefasst. Die Komponenten bilden die Layout-Einheiten; dadurch liegen alle Partner auf derselben Hoehe und in einer benachbarten horizontalen Gruppe.

Eltern-Kind-Beziehungen werden auf Komponentenebene ausgewertet. Die Generation einer Komponente ist eine rekursive maximale Elterngeneration plus eins; Zyklen brechen auf Generation null ab. Innerhalb einer Generation werden Komponenten deterministisch angeordnet. Komponenten mit Eltern werden nach dem Mittelpunkt ihrer Eltern positioniert und bei Kollisionen von links nach rechts gepackt. So liegen Kinder unter den Eltern, und Geschwister teilen eine Hoehe. Ehepartner erhalten einen festen kleinen Abstand, Generationen einen groesseren festen Abstand.

Die React-Flow-Arbeitsflaeche setzt `nodesDraggable={false}` und verarbeitet kein Drag-Update mehr. Knotenpositionen bleiben damit eine reine Projektion und koennen nicht als zweite, vom Dokument losgeloeste Zustandsquelle entstehen.

### 4. YAML und UI

Das YAML-Schema nimmt `comment` und `inferredFrom` optional an und normalisiert fehlende Werte zu `null`, waehrend der Serializer beide Felder fuer den vollstaendigen Dokument-Roundtrip schreibt. Nach erfolgreicher Validierung synchronisiert die Anwendung fehlende sichere inferred-Beziehungen, bevor sie den neuen Dokumentzustand setzt.

Beide Inspektoren erhalten ein kompaktes Kommentar-Textfeld. Bei automatisch erzeugten Beziehungen bleibt der Status `inferred`; der Kommentar und eine optionale Quelle koennen zur Erklaerung bearbeitet werden. Die vorhandenen Accessible-Namen und der Download-/Upload-Dateiworkflow bleiben bestehen.

### 5. Teststrategie

- Domaintests pruefen Kommentare, stabile automatische Herkunft, Einzel-/Mehrfach-Ehe, fehlende Daten, eindeutige Todeszeit-Kandidaten, Entfall und symmetrische Ehepaare.
- Graphtests pruefen Ehe-Nachbarschaft, gemeinsame Hoehe, Kinderhoehe, Geschwisterhoehe und das Ignorieren gespeicherter Positionen.
- YAML- und Komponententests pruefen Kommentare/Herkunft sowie automatische Synchronisierung beim Import.
- Playwright prueft die effiziente Bedienung mit automatisch angeordneten Knoten, deaktiviertem Dragging und sichtbarer inferred-Erklaerung.