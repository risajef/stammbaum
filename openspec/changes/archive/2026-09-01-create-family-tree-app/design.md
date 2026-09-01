## Context

Das Repository enthaelt bisher keine laufende Anwendung, sondern nur OpenSpec-Artefakte und ein kleines Beispiel fuer Personen- und Eltern-Kind-Kanten in `manual-knowledge.md`. Der MVP wird daher als neue lokale Browser-Anwendung aufgebaut. Der Browser darf keine Datenbank und keinen Server benoetigen; die YAML-Datei ist die portable Persistenz.

Die Anforderungen verlangen gleichzeitig schnelle grafische Bearbeitung, eine stabile Uebersicht bei manueller Anordnung und nachvollziehbare Beziehungsmetadaten. Die Domainenregeln muessen unabhaengig von der Darstellung pruefbar sein, insbesondere fuer Geschlecht, Beziehungsrichtung, Quellen-URL, Jahresangaben und atomaren Dateiimport.

## Goals / Non-Goals

**Goals:**

- Eine Arbeitsflaeche mit klarer Trennung zwischen Graph, Werkzeugleiste und Detailinspektor schaffen.
- Direkte Kanteninteraktion mit expliziter Wahl von Ehe oder Eltern-Kind und anschliessender Validierung ermoeglichen.
- Personen- und Beziehungsdaten samt Status, Quelle und Position in einem versionierten YAML-Dokument roundtrip-faehig speichern.
- Domainenlogik, YAML-Validierung und Dateiadapter so trennen, dass sie zuerst isoliert und danach in Browser-Workflows getestet werden koennen.
- Ungueltige Importe und ungespeicherte Ersetzungen ohne Teilueberschreiben behandeln.

**Non-Goals:**

- Kein Server, keine Datenbank und keine Anmeldung.
- Keine automatische Ableitung geschlussfolgerter Beziehungen.
- Keine Suche, Filter, Undo/Redo, Bilder, Ereignisse ausser Geburts-/Todesjahr, Zusammenarbeit oder weiteren Beziehungstypen.
- Keine mobile-first Optimierung; mobile Nutzung bleibt ueber eine responsive, eingeschraenkte Arbeitsflaeche moeglich, waehrend Desktop das primaere Ziel ist.

## Decisions

### 1. Versioniertes Domain-Dokument als einzige Datenquelle

Die Anwendung verwaltet ein `FamilyTreeDocument` mit dieser stabilen YAML-Struktur:

```yaml
schemaVersion: 1
persons:
  - id: person-uuid
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: 1834
    deathYear: 1901
    position:
      x: 120
      y: 80
relationships:
  - id: relationship-uuid
    type: marriage
    fromId: woman-person-uuid
    toId: man-person-uuid
    status: explicit
    sourceUrl: https://example.org/source
```

`gender`, `birthYear`, `deathYear` und `sourceUrl` duerfen leer sein, wobei `gender` nur `woman` oder `man` akzeptiert. Bei `marriage` zeigt `fromId` immer auf die Frau und `toId` auf den Mann; die Darstellung darf die Kante unabhaengig davon zeichnen, von welchem Knoten die Benutzerin sie begonnen hat. Bei `parent-child` zeigen `fromId` und `toId` vom Elternteil zum Kind. `position` ist Darstellungsmetadatum, wird aber mit exportiert, damit die persoenliche Anordnung erhalten bleibt.

Personen- und Beziehungs-IDs werden beim Anlegen zufaellig und stabil erzeugt. Beziehungen referenzieren ausschliesslich diese IDs. Das Dokumentmodell kennt die fachlichen Operationen zum Anlegen, Aendern und Entfernen; die UI darf diese Regeln nicht durch direkte Graphmutationen umgehen.

### 2. Pure Domainenregeln vor jeder Zustandsaenderung

Die Validierung wird als kleine, frameworkfreie Domainschicht umgesetzt. Sie prueft Pflichtfelder, ganze Jahreszahlen, die Reihenfolge von Geburts- und Todesjahr, erlaubte Geschlechts- und Statuswerte, HTTP-/HTTPS-URLs, vorhandene Referenzen, Selbstbeziehungen und doppelte Ehen. Eine Geschlechtsaenderung, die eine bestehende Ehe ungueltig machen wuerde, wird als fehlgeschlagene Operation zurueckgegeben.

