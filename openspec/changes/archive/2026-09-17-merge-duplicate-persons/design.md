## Context

Siehe `proposal.md` fuer die Motivation und den Umfang. Das aktuelle Dokumentmodell ist ein unveraenderliches `FamilyTreeDocument` mit Personen und Beziehungen, waehrend die Anwendung fachliche Operationen als `Result` mit einem unveraenderten Fehlerpfad verarbeitet. Eltern-Kind-Beziehungen sind gerichtet, Ehen bilden symmetrische Paare, und automatisch abgeleitete Elternschaften werden aus den manuellen Beziehungen synchronisiert. Die Arbeitsflaeche berechnet ihre sichtbaren Positionen aus dem Familiengraphen; temporaere Node-Positionen gehoeren nicht zum fachlichen Dokument.

## Goals / Non-Goals

**Goals:**

- Eine atomare, testbare Domänenoperation fuer die Fusion zweier vorhandener Personen.
- Konfliktfreie Zusammenfuehrung der vereinbarten Personendaten einschliesslich kompatibler Teil-Datumswerte und Kommentare.
- Vollstaendige, konsistente Umschreibung der Beziehungendpunkte mit Hoechstgrenze von zwei eindeutigen Eltern pro Kind.
- Konsolidierung kollabierender Kanten sowie Entfernung der daraus entstehenden Selbstbeziehungen, ohne zusaetzliche fachliche Ablehnungsregeln einzufuehren.
- Wiederverwendung der bestehenden automatischen Ableitung und Anpassung des DAG-Layouts an relationale Generationsebenen.
- Eine klare UI-Sequenz mit Auswahl der zweiten Person, destruktiver Bestaetigung und atomarem Fehlerverhalten.

**Non-Goals:**

- Kein Merge-Verlauf, kein Alias-Datensatz und keine Undo-Funktion.
- Keine Aenderung des YAML-Schemas oder der bestehenden Beziehungstypen.
- Keine automatische Aehnlichkeits- oder Duplikaterkennung.
- Keine Fusion mehrerer als zwei Personen in einem Vorgang.
- Keine allgemeine Durchsetzung einer Eltern-Hoechstgrenze bei anderen Bearbeitungs- oder Importvorgaengen.
- Keine chronologische Zeitleiste, in der die vertikale Position allein aus dem Geburtsjahr abgeleitet wird.

## Decisions

### Eine reine Domänenoperation bildet die Transaktion

Die Fusion wird als eine neue oeffentliche Funktion im Personen-Domaenenmodul modelliert, die `document`, `survivorId` und `mergedId` entgegennimmt und ein `Result<FamilyTreeDocument>` zurueckgibt. Sie darf das Eingabedokument nicht mutieren. Alle Validierungen werden vor dem Zurueckgeben des neuen Dokuments ausgefuehrt; bei jedem Fehler wird ausschliesslich ein `DomainError` zurueckgegeben.

Die Operation prueft zuerst beide IDs und die Unterscheidbarkeit der Personen, fuehrt dann die Personendaten zusammen, schreibt die Beziehungen um, synchronisiert automatische Beziehungen, prueft die Elternanzahl und validiert schliesslich das resultierende Dokument. Dadurch kann die UI den Erfolg als einen einzelnen State-Wechsel anwenden und Fehler ohne Teilmutation anzeigen.

Alternative: Die UI koennte Personen und Beziehungen schrittweise aendern. Das wuerde bei einem spaeten Eltern- oder Datenkonflikt Zwischenzustaende erzeugen und wird deshalb ausgeschlossen.

### Personendaten werden mit einer Feldstrategie statt mit einem bevorzugten Datensatz fusioniert

Die erforderlichen Namen muessen nach dem bestehenden Trim-Verhalten gleich sein. Bei Geschlecht, Geburt und Tod gewinnt ein vorhandener Wert gegen `null`. Zwei Datumswerte sind kompatibel, wenn alle gemeinsam bekannten Jahr-, Monats- und Tageskomponenten gleich sind; der Wert mit mehr bekannten Komponenten gewinnt. Nicht kompatible Werte und unterschiedliche vorhandene Geschlechtsangaben erzeugen einen Konflikt. Nach der Fusion wird auch die bestehende Lebensspannenvalidierung angewendet.

