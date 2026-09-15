## Context

Die fachliche Quelle bleibt das unveränderliche `FamilyTreeDocument`. Die bestehende Arbeitsfläche filtert dieses Dokument, berechnet daraus automatische Positionen und projiziert jede reale Person und Beziehung als React-Flow-Node beziehungsweise -Kante. Auswahl, temporäre Node-Positionen, Suche und Ansichtsfilter werden bereits als lokaler Zustand in `App` geführt. Der Beziehunginspektor ist der bestehende Einstiegspunkt für eine ausgewählte Ehe.

Die Anforderungen aus `specs/family-tree-editor/spec.md` dürfen weder eine neue Person im Domänenmodell noch eine persistierte Beziehung für die virtuelle Gruppe einführen. Die Projektion muss weiterhin mit den vorhandenen Ansichtsfiltern und dem bestehenden Layout arbeiten.

## Goals / Non-Goals

**Goals:**

- Einen kleinen, rein visuellen Zustand für aktive Kindergruppen modellieren.
- Die bestehende Dokumentprojektion um synthetische Gruppenknoten und umgeschriebene Anzeigeendpunkte erweitern.
- Originale Beziehungs-IDs und Metadaten an sichtbaren externen Kanten erhalten, damit deren bestehender Inspektor weiter funktioniert.
- Gruppenauswahl, Auffächern, Suche, Filter und temporäre Positionen ohne Änderung des Fachdokuments synchron halten.
- Den vorhandenen deterministischen Layoutalgorithmus für die resultierende Anzeige wiederverwenden.

**Non-Goals:**

- Eine Änderung an `Person`, `Relationship`, Inferenz, YAML-Schema oder Persistenz.
- Eine allgemeine Domänenoperation zum Gruppieren oder Zusammenführen von Personen.
- Eine Aggregation, Löschung oder fachliche Konsolidierung von Beziehungen.
- Eine neue Einstellung für dauerhaft gespeicherte Ansichten oder eine allgemeine Mehrfachauswahl von Personen.

## Decisions

### Der Einklappzustand gehört zur Arbeitsflächenprojektion

`App` hält eine flüchtige Sammlung aktiver Gruppen. Jede Gruppe wird stabil aus der ausgewählten Ehebeziehung identifiziert und enthält deren direkte gemeinsame Kinder als unveränderliche Mitgliederliste. Die Mitgliedermenge wird aus der Schnittmenge der eindeutigen `toId`-Werte von Eltern-Kind-Beziehungen beider Ehepartner gebildet; explizite und automatisch abgeleitete Beziehungen werden gleich behandelt.

Eine Gruppe ist nur mit mindestens zwei Mitgliedern gültig. Vor dem Aktivieren wird geprüft, ob ein Mitglied bereits zu einer anderen aktiven Gruppe gehört. In diesem Fall wird die neue Aktion nicht angeboten und der aktuelle Zustand bleibt unverändert. Die Gruppenliste wird bei jeder fachlichen Dokumentänderung und bei einem Dokumentwechsel geleert. Einklappen und Auffächern ändern weder `document` noch `isDirty`.

Alternative: Die Gruppen als synthetische `Person` in `FamilyTreeDocument` abzulegen, wäre einfacher für einzelne Projek­tionspfade, würde aber die Trennung von Ansicht und Fachmodell verletzen und könnte versehentlich exportiert oder bearbeitet werden.

### Die Projektion arbeitet mit einem Anzeigegraphen

Nach der bestehenden Filterung wird ein rein interner Anzeigegraph erstellt. Er enthält entweder einen realen Personenknoten oder einen virtuellen Gruppenknoten. Für eine aktive Gruppe erhält der Gruppenknoten eine aus der Ehebeziehungs-ID abgeleitete Anzeige-ID und das Label `<Anzahl> Kinder`; diese ID wird nirgends im Fachdokument gespeichert.

Für jede Beziehung werden die Endpunkte unabhängig voneinander abgebildet:

- Ein Endpunkt eines gruppierten Kindes wird durch die Gruppen-ID ersetzt.
- Beziehungen mit zwei Endpunkten innerhalb derselben Gruppe werden aus der Anzeige entfernt, damit keine Selbstkante entsteht.
- Jede andere Beziehung bleibt als eigene Anzeige-Kante mit ihrer ursprünglichen ID, Richtung, ihrem Typ und ihren Metadaten bestehen.
- Bei zwei oder mehr Kanten mit denselben Anzeigeendpunkten erfolgt keine Konsolidierung.

Die Eltern-Ehe bleibt eine normale sichtbare Beziehung. Eine Kante, die auf einen Gruppenknoten zeigt oder von ihm ausgeht, verweist im Inspector weiterhin über ihre originale Beziehungs-ID auf die echten Personenendpunkte.

Alternative: Die gefilterte `FamilyTreeDocument` direkt zu mutieren und danach zurückzusetzen, würde die Suche, Auswahl und Persistenz unnötig mit einem temporären Zustand koppeln und wird ausgeschlossen.

### Das bestehende Layout erhält Anzeigeobjekte statt Fachdaten

Die privaten Layout-Helfer werden so erweitert, dass sie die benötigten Eigenschaften eines Anzeigegraphen verarbeiten können. Reale Personen verwenden weiterhin ihre vorhandenen Layoutdaten; ein Gruppenknoten erhält neutrale Layoutdaten ohne erfundene Lebensdaten. Die Anzeigegraph-Beziehungen bilden die Eltern- und Ehekomponenten für die automatische Positionierung.

