## Context

Die bestehende View-Logik in `src/graph/graph-view.ts` arbeitet mit einer vollständigen Dokumentprojektion und einer davon abgeleiteten sichtbaren Projektion. Die Personensuche navigiert derzeit nur durch sichtbare Personen; die Übersicht besitzt bereits einen fokussierten React-Flow-Viewport, während `ForceTreeView` einen eigenen React-Flow-Viewport für die Federungsansicht rendert. Die Layoutlogik berechnet bereits semantische Familien-Layer und verwendet sie für die Y-Positionen; diese Generationsebene muss für die Duplikatprüfung wiederverwendbar werden, ohne manuelle Node-Positionen zu verwenden. Die Duplikatsuche soll fachliche Daten und bestehende Filter unverändert lassen. Siehe `proposal.md` für die Motivation und `specs/family-tree-views/spec.md` für den Verhaltensvertrag.

## Goals / Non-Goals

**Goals:**

- Eine reine, deterministische Auswertung für gleichnamige Duplikatspaare aus dem vollständigen Dokument bereitstellen.
- Kompatibilität anhand vollständiger oder unvollständiger Geburtsdaten und ersatzweise anhand der Layout-Generation bestimmen.
- Die Treffer nachvollziehbar nach vier Datums-/Generationsprioritäten sortieren.
- Die Paar- und Prioritätslogik unabhängig von React testen können.
- Einen eigenen, verständlichen UI-Bereich mit anklickbaren Personeneinträgen ergänzen.
- Einen gemeinsamen Navigationspfad für Übersicht und Federungsansicht verwenden, der widersprechende Ansichtsfilter vor dem Fokussieren auflöst.
- Wiederholte Klicks auf dieselbe Person zuverlässig fokussieren können, ohne den Dokumentzustand zu verändern.

**Non-Goals:**

- Keine automatische Fusion, Löschung, Markierung oder sonstige fachliche Aktion an Duplikatpersonen.
- Keine Gruppierung nach Geburtsjahr und keine Reduktion mehrerer gleichnamiger Personen auf eine einzige Gruppe; jedes eindeutige Paar bleibt ein eigener Kandidat.
- Keine Änderung der bestehenden Teilnamensuche, ihrer Trefferreihenfolge oder ihrer zyklischen Navigation.
- Keine zusätzliche Persistenz für erkannte Gruppen, keine YAML-Erweiterung und keine serverseitige Duplikaterkennung.
- Keine Ähnlichkeitsbewertung, phonetische Suche, Transliteration oder Toleranz für Schreibfehler.

## Decisions

### Gleichnamige Kandidaten werden paarweise bewertet

Die Auswertung wird als pure Funktion in der bestehenden View-/Graph-Logik ergänzt. Sie iteriert die Personen in Dokumentreihenfolge, trimmt Vor- und Nachnamen und normalisiert sie für den Vergleich mit der bestehenden deutschsprachigen Groß-/Kleinschreibungslogik. Für jede Namensgruppe werden alle eindeutigen Kombinationen `i < j` gebildet; bei drei gleichnamigen Personen entstehen somit drei Kandidatenpaare. Bevor ein Paar anhand von Geburtsdaten oder Generation bewertet wird, werden direkte Eltern-Kind-Beziehungen in beide Richtungen ausgeschlossen. Ein Kind mit dem Namen eines Elternteils ist damit kein Duplikatkandidat, unabhängig von der sonstigen Kompatibilität.

Für zwei vorhandene, gültige Geburtsdaten werden die bekannten Jahr-, Monats- und Tagesbestandteile verglichen. Nur wenn alle gemeinsam bekannten Bestandteile übereinstimmen, ist das Paar kompatibel. Vollständige gleiche Daten erhalten Priorität 1; sobald mindestens ein vorhandener Wert nur Jahr oder Jahr und Monat enthält, erhält das Paar Priorität 2. Fehlt mindestens ein Datum, wird die gemeinsame Generationsebene aus der Layoutlogik verwendet: Ein Abstand von höchstens einer Generation ist kompatibel. Genau ein fehlendes Datum erhält Priorität 3, zwei fehlende Daten Priorität 4. Nicht parsebare oder widersprüchliche bekannte Daten werden ausgeschlossen.

Die Ausgabe enthält nur Personen-IDs und die berechnete Priorität; Namen und Datumsdarstellungen werden für die Anzeige aus dem aktuellen Dokument gelesen. Sortiert wird zuerst nach Priorität und danach stabil nach dem ersten und zweiten Dokumentindex. So erzeugen zusätzliche Personen mehr Treffer, ohne die verlässlichsten Kandidaten zu verdrängen.

