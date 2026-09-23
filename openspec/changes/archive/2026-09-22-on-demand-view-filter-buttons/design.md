## Context

Die bestehende View-Projektion nimmt `anchorPersonId` und `bloodlineMode` aus einem gemeinsamen Optionsobjekt. In `App.tsx` wird der Blutlinienanker aktuell aus der laufenden Personenauswahl abgeleitet; deshalb ändert ein Node-Klick unter einem aktiven Blutlinienmodus sofort die Projektion. Die Filterung ist ansonsten bereits eine reine Dokumentprojektion vor dem Layout. Siehe `proposal.md` und die Delta-Spezifikation für das gewünschte Verhalten.

## Goals / Non-Goals

**Goals:**

- Den Blutlinienmodus mit dem beim Buttonklick ausgewählten Anker koppeln, nicht mit jeder späteren Auswahl.
- Lokalen Anker und Blutlinienanker getrennt führen, damit eine Kombination der Filter nicht versehentlich einen der beiden Anker durch einen Node-Klick verschiebt.
- Neu angelegte Personen bis zum erfolgreichen YAML-Speichern aus allen View-Filtern ausnehmen und danach wieder in die normale Projektion einbeziehen.
- Die bestehenden Filterregeln, Beziehungen, Layouts und Persistenzdaten unverändert lassen.

**Non-Goals:**

- Keine Änderung an der Semantik der Blutlinien-, Vorfahren-, lokalen oder Leaf-Mengen.
- Keine Filterpersistenz im YAML und keine neuen YAML-Felder.
- Kein dauerhafter UI-Zustand, der einen zuletzt verwendeten Button als aktiv markiert.

## Decisions

1. **Angewendeten Blutlinienfilter als Modus-plus-Anker speichern:** `App.tsx` hält den zuletzt explizit angewendeten Blutlinienmodus zusammen mit seiner `anchorPersonId`. Die Filterbuttons ersetzen diesen Zustand nur in ihrem `onClick`-Handler. Node-Auswahl-Handler ändern ihn nicht; „Alle Personen“ setzt ihn zurück. Ohne ausgewählte Person bleiben personenbezogene Klicks wirkungslos.

2. **Separate Graph-View-Anker:** `GraphViewOptions` erhält neben dem bestehenden lokalen `anchorPersonId` einen optionalen Blutlinienanker. Die Filterfunktion fällt für bestehende Aufrufer auf `anchorPersonId` zurück, wenn kein separater Blutlinienanker angegeben ist. Damit bleiben die bestehenden Graph-View-Tests und die Kombination mit alten Aufrufen kompatibel, während `App.tsx` lokale und explizit angewendete Blutlinienfilter unabhängig halten kann.

3. **Nicht gespeicherte Personen als View-Ausnahme:** `GraphViewOptions` trägt eine Liste neu angelegter Personen-IDs, die nur im React-Zustand existiert. Die Filterfunktion berechnet zunächst wie bisher die Schnittmenge aller aktiven Filter und fügt danach vorhandene Ausnahme-IDs wieder zur sichtbaren Personenmenge hinzu. Beziehungen bleiben weiterhin auf sichtbare Endpunkte beschränkt. Die Liste wird beim erfolgreichen YAML-Speichern sowie beim Erzeugen oder Öffnen eines neuen Dokuments geleert; bei einem fehlgeschlagenen Speichern bleibt sie erhalten.

4. **Bestehende Persistenzgrenzen beibehalten:** Die Ausnahme-IDs werden weder in `FamilyTreeDocument` noch in `serializeFamilyTreeYaml` aufgenommen. Nur der erfolgreiche Abschluss von `filePort.save` beendet die Ausnahme. Dadurch bleiben Filter und neue Personen bis zum tatsächlichen Speichern rein lokale Zustände.

5. **Testgrenzen:**
   - `filterFamilyTreeDocument` wird als öffentliche Graph-View-Schnittstelle auf getrennte Anker und neue, filterunabhängige Personen getestet.
   - `App` wird über zugängliche Buttons, sichtbare Nodes und den Person-Inspektor getestet: Buttontyp ohne Checked-Zustand, Filteranker bleibt beim Personenwechsel stabil, erneuter Klick übernimmt den neuen Anker, und neue Personen bleiben bis zum erfolgreichen Speichern sichtbar.
   - Der Test `src/App.test.tsx` stubbt den bestehenden Datei-Port wie die vorhandenen Save-/Open-Szenarien; kein privater React-State wird direkt geprüft.

## Risks / Trade-offs

- **[Risk]** Eine neue Person kann nach dem Speichern durch den aktiven Filter sofort unsichtbar werden, während sie zuvor im Inspektor ausgewählt war. **Mitigation:** Die bestehende Sichtbarkeitssynchronisation bereinigt eine dann ungültige Auswahl; der Zustand ist durch den Speichervorgang ausdrücklich ausgelöst.
- **[Risk]** Ein separater Blutlinienanker kann in alten direkten Aufrufen übersehen werden. **Mitigation:** Die Filterfunktion verwendet den bisherigen `anchorPersonId` als Fallback und erhält die vorhandene Optionsform kompatibel.
- **[Risk]** Eine Set- oder Array-Änderung könnte die bestehende Neuberechnung des Layouts nicht auslösen. **Mitigation:** Die neue ID-Liste wird in die View-Optionen und den stabilen View-Key aufgenommen; ein fokussierter App-Test prüft die sichtbare Projektion.

## Migration Plan

Keine Datenmigration und keine Abhängigkeitserweiterung. Die Standardansicht bleibt ohne angewendeten Filter unverändert. Ein Rollback entfernt den zusätzlichen View-Zustand und die Filterausnahme; bereits gespeicherte YAML-Dateien bleiben kompatibel.