Temporäre Positionsüberschreibungen realer Kinder bleiben erhalten, auch wenn deren Knoten während des Einklappens nicht gerendert werden. Beim Auffächern können die Kinder dadurch an ihre vorherigen temporären Positionen zurückkehren. Eine Positionsüberschreibung des virtuellen Knotens wird beim Auffächern verworfen. Die Filterprojektion wird vor der Gruppenprojektion erstellt: Ist mindestens ein Gruppenmitglied durch einen Filter nicht sichtbar, wird die Gruppe für diesen Renderzyklus nicht aktiviert und die übrigen sichtbaren Kinder erscheinen einzeln.

Alternative: Beim Einklappen alle Positionen zu löschen und nach dem Auffächern immer vollständig neu zu layouten wäre deterministisch, würde aber die bereits erlaubte temporäre Arbeitsflächenanordnung unnötig verlieren.

### Auswahl und Inspektoren bekommen einen eigenen Gruppentyp

Die Graphauswahl wird um einen virtuellen Gruppentyp ergänzt. Die Sichtbarkeitsprüfung berücksichtigt neben Personen und Beziehungen auch Gruppenknoten, damit ein durch Filter deaktivierter Gruppenknoten nicht im Inspector verbleibt.

Bei ausgewählter Ehe berechnet die Anwendung die gemeinsame Kinderliste und übergibt sie dem Beziehunginspektor. Dieser zeigt nur bei mindestens zwei Kindern und ohne Gruppenüberschneidung die Einklappaktion; die Kinder werden gleichzeitig in der Projektion markiert. Ein ausgewählter Gruppenknoten öffnet einen kleinen Gruppeninspektor mit der Anzahl der Kinder und der Aktion zum Auffächern. Nach dem Auffächern wird die zugehörige Ehe wieder ausgewählt, sodass die Kinder erneut markiert und die Beziehungsaktion sichtbar sind.

Die Personensuche bleibt auf den echten Personen des gefilterten Dokuments. Wenn ein Suchtreffer zu einer aktiven Gruppe gehört, hebt die Navigation diese Gruppe zuerst auf und wählt danach die reale Person aus. Dadurch wird kein unsichtbarer Personenknoten als ausgewählt zurückgelassen.

### Dokument- und Ansichtszustände bleiben getrennt

Alle bestehenden erfolgreichen Datenänderungspfade, darunter Personen- und Beziehungsspeicherung, OCR-Übernahme, Dateiwechsel und die später hinzukommende Fusion, müssen den flüchtigen Gruppenzustand verwerfen. Reine View-Aktionen dürfen ausschließlich Gruppen-, Auswahl-, Filter- oder Positionszustand ändern. Der YAML-Export erhält immer das originale `document` ohne virtuelle Knoten oder Gruppenzustände.

## Risks / Trade-offs

- **[Parallele Kanten können visuell übereinanderliegen]** Mehrere getrennte Kanten mit identischen Anzeigeendpunkten können die gleiche Pfadgeometrie erhalten. **Mitigation:** Jede Kante behält ihre eigene ID und ihr eigenes React-Flow-Element; Projektionstests prüfen, dass keine Kante konsolidiert wird. Eine spezielle Parallelrouting- oder Linienversatzlogik bleibt außerhalb des Scopes.
- **[Ein Filter kann eine aktive Gruppe teilweise verdecken]** Ein Gruppenknoten mit unvollständiger Kinderliste wäre irreführend. **Mitigation:** Die Gruppe wird nur aktiviert, wenn alle Mitglieder im gefilterten Dokument sichtbar sind; andernfalls werden die sichtbaren Kinder einzeln projiziert.
- **[Ein veralteter Gruppenknoten könnte ausgewählt bleiben]** Filter und Datenänderungen können den Gruppenknoten aus der Projektion entfernen. **Mitigation:** Die Auswahl-Synchronisierung behandelt Gruppenknoten wie andere nicht sichtbare Objekte und verwirft sie.
- **[Synthetische Daten könnten versehentlich persistiert werden]** Ein virtueller Knoten darf nicht in Datei- oder Domänenoperationen gelangen. **Mitigation:** Die Projektion baut den Anzeigegraphen aus Kopien beziehungsweise Anzeigeobjekten und übergibt ausschließlich das originale Dokument an Domänen- und Persistenzfunktionen.
- **[Gemeinsame App-/Graph-Dateien enthalten parallele Arbeiten]** Der vorhandene `merge-duplicate-persons`-Change bearbeitet ebenfalls Arbeitsflächenlogik. **Mitigation:** Dieser Change bleibt auf den neuen flüchtigen Projek­tionszustand begrenzt und verändert keine Merge-Artefakte oder Merge-Domänenregeln.

## Migration Plan

Es ist keine Datenmigration erforderlich. Bestehende YAML-Dateien bleiben unverändert kompatibel, weil virtuelle Gruppen ausschließlich während der Laufzeit projiziert werden. Die Funktion kann durch Zurücknehmen der UI- und Projektionserweiterung vollständig entfernt werden, ohne gespeicherte Daten zurückzusetzen.

Die Umsetzung wird test-first durchgeführt: zuerst fehlschlagende Projek­tions-, Komponenten- und Anwendungstests, danach die kleinste Implementierung, anschließend `npm test` und `npm run build`.