Alternative: Eine Gruppierung nach Name und Geburtsjahr würde gemischte bekannte/unbekannte Daten ausschließen und könnte keine Paarpriorität ausdrücken. Die Generationsabweichung aus gerenderten Y-Koordinaten abzuleiten würde manuelle Verschiebungen und View-Zustände fälschlich als genealogische Information interpretieren.

### Die semantische Layout-Generation wird gemeinsam verwendet

Die bestehende Layerberechnung wird als wiederverwendbare pure Auswertung verfügbar gemacht, die jedem Personen-ID eine nicht persistierte Generationsebene zuordnet. Die Familienprojektion verwendet diese Ebene weiterhin für die Y-Positionen; die Duplikatprüfung nutzt dieselbe Ebene nur dann, wenn mindestens ein Geburtsdatum fehlt. Die Auswertung darf keine `temporaryPositions`, Force-Positionen oder sonstige gerenderte Koordinaten berücksichtigen.

Die gemeinsame Generationsermittlung wird in einer Abhängigkeitsschicht platziert, die sowohl die Projektion als auch die View-Auswertung verwenden können, ohne einen Importzyklus zwischen `graph-projection.ts` und `graph-view.ts` zu erzeugen. Für die Kandidatenprüfung wird sie auf dem vollständigen Dokument berechnet, damit aktive Sichtfilter die Generation nicht verändern.

### Eigene UI-Projektion neben der bestehenden Personensuche

Die Duplikatspaare werden aus `document` und nicht aus `visibleDocument` abgeleitet. Ein eigener kleiner UI-Bereich erhält die readonly Paarliste und meldet beim Klick ausschließlich die gewählte Personen-ID. Die bestehende Teilnamensuche bleibt dadurch unverändert und muss keine zwei unterschiedlichen Ergebnisarten in einem Suchfeld darstellen.

Der Bereich zeigt pro Kandidat beide Namen, die Prioritätsstufe beziehungsweise ihre Rangfolge und zwei anklickbare Personen. Ein leerer Zustand wird aus der leeren Paarliste abgeleitet; es gibt keinen zusätzlichen Zustand und keinen Speichervorgang.

Alternative: Ein Modal oder eine neue Route würde den Vergleich aus dem Arbeitsbereich herauslösen und die Navigation komplizierter machen. Ein lokaler Bereich neben der Suche passt zum bestehenden View-Toolbar-Muster und bleibt ohne neue Abhängigkeit.

### Prüfbereiche können unabhängig ein- und ausgeblendet werden

Der Bereich „Duplikate“ und der Bereich „OCR-Vorschläge“ halten jeweils einen lokalen, flüchtigen `isExpanded`-Zustand. Beide Bereiche sind beim Rendern geöffnet. Ein zugänglicher Toggle im jeweiligen Header setzt `aria-expanded` und blendet ausschließlich den Inhalt dieses Bereichs aus; Header, Titel und Toggle bleiben sichtbar, damit der Bereich wieder eingeblendet werden kann. Der Zustand wird weder in `document` noch im Dirty-State, YAML oder einer dauerhaften Einstellung gespeichert. Die beiden Toggles teilen keinen Zustand, sodass das Ausblenden der OCR-Vorschläge die Duplikatliste und umgekehrt nicht beeinflusst.

Alternative: Ein gemeinsamer globaler Panel-Schalter würde die beiden unabhängigen Arbeitsbereiche unnötig koppeln. Ein vollständiges Entfernen ohne verbleibenden Wiedereinblendepunkt wäre nicht zugänglich und würde die Wiederherstellung erschweren.

### Personenkarten verwenden den Platz für Namen

Die Personenkarten behalten Breite, Mindesthöhe, Farbklassen, Handles und Statusmarkierungen. Die vorhandene redundante Kopfzeile mit Geschlechtsglyph und Textlabel wird entfernt. Die Projektion stellt Vor- und Nachnamen zusätzlich getrennt bereit; `PersonNode` rendert sie als zwei sichtbare Zeilen mit reduzierten Innenabständen. Das Geschlecht bleibt ausschließlich über die bestehende Kartenfarbe und die fachlich notwendigen Ehe-Handles erkennbar.

Alternative: Den vollständigen Namen als eine Zeile beizubehalten oder das Geschlecht zusätzlich auszuschreiben würde den verfügbaren Kartenraum weiter für redundante Information verbrauchen.

### Navigation löst widersprechende Filter vor dem Fokus auf