Kommentare werden trim-normalisiert. Ist nur ein Kommentar vorhanden, bleibt er erhalten; sind beide gleich, wird er einmal gespeichert; sind beide verschieden und nichtleer, werden sie mit einem Zeilenumbruch in Auswahlreihenfolge verbunden. Die Position ist keine Identitaetsinformation: Sie wird nicht als Konflikt betrachtet und nicht vom entfernten Datensatz uebernommen.

Alternative: Immer nur die Daten des zuerst ausgewaehlten Datensatzes zu behalten waere einfacher, wuerde aber gerade die im Duplikat vorhandenen zusaetzlichen Lebensdaten und Kommentare verlieren.

### Beziehungen werden ueber eine ID-Abbildung und stabile Konsolidierung umgeschrieben

Die Abbildung `{ mergedId -> survivorId }` wird auf beide Beziehungendpunkte angewandt. Beziehungen mit identischem Typ und identischen resultierenden Endpunkten werden dedupliziert; eine explizite Beziehung hat dabei Vorrang vor einer automatisch abgeleiteten Beziehung, ansonsten bleibt die zuerst vorhandene Beziehung mit ihrer ID und ihren Metadaten bestehen. Eine Beziehung mit identischen resultierenden Endpunkten wird verworfen, weil sie keine gueltige fachliche Beziehung mehr ausdrueckt.

Danach werden automatische Beziehungen nicht manuell repariert, sondern mit der bestehenden Synchronisationslogik aus den resultierenden manuellen Beziehungen neu abgeleitet. Dadurch bleiben Herkunft, Ableitungsquelle und Entfernung ungueltig gewordener Inferenzen konsistent. Die Anzahl der Eltern wird auf dem synchronisierten Ergebnis anhand eindeutiger `fromId`-Werte pro Kind berechnet; drei oder mehr blockieren die gesamte Operation.

Alternative: Kollabierende Kanten abzulehnen waere restriktiver als vereinbart und wuerde den typischen Fall zweier Duplikate mit teilweise ueberlappenden Beziehungen unnoetig verhindern. Beide Kanten unveraendert zu behalten wuerde dagegen ein Dokument erzeugen, das die bestehenden Duplikatregeln verletzt.

### Der bestehende UI-Zustand erhaelt einen expliziten Fusionsmodus

Der Personeninspektor bietet nur bei einer bestehenden Person eine Fusionsaktion an. Beim Start wird die zuerst ausgewaehlte ID separat als Fusionsquelle festgehalten; die normale Auswahl bleibt fuer Node- und Suchnavigation nutzbar, waehrend die zweite Person ausgewaehlt wird. Eine zweite Auswahl derselben Person wird nicht als Fusionspartner akzeptiert.

Nach Auswahl der zweiten Person zeigt die Anwendung die Namen beider Personen in einer destruktiven `window.confirm`-Warnung. Erst bei positiver Antwort wird die Domänenoperation aufgerufen. Bei Ablehnung oder Domainfehler bleiben Auswahl, Dokument und Dirty-State unveraendert. Bei Erfolg werden Fusionsmodus und temporaere Positionen beendet, die neue Dokumentprojektion angelegt, die Ansicht neu zentriert und die verbleibende Person ausgewaehlt.

Alternative: Ein mehrstufiges eigenes Modal waere gestalterisch erweiterbar, ist fuer den bestehenden lokalen Editor und das vorhandene Bestaetigungsmuster aber nicht erforderlich.

### Generationsebenen werden root-relativ und mit begrenzten Elternabstaenden berechnet

Nach der Bildung der Familienkomponenten aus Ehe- und Co-Eltern-Beziehungen wird fuer die erste Person im Dokument die zugehoerige Komponente als Root auf Ebene 0 gesetzt. Das Layout durchlaeuft jede schwach zusammenhaengende Komponentengruppe von diesem Anker aus: Eine Kante Elternteil -> Kind erhoeht die vorlaeufige Ebene um 1, die umgekehrte Durchquerung vermindert sie um 1. Dadurch erhalten auch Vorfahren und Seitenlinien eine Ebene, statt nur von einer globalen Alterswurzel abzuhaengen. Fuer voneinander getrennte Gruppen wird die erste Komponente in Dokumentreihenfolge als lokaler Anker verwendet.