Operationen liefern entweder ein neues gueltiges Dokument oder einen strukturierten Fehler mit Feld-/Objektbezug. So bleiben bestehende Daten bei einem Fehler unveraendert und Formulare koennen konkrete Meldungen anzeigen. Neue Beziehungen starten mit `explicit`, sofern die Benutzerin nicht beim Erstellen `geschlussfolgert` waehlt. Es gibt keinen Hintergrundprozess, der Beziehungen automatisch schlussfolgert.

### 3. Graphdarstellung als Projektion, nicht als Persistenz

Fuer Knoten, Kanten, Auswahl, Pan, Zoom und direkte Handles wird `@xyflow/react` verwendet. Die Bibliothek reduziert die Eigenimplementierung der Interaktionslogik; ihre Knoten- und Kantenobjekte werden aus `FamilyTreeDocument` abgeleitet und nicht separat gespeichert. Eine kleine Adapterebene uebersetzt Kantenrichtungen und Beziehungsstatus in die Darstellung:

- Ehe wird als ungerichtete visuelle Verbindung zwischen den beiden Partnern gezeigt.
- Eltern-Kind wird als gerichtete Verbindung vom Elternteil zum Kind gezeigt.
- Explizite Kanten sind durchgaengig, geschlussfolgerte Kanten gestrichelt und beide Status sind zusaetzlich textlich in der Detailansicht benannt.
- Verschieben eines Knotens aktualisiert nur `position`; die Anwendung bietet beim Laden ohne Positionen eine deterministische Anfangsanordnung nach Generationen.

Die Arbeitsflaeche besteht auf Desktop aus einer schmalen Werkzeugleiste, der zentralen Graphflaeche und einem rechts angedockten Inspektor. Der Inspektor zeigt immer genau das ausgewaehlte Objekt und vermeidet modale Formulare fuer normale Bearbeitung. Auf kleinen Breiten wird er als unterer bzw. seitlicher Bereich geoeffnet, ohne die Graphflaeche unbedienbar zu machen.

Der zentrale Verbindungsablauf ist: Person auswaehlen, Verbindungshandle ziehen, Beziehungstyp waehlen, Zielperson waehlen und im kompakten Beziehungsformular Status/Quelle bestaetigen. Das Formular weist ungueltige Ziele vor dem Commit aus; Abbruch verwirft den gesamten Entwurf. Ein ausgewaehlter Knoten oder eine Kante wird deutlich hervorgehoben, und die Detailansicht enthaelt stets eine erreichbare Aktion zum Speichern oder Verwerfen.

### 4. YAML- und Dateizugriff hinter Ports

Die YAML-Schicht besteht aus einem Parser/Serializer (`yaml`) und einer Laufzeitvalidierung (`zod`). Das rechtfertigt zwei gezielte Abhaengigkeiten: YAML-Syntax muss korrekt geparst/serialisiert werden, und die externe Datei ist untrusted input, der gegen ein versioniertes Schema geprueft werden muss. Die fachliche Validierung prueft danach referenzielle und genealogische Invarianten.

Ein `FilePort` kapselt Lesen und Schreiben. Zuerst wird die Browser-Dateisystem-API verwendet, wenn sie vorhanden ist; ansonsten bietet der Port Datei-Upload und Download an. Importablauf: Datei lesen, YAML parsen, Schema und Domain validieren, erst dann den kompletten Dokumentzustand ersetzen. Bei jedem Fehler bleibt der aktuelle Zustand erhalten. Exportablauf: aktuelles gueltiges Dokument serialisieren und als YAML mit `.yaml`-Endung anbieten.

Die Quelle wird nicht abgerufen. Sie wird nur als HTTP-/HTTPS-URL validiert und als sicherer externer Link angezeigt; das vermeidet Netzwerkabhangerschaft und Datenschutzueberraschungen.

### 5. Lokaler Zustandsfluss und ungespeicherte Aenderungen

