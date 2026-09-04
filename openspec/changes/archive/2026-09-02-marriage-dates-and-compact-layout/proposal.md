## Why

Ehe- und Eltern-Kind-Beziehungen sind in der aktuellen Arbeitsflaeche schwer zu unterscheiden, und die automatisch erzeugte Familienanordnung verbraucht zu viel Platz. Ausserdem fehlt bei Ehen der zeitliche Kontext, obwohl ein Startdatum und ein durch den Tod eines Ehepartners impliziertes Ende fachlich relevant sind. Die Benutzerin soll Familien kompakt lesen, Verschwaegerungen von Elternschaften unterscheiden und neue Personen unmittelbar im sichtbaren Arbeitsbereich wiederfinden koennen.

## What Changes

- Ehen erhalten ein optionales `startDate` mit den Formaten `YYYY`, `YYYY-MM` oder `YYYY-MM-DD`.
- Das Ehe-Enddatum wird nicht als eigenes Datenfeld gespeichert, sondern aus den Todesdaten beider Ehepartner als fruehestes sicher bestimmbares Datum abgeleitet; solange das nicht sicher bestimmbar ist, bleibt die Ehe offen.
- Der Beziehungsinspektor erfasst das Startdatum bei Ehen und zeigt Start- und implizites Enddatum an.
- Ehe- und Eltern-Kind-Kanten werden weich und visuell eindeutig getrennt dargestellt; Eltern-Kind-Kanten behalten eine klare Richtung zum Kind.
- Die automatische Anordnung wird auf kompakte Familienbloecke mit engeren horizontalen und vertikalen Abstaenden umgestellt, ohne gespeicherte Positionen zu verwenden.
- Neu angelegte Personen erhalten nach dem Speichern eine temporaere Position in der Mitte des aktuellen sichtbaren Canvas-Bereichs.
- Bestehende YAML-Dateien ohne `startDate` und schemaVersion 1 bleiben importierbar; die Schema-Version und vorhandenen Feldnamen werden nicht geaendert.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-editor`: Ehe-Startdaten, implizite Ehe-Enddaten, eindeutige weiche Beziehungskanten und die Positionierung neu angelegter Personen werden ergaenzt.
- `family-tree-automation`: Die automatische Familienanordnung wird kompakter und gruppiert Ehepaare sowie Kinder staerker als zusammengehoerige Bloecke.

## Impact

Betroffen sind das Relationship-Modell und seine Domain-Operationen, Dokumentvalidierung, YAML-Import/-Export, der Beziehungsinspektor, die React-Flow-Kantenprojektion, die automatische Layoutberechnung, die App-Integration fuer neue Personen sowie Unit-, Komponenten- und E2E-Tests. Es werden keine neuen Abhaengigkeiten benoetigt; die yFiles-TreeLayout-Dokumentation dient als Gestaltungsreferenz, die bestehende React-Flow-Projektion bleibt die Integrationsgrenze.

**User Outcome:** Familien sind auf der Arbeitsflaeche platzsparender und schneller lesbar; Eheverbindungen koennen von Elternschaften unterschieden werden; Ehezeiten und neue Personen sind unmittelbar nachvollziehbar.

**Scope:** Datenspeicherung, Validierung, Anzeige, Kantenform, automatische Positionierung und gezielte Tests fuer diese Verhaltensaenderungen.

**Nicht-Ziele:** Keine Migration auf neue YAML-Schluessel fuer Personendaten, keine Speicherung des abgeleiteten Ehe-Endes, keine Server- oder Datenbankfunktion, kein vollstaendiger Austausch der React-Flow-Engine durch yFiles.

**Constraints:** schemaVersion 1 bleibt erhalten; Teil-Datumswerte behalten ihre Genauigkeit; unbekannte Datumskomponenten werden nicht erfunden; temporaere Node-Positionen bleiben UI-Zustand und werden nicht exportiert.

**Akzeptanzkriterien:**

- Eine Ehe kann ein gueltiges optionales Startdatum roundtrip-sicher speichern und anzeigen.
- Ein implizites Ende erscheint nur als fruehestes sicher bestimmbares Todesdatum beider Partner.
- Ehe- und Eltern-Kind-Kanten sind auf der Arbeitsflaeche ohne Inspektor unterscheidbar; die Elternschaft zeigt zum Kind.
- Ein verbundener Stammbaum wird deterministisch kompakter angeordnet, ohne Nodes zu ueberlappen.
- Eine neu gespeicherte Person erscheint im aktuellen sichtbaren Canvas-Bereich zentriert.
- Fokus- und Gesamttests, Build und OpenSpec-Validierung bleiben gruen.

**Annahmen und offene Fragen:** Die vorangegangene Bestaetigung wird als Zustimmung zu folgenden Details verstanden: ein einzelnes Startdatumsfeld mit Partial-Date-Format, ein implizites Ende nur bei zwei sicher vergleichbaren Todesdaten, und mehrere Ehen bleiben als kompakte Partnerbloecke in derselben Generation angeordnet. Es bestehen keine offenen fachlichen Fragen.
