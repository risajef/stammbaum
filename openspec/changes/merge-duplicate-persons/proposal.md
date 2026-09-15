## Why

Durch Erfassung derselben Person aus unterschiedlichen Blickwinkeln können im Stammbaum doppelte Personendatensätze entstehen. Eine kontrollierte Fusion soll solche Duplikate zu einer Person zusammenführen und dabei die vorhandenen Familienbeziehungen erhalten, ohne eine unsichere oder genealogisch unzulässige Zuordnung stillschweigend zu akzeptieren.

## What Changes

- Eine ausgewählte Person kann mit einer zweiten, über die Arbeitsfläche oder Personensuche ausgewählten Person fusioniert werden.
- Die zuerst ausgewählte Person bleibt mit ihrer ID bestehen; der zweite Personendatensatz wird dauerhaft entfernt.
- Personendaten werden feldweise zusammengeführt: fehlende optionale Werte werden ergänzt, präzisere Teil-Datumswerte übernommen und widersprüchliche Werte abgelehnt. Kommentare beider Personen bleiben erhalten.
- Alle Beziehungen, die auf eine der beiden Personen verweisen, werden auf die verbleibende Person umgeschrieben. Dadurch zusammenfallende Beziehungen werden zu einer Beziehung zusammengeführt; bedeutungslose Selbstbeziehungen werden entfernt.
- Die Fusion wird abgelehnt, wenn nach der Umschreibung ein Kind mehr als zwei eindeutige Eltern hätte. Bei einer Ablehnung bleibt das gesamte Dokument unverändert.
- Nach einer erfolgreichen Fusion werden die Positionen aus dem resultierenden Familiengraphen neu berechnet; die alte Position der entfernten Person wird nicht übernommen.
- Die automatische Layoutberechnung bestimmt vertikale Ebenen relativ zur ersten Person im YAML als Root, sodass Eltern moeglichst auf der direkt vorherigen Generation liegen und ungleich lange DAG-Aeste keine grossen Spruenge erzeugen.
- Vor dem destruktiven Vorgang wird eine sichtbare Warnung mit expliziter Bestätigung angezeigt. Die Fusion kann danach nicht rückgängig gemacht werden und erzeugt einen ungespeicherten Dokumentzustand.
- Die YAML-Schema-Version und die bestehende lokale Dateiablage bleiben unverändert.

## Capabilities

### New Capabilities

Keine. Die Fusion erweitert die bestehende Bearbeitungsfähigkeit des Stammbaums.

### Modified Capabilities

- `family-tree-editor`: Personen können restriktiv, datenbewusst und destruktiv fusioniert werden; Beziehungen und automatische Ableitungen müssen im resultierenden Dokument konsistent bleiben.

## Impact

- Domänenlogik für atomare Personenfusion, Datenkonflikte, Beziehungsumschreibung und Elternanzahlprüfung.
- Arbeitsflächen- und Inspektor-UI für Start, Auswahl der zweiten Person, Bestätigung und Fehlermeldungen.
- Anpassung des bestehenden DAG-Layouts zur Neuberechnung der sichtbaren Positionen und zur relationalen Generationseinteilung.
- Automatische Beziehungsableitungen und YAML-Import/-Export müssen mit dem fusionierten Dokument kompatibel bleiben.
- Unit-, Komponenten- und Anwendungstests; keine neue Abhängigkeit und keine Änderung des YAML-Schemas.