Ein reducerartiger Zustandsfluss trennt das gespeicherte Dokument von transienter UI-Auswahl, Verbindungsentwurf und Fehlermeldungen. Jede erfolgreiche Domainoperation erzeugt einen neuen Dokumentwert und setzt den Dirty-Zustand. Import, neues Dokument und Verwerfen pruefen den Dirty-Zustand vor dem Ersetzen. Ein ungueltiger Formularentwurf oder Import darf weder Dokument noch Dirty-Zustand veraendern.

Die Anwendung speichert nicht automatisch in Browser-Storage, damit keine zweite, unsichtbare Persistenzquelle neben der YAML-Datei entsteht. Ein sichtbarer Dirty-Hinweis in der Werkzeugleiste macht den Exportbedarf erkennbar.

### 6. Teststrategie und Projektbefehle

Die Implementierung beginnt mit Tests fuer die Domainenoperationen und dem absichtlich fehlschlagenden Verhalten aus der Spezifikation. Danach folgen Parser-/Serializer-Roundtrips und UI-Komponententests. Playwright prueft die entscheidenden Benutzerwege im Browser: Person anlegen/bearbeiten, beide Beziehungstypen per direkter Verbindung erstellen, Status/Quelle aendern, YAML importieren/exportieren und einen ungueltigen Import ohne Datenverlust ablehnen.

Mit der Projektinitialisierung werden diese Befehle verbindlich:

- `npm test`: Vitest fuer Domain- und Komponententests.
- `npm run test:e2e`: Playwright fuer Browser-Workflows.
- `npm run build`: TypeScript-/Produktionsbuild als Integrationscheck.

Dateizugriff wird in Unit-Tests ueber einen Fake-Port und in E2E-Tests ueber die Browser-Dateiauswahl bzw. den Downloadpfad getestet. IDs und Anfangspositionen werden fuer reine Domain-Tests deterministisch injizierbar gemacht, ohne diese Testbarkeit in die YAML-Oberflaeche zu tragen.

## Risks / Trade-offs

- [Browser-Dateisystem-API ist nicht ueberall verfuegbar] -> Upload-/Download-Fallback ueber einen gekapselten `FilePort` und ein E2E-Szenario fuer diesen Pfad.
- [Eine visuelle Graphbibliothek kann eigene Kantenregeln gegen die Fachlogik durchsetzen] -> Domainoperationen bleiben vor dem Graphzustand die einzige Commit-Grenze; der Adapter ist separat testbar.
- [Strikte Frau-/Mann-Ehe bildet nicht jede reale Familiengeschichte ab] -> Die Begrenzung wird in Formularen und Importfehlern klar benannt und als bewusster MVP-Scope dokumentiert.
- [Fehlerhafte oder manipulierte YAML-Dateien koennten unvollstaendige Daten laden] -> Parser, Laufzeitschema und referenzielle Domainvalidierung laufen vor dem atomaren Zustandswechsel; keine Datei wird ausgefuehrt und keine Quelle automatisch geladen.
- [Viele Personen koennen die visuelle Uebersicht belasten] -> Pan/Zoom, gespeicherte Positionen, deterministische Anfangsanordnung und `fit view` werden im MVP bereitgestellt; Suche und automatische Optimierung bleiben spaetere Erweiterungen.
- [Direkte Kanteninteraktion kann auf kleinen Bildschirmen schwer bedienbar sein] -> Desktop ist primaer, mobile Darstellung nutzt einen klaren Verbindungsmodus und einen nicht ueberlappenden Inspektorbereich.

## Migration Plan

Es gibt keine bestehende Laufzeit oder Datenbank, die migriert werden muss. Der erste Export verwendet `schemaVersion: 1`. Dateien mit unbekannter oder nicht unterstuetzter Version werden mit einer konkreten Fehlermeldung abgelehnt, statt stillschweigend umgedeutet zu werden. Eine spaetere Version kann einen expliziten Migrationsschritt vor der Domainvalidierung ergaenzen.

Rollback des MVP bedeutet, die lokale Anwendung auf die vorherige Version zurueckzusetzen; bereits exportierte YAML-Dateien bleiben unveraendert und koennen von einer kompatiblen Version weiter eingelesen werden.