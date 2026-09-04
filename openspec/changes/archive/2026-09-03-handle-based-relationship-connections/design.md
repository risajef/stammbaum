## Context

`PersonNode` besitzt derzeit einen oberen Ziel-Handle und einen unteren Quell-Handle. `App` übernimmt eine erfolgreiche React-Flow-Verbindung bislang nur als Paar aus Personen-IDs und lässt den Beziehungstyp anschließend im `RelationshipInspector` auswählen. Die Domänenfunktionen `createMarriage` und `createParentChild` validieren und normalisieren die fachlichen Beziehungen bereits; das automatische Layout liest die gespeicherten Beziehungstypen.

Die neue Interaktion muss die Ziehrichtung der Maus von der fachlichen Bedeutung entkoppeln, darf aber die durch die Handle-Positionen ausgedrückten Rollen nicht aus den aktuellen Node-Positionen ableiten.

## Goals / Non-Goals

**Goals:**

- Handles mit stabilen, semantischen IDs für Ehe sowie Elternteil- und Kindseite einführen.
- Seitliche Ehe-Handles für die beiden unterstützten Geschlechter sichtbar und gut klick-/ziehbar darstellen.
- Verbindungen in beiden Ziehrichtungen über passende Handles akzeptieren und vor dem Öffnen des Inspektors fachlich klassifizieren.
- Den bestehenden Bestätigungs-, Validierungs-, Dirty-State- und Auswahlfluss wiederverwenden.
- Die gespeicherte Domänenstruktur unverändert halten, weil die Handle-Information nur ein Eingabemittel und kein fachliches Datenfeld ist.

**Non-Goals:**

- Neue Geschlechtswerte oder gleichgeschlechtliche Ehen einführen.
- Handle-IDs, sichtbare Node-Positionen oder temporäre Layoutpositionen in YAML speichern.
- Bestehende Beziehungen nachträglich umzuschreiben oder deren Bearbeitung zu verändern.
- Beziehungen beim Loslassen des Handles ohne Bestätigung zu speichern.

## Decisions

### Handle-Rollen statt Node-Geometrie

Die bestehenden vertikalen Handles behalten ihre gerichteten Rollen: oben ist der Kind-Eingang (`target`), unten der Eltern-Ausgang (`source`). React-Flow normalisiert bei einer Verbindung in umgekehrter Mausbewegung die `Connection` weiterhin auf `source` und `target`; die Klassifikation verwendet daher die Handle-IDs und die normalisierte Verbindung. Damit bedeutet eine Verbindung zwischen unterem und oberem Handle immer `fromId = Person am unteren Handle` und `toId = Person am oberen Handle`, unabhängig von der Position beider Nodes.

Für Ehe wird an jeder passenden Person ein einzelner seitlicher Handle mit derselben semantischen Rolle angezeigt: rechts beim Mann und links bei der Frau. Die seitlichen Handles werden als Quell-Handles verwendet und React-Flow wird für diese symmetrische Eingabe in den lockeren Verbindungsmodus gesetzt. Dadurch können beide seitlichen Handles direkt miteinander verbunden werden; die Ziehrichtung entscheidet nicht über die fachliche Paarung. Vor dem Speichern werden die Personen an `createMarriage` übergeben, das die kanonische Frau-zu-Mann-Richtung herstellt.

Eine kleine, framework-nahe Klassifikationsfunktion erhält die von React-Flow gelieferte Verbindung und das aktuelle Dokument. Sie liefert entweder einen vorbereiteten Verbindungsentwurf mit normalisierten Personen-IDs und festem Beziehungstyp oder einen verständlichen Fehler. Sie akzeptiert nur die zwei vorgesehenen Handle-Muster: seitlich-zu-seitlich oder unten-zu-oben. Die Anwendung ruft die Klassifikation sowohl über die React-Flow-Validierung als auch defensiv in `onConnect` auf, damit ungültige Eingaben nicht in den Bestätigungsfluss gelangen und keine Teiländerung erzeugen.

### Beziehungstyp im Entwurf festhalten

Der bisherige `ConnectionDraft` wird um den klassifizierten Beziehungstyp erweitert. `App` übergibt diesen Typ an den Inspektor; bei einer neuen Verbindung wird der Typ angezeigt und nicht manuell gewählt. Beim Speichern ruft `App` abhängig vom Entwurf weiterhin `createMarriage` oder `createParentChild` auf und synchronisiert danach die automatisch abgeleiteten Beziehungen und das Layout wie bisher.

Der Inspektor bleibt der Commit-Grenze: Öffnen einer Verbindung ändert nur transienten UI-Zustand. Erst das Speichern schreibt das Dokument; Verwerfen entfernt den Entwurf. Die vorhandenen Felder für Ehebeginn, Quelle und Kommentar bleiben im jeweiligen Kontext verfügbar, wobei Quelle und Kommentar leer bleiben dürfen.

### Fehler und bestehende Domänenregeln

Die Handle-Klassifikation prüft Form und Ziel der Verbindung. Geschlecht, Selbstbeziehung, doppelte Ehe, doppelte Eltern-Kind-Beziehung sowie Quellen- und Datumsvalidierung bleiben Verantwortung der bestehenden Domänenfunktionen. Ein Fehler beim Speichern lässt das Dokument unverändert und wird am bestehenden Inspektor- oder Workflow-Fehlerpfad angezeigt.

Die seitlichen Handles werden nur für `woman` beziehungsweise `man` gerendert. Eine Person ohne Geschlechtsangabe erhält keinen seitlichen Ehe-Handle. Das verhindert nicht jede ungültige Paarung zwischen zwei sichtbaren gleichgeschlechtlichen Seiten-Handles; diese wird beim Bestätigen durch die bestehende Ehevalidierung abgelehnt.

### Testseams und Verifikation

Die Klassifikationsfunktion wird als öffentliche, reine Test-Schnittstelle mit Unit-Tests für beide Ziehrichtungen, Handle-Muster und Fehlerfälle ausgeführt. Der Inspektor erhält einen Komponententest für den fest vorgegebenen Typ sowie die optionale Quelle und den optionalen Kommentar. Playwright deckt das sichtbare Rendern der geschlechtsspezifischen Handles, Ehe über die Seiten-Handles, Eltern-Kind über die vertikalen Handles inklusive umgekehrter Ziehrichtung, Bestätigen und Verwerfen ab.

Es werden keine neuen Abhängigkeiten eingeführt. Verifikation erfolgt mit `npm test`, den relevanten Tests über `npm run test:e2e -- ...` und `npm run build`.

## Risks / Trade-offs

- [Risiko] Der lockere React-Flow-Verbindungsmodus lässt mehr Handle-Kombinationen zu als der bisherige strikte Modus. -> [Mitigation] Die Klassifikationsfunktion und die zentrale `isValidConnection`-Prüfung lassen ausschließlich die beiden vorgesehenen Muster in den Entwurf gelangen; `onConnect` prüft zusätzlich.
- [Risiko] Ein seitlicher Handle kann bei kleinen Nodes oder auf schmalen Ansichten schwer erreichbar sein. -> [Mitigation] Die sichtbare Punktgröße und der Hit-Bereich werden über die bestehende Handle-CSS-Klasse konsistent erweitert; der responsive Inspektorfluss bleibt unverändert.
- [Risiko] Bestehende E2E-Szenarien, die den Beziehungstyp nach einer beliebigen vertikalen Verbindung auswählen, entsprechen danach nicht mehr dem neuen Bedienmodell. -> [Mitigation] Die Tests werden auf die semantisch passenden Handles umgestellt; importierte und bereits gespeicherte Beziehungen bleiben unverändert.
- [Risiko] Eine ungültige seitliche Paarung wird erst beim Speichern fachlich abgelehnt. -> [Mitigation] Der Inspektor zeigt den Ehetyp vorab, die Domänenfehlermeldung bleibt am Bestätigungsfeld sichtbar und das Dokument wird nicht verändert.

## Migration Plan

Es ist keine Datenmigration erforderlich. Die neuen Handle-IDs und die Eingabeklassifikation werden nicht serialisiert. Rollback besteht aus dem Entfernen der neuen Handle-/Klassifikationslogik und dem Wiederherstellen der bisherigen freien Beziehungstypauswahl; bestehende YAML-Dateien bleiben kompatibel.
