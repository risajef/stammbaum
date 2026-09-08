## Why

Bei groesseren Stammbauemen fehlt eine schnelle Moeglichkeit, Personen zu finden und den sichtbaren Ausschnitt auf die relevante Verwandtschaft zu begrenzen. Die neuen Ansichten sollen die Orientierung verbessern, ohne die fachlichen Daten oder den bestehenden automatischen Layoutalgorithmus zu veraendern.

## What Changes

- Eine Namenssuche durchsucht Vor- und Nachnamen der aktuell sichtbaren Personen ohne Beachtung der Gross-/Kleinschreibung.
- Die Treffer koennen in einer stabilen Reihenfolge vom aeltesten zum juengsten Geburtsdatum angesprungen werden; unbekannte oder nicht parsebare Geburtsdaten stehen am Schluss.
- Eine lokale Ansicht zeigt die Personen bis zu einer waehlbaren Distanz im ungerichteten Beziehungsgraphen; Eltern-Kind- und Ehebeziehungen zaehlen jeweils als ein Schritt.
- Eine Blutsverwandtschaftsansicht zeigt nur Personen, die vom Anker aus ueber Eltern-Kind-Ketten mit beliebig vielen Aufwaertsschritten und danach beliebig vielen Abwaertsschritten erreichbar sind; Wege mit einem Abwaertsschritt gefolgt von einem Aufwaertsschritt sowie die daran angeschlossenen Partnerfamilien werden ausgeschlossen.
- Ein Leaf-Filter blendet Personen ohne Kinder in den vollstaendigen Grunddaten aus.
- Die Ansichtsfilter sind kombinierbar und werden vor dem bestehenden Layout berechnet.
- Wird die aktuell ausgewaehlte Person durch einen Filter ausgeblendet, wird die Auswahl aufgehoben.

## Capabilities

### New Capabilities

- `family-tree-views`: Suchnavigation und nichtpersistente, kombinierbare Personenfilter fuer die Arbeitsflaeche.

### Modified Capabilities

Keine bestehenden Requirements werden geaendert; die neuen Regeln werden als eigene View-Capability beschrieben.

## Impact

- `src/graph/graph-projection.ts` erhaelt die getestete Filterprojektion vor der bestehenden Layoutberechnung.
- `src/App.tsx` und `src/index.css` erhalten Such-, Distanz-, Blutsverwandtschafts- und Leaf-Steuerungen sowie die Auswahlssynchronisation.
- Neue Domain-/Graph-Tests und fokussierte UI-Tests decken Filterkombinationen, Suchreihenfolge und die unveraenderten Grunddaten ab.
- Es werden keine neuen Abhaengigkeiten und keine Aenderungen am YAML-Schema benoetigt.

## Assumptions

- Ein aktivierter Distanzfilter benoetigt eine ausgewaehlte Person als Anker; ohne Anker bleibt die volle Personenmenge sichtbar, bis eine Person ausgewaehlt wird.
- Die Trefferreihenfolge vergleicht bekannte Geburtsjahr-, Monats- und Tageskomponenten nur dann weiter, wenn die jeweilige Komponente auf beiden Seiten bekannt ist; bei nicht unterscheidbaren Daten entscheidet die Dokumentreihenfolge.
- Eine Suche arbeitet nur auf der jeweils sichtbaren Node-Menge und veraendert Filter oder Grunddaten nicht.
- Eltern-Kind-Beziehungen sind gerichtet (`fromId` ist der Elternteil, `toId` das Kind); die Blutansicht folgt vom Anker zuerst nur zu Vorfahren und von dort nur zu Nachkommen.
- Die vom Nutzer genannte Titel-Aenderung fuer Beatrix Delafontaine und Stefan Huber gehoert zu einem anderen Repository und ist nicht Bestandteil dieser Aenderung.