An Verzweigungen wird die gerichtete DAG-Reihenfolge anschliessend topologisch stabilisiert. Jede Kindkomponente wird mindestens auf `max(Elternlayer) + 1` gelegt; ein Elternteil bleibt damit immer oberhalb des Kindes. Sind mehrere Pfade unterschiedlich lang, wird ein Abstand von zwei Generationen als zulaessiger Kompromiss verwendet. Ein groesserer Abstand ist nur der deterministische Fallback fuer einen widerspruechlichen oder zyklischen Datenbestand, fuer den die gewuenschte Begrenzung mathematisch nicht gleichzeitig erfuellbar ist. Ehepartner und gemeinsame Eltern bleiben als eine Komponente auf derselben Ebene. Geburtsdaten und fehlende Geburtsdaten beeinflussen nur die horizontale Reihenfolge, nicht die Ebenen.

Alternative: Die bisherige Hoehenberechnung richtet alle Blaetter am Ende der laengsten Kette aus und erzeugt dadurch Spruenge wie bei Hieronimus Waeckerlin und Magdalena Waeckerlin. Eine globale Alterswurzel behandelt ausserdem die erste YAML-Person nicht als den vom Benutzer gewuenschten Bezugspunkt. Eine Sortierung allein nach Geburtsjahr wuerde Eltern-Kind-Beziehungen und fehlende Daten nicht verlaesslich abbilden.

### Layout und Persistenz bleiben getrennt

Die Fusion veraendert fachliche Personen- und Beziehungsdaten und setzt den Dokumentzustand auf ungespeichert. Fuer die sichtbare Anordnung werden temporaere Positionen geleert, sodass `projectFamilyTree` den resultierenden Familiengraphen deterministisch neu berechnet. Die bestehende YAML-Serialisierung wird wiederverwendet; die temporaeren Positionen werden nicht als neue fachliche Merge-Daten eingefuehrt.

## Risks / Trade-offs

- **[Destruktiver Datenverlust]** Die zweite Person und bei Kantenkonsolidierung die Metadaten einer unterlegenen Duplikatkante sind nach der Fusion nicht wiederherstellbar. **Mitigation:** sichtbare Warnung, explizite Bestaetigung, keine Teilmutation und Speicherung nur als bewusst ungespeicherter Folgezustand.
- **[Kommentarformat wird erweitert]** Zwei unterschiedliche Kommentare werden zu einem kombinierten Text. **Mitigation:** stabile Reihenfolge, Zeilenumbruch als klare Trennung und kein doppeltes Speichern identischer Kommentare.
- **[Automatische Beziehungen koennen sich aendern]** Durch die neue Person-ID und kollabierte Quellbeziehungen koennen inferred-Kanten neu erzeugt oder entfernt werden. **Mitigation:** bestehende Synchronisationslogik als einzige Quelle fuer automatische Beziehungen verwenden und das resultierende Dokument validieren.
- **[Vorhandene ungueltige Altbestände]** Dokumente mit bereits mehr als zwei Eltern pro Kind koennen die neue Fusionspruefung beeinflussen. **Mitigation:** die Elternanzahl nur im resultierenden Fusionskandidaten pruefen und die atomare Ablehnung explizit testen; bestehende Nicht-Fusionsoperationen werden nicht geaendert.
- **[Widerspruechliche Pfadlaengen erzeugen vertikale Luecken]** Bei mehreren DAG-Pfaden kann nicht jede Eltern-Kind-Kante gleichzeitig genau eine Ebene Abstand haben. **Mitigation:** Root-relatives Durchlaufen, topologische Stabilisierung und ein maximaler normaler Abstand von zwei Ebenen; unmoegliche Sonderfaelle bleiben deterministisch.

## Migration Plan

Keine Datenmigration ist erforderlich. Die neue Operation arbeitet nur auf dem aktuell geladenen `schemaVersion: 1`-Dokument. Nach erfolgreicher Fusion wird der bestehende Speichervorgang verwendet. Ein Rollback der Anwendung besteht aus dem Zuruecknehmen des Changes; eine bereits ausgefuehrte und gespeicherte Fusion ist fachlich nicht rueckgaengig.