Die App erhält einen gemeinsamen Navigationspfad für Personenlinks aus der Duplikatpaarliste. Dieser setzt lokale Ansicht, Blutsverwandtschaftsfilter und Leaf-Filter zurück, bevor die Personenauswahl und die nächste Fokusanforderung gesetzt werden. Dadurch kann der bestehende Sichtbarkeits-Synchronisierungseffekt die Auswahl nicht unmittelbar wieder entfernen. Der Suchtext der normalen Personensuche bleibt unverändert, da er selbst keine Personen aus dem Anzeigegraphen entfernt.

Der Fokus wird weiterhin über einen monotonen Request-Zähler ausgelöst. In der Übersicht nutzt der bestehende React-Flow-Fokus die Person-ID; `ForceTreeView` erhält denselben Fokusvertrag und führt die Zentrierung mit seinem eigenen React-Flow-Kontext aus. Die Federungsansicht bleibt schreibgeschützt: Ein Duplikatklick darf dort nur Auswahl-/Viewportzustand ändern.

Alternative: Nur den Knoten im aktuellen `visibleDocument` zu suchen würde bei aktiven Filtern scheitern. Die Filter dauerhaft zu ignorieren, ohne sie zurückzusetzen, würde dagegen eine ausgewählte Person erneut ausblenden und einen inkonsistenten Inspector-Zustand erzeugen.

### Fachliche und flüchtige Zustände bleiben getrennt

Die Duplikatspaare werden bei jeder Dokumentänderung neu aus dem aktuellen `document` berechnet. Der Klick ändert ausschließlich Auswahl, Fokus und gegebenenfalls flüchtige View-Filter. Es werden weder `setDocument` noch Dirty-State, Dateiname, temporäre Node-Positionen oder YAML-Persistenz verwendet.

## Risks / Trade-offs

- **[Viele gleichnamige Personen erzeugen quadratisch viele Paare]** Eine Datei kann viele Personen mit gleichem Namen und fehlenden Daten enthalten. **Mitigation:** Die Kandidatenbildung bleibt auf exakte Namensgruppen begrenzt, wird nur einmal pro Dokumentänderung berechnet und nach Priorität stabil sortiert; eine zusätzliche Ähnlichkeitsbewertung oder Pagination ist nicht Teil dieses Changes.
- **[Unterschiedliche Anzeige-Schreibweisen innerhalb eines Namensschlüssels]** Groß-/Kleinschreibung kann in der Liste unterschiedlich dargestellt werden. **Mitigation:** Keine Personendaten normalisieren oder überschreiben; die Paarbildung ist ausdrücklich nur eine Vergleichsprojektion.
- **[Generation und Datumsinformation können widersprüchliche Hinweise geben]** Ein Paar mit einem fehlenden Datum kann genealogisch trotz benachbarter Layout-Layer verschieden sein. **Mitigation:** Die Generation wird nur als klar begrenzte Ersatzregel für fehlende Daten verwendet; bekannte inkompatible Daten bleiben ausgeschlossen und die Priorität macht unsichere Kandidaten nachrangig.
- **[Fokus während eines Filterwechsels]** Ein zu früher Fokus-Request könnte auf einem noch nicht gerenderten Node landen. **Mitigation:** Filterzustand und Fokus-Request gemeinsam setzen und den vorhandenen React-Flow-Effekt beziehungsweise den Force-View-Effekt erst nach dem Rendern des Zielknotens ausführen; die App-Tests decken den Ablauf ab.
- **[Federungsansicht hat eigene Node-Instanzen]** Die bisherige Fokuslogik der Übersicht ist nicht automatisch in der Federungsansicht verfügbar. **Mitigation:** Den Fokus explizit als Prop und Request-Zähler an `ForceTreeView` weitergeben und dort den lokalen React-Flow-Kontext verwenden.
- **[Ungültige importierte Geburtsdaten]** Ein ungültiger Datumswert könnte eine falsche Priorität oder Generationserlaubnis erzeugen. **Mitigation:** Ausschließlich den bestehenden validierenden Teil-Datumparser verwenden; nicht parsbare Werte werden ausgeschlossen und nicht als fehlendes Datum behandelt.

## Migration Plan

Es ist keine Datenmigration erforderlich. Die Änderung fügt nur flüchtige Auswertungs- und UI-Logik hinzu; bestehende YAML-Dateien, Schema-Versionen und Exporte bleiben kompatibel. Für einen Rollback werden die neue Paarprojektion, der UI-Bereich und die zusätzliche Fokusweitergabe entfernt; gespeicherte Dokumentdaten sind davon nicht betroffen.
