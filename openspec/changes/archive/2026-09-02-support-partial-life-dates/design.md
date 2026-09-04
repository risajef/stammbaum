## Context

Die bestehende Anwendung verwendet `birthYear` und `deathYear` als optionale Ganzzahlen in `Person`, `PersonDraft`, YAML und der Inferenz. Die neue Eingabe muss Teilgenauigkeit erhalten, waehrend schemaVersion-1-Dateien mit numerischen Jahreswerten weiterhin geoeffnet werden koennen. Siehe proposal.md und die Delta-Specs fuer den beobachtbaren Vertrag.

## Goals / Non-Goals

**Goals:**

- Eine gemeinsame, frameworkfreie Datumslogik fuer Format-, Kalender- und Teilvergleichsregeln bereitstellen.
- Die vorhandenen `birthYear`-/`deathYear`-Feldnamen und die Schema-Version beibehalten.
- Jahr-only, Jahr-Monat, vollstaendige Daten und leere Werte im Formular, Domainmodell und YAML roundtrip-sicher behandeln.
- Die bestehende automatische Inferenz mit nachweisbaren Teilvergleichen erweitern.

**Non-Goals:**

- Keine Migration auf neue YAML-Schluessel oder eine neue Schema-Version.
- Keine erfundenen Monats- oder Tageswerte, keine Zeitzonen- oder Uhrzeitangaben.
- Keine Aenderung an Beziehungen, Layout, Positionen oder anderen Personeneigenschaften.

## Decisions

### 1. Kanonische Werte bleiben Strings in den bestehenden Feldern

`birthYear` und `deathYear` bleiben die oeffentliche Struktur der Person, werden intern aber als `string | null` mit den Formaten `YYYY`, `YYYY-MM` oder `YYYY-MM-DD` gefuehrt. Das vermeidet eine unnoetige YAML-Migration und bewahrt die Bedeutung der bestehenden Schluessel. `PersonDraft` akzeptiert zusaetzlich numerische Legacy-Jahreswerte, die vor der Validierung zu einem vierstelligen String normalisiert werden.

Eine Alternative waere die Umbenennung zu `birthDate` und `deathDate`. Sie waere semantisch klarer, wuerde aber bestehende YAML-Dateien und alle Dokumentgrenzen brechen; dafuer gibt es keinen fachlichen Nutzen in dieser Aenderung.

### 2. Gemeinsame Partial-Date-Utility statt verteilter Stringlogik

Eine kleine Domain-Utility prueft das exakte Format, Monat und Tag einschliesslich Schaltjahren, normalisiert Legacy-Zahlen und vergleicht bekannte Komponenten. Der Vergleich liefert `-1`, `0`, `1` nur bei einer sicheren Entscheidung und sonst `null`, wenn eine fehlende Komponente den Vergleich offenlaesst. Die Personenvalidierung und Dokumentvalidierung lehnen nur einen sicher frueheren Tod ab.

Eine native JavaScript-`Date`-Darstellung wird nicht als Modell verwendet, weil sie weder Jahr-Monat-Werte noch unbekannte Tage verlustfrei darstellen kann und Zeitzonen fuer historische Daten unnoetige Risiken einfuehren.

### 3. Ein Textfeld pro Lebensdatum

Der Personeninspektor verwendet je ein Textfeld mit dem Label `Geburtsdatum` beziehungsweise `Todesdatum`, dem Platzhalter `YYYY-MM-DD` und der bestehenden Feldfehler-Anbindung. Die Form wandelt leere Eingaben in `null` um und uebergibt sonst den getrimmten String; die Domain bleibt die letzte Validierungsgrenze.

Ein `input type="date"` wird nicht verwendet, weil Browser damit weder Jahr-only noch Jahr-Monat als gueltige Teilangaben unterstuetzen.

### 4. Zeitliche Inferenz behandelt Unbekanntes als moeglich, nicht als geschaetzt

Bei mehreren Ehepartnern wird C ohne bekanntes Geburtsdatum nicht automatisch zugeordnet. Fuer jeden Ehepartner wird nur ausgeschlossen, wenn sein bekanntes Todesdatum nach dem Teilvergleich sicher vor Cs bekanntem Geburtsdatum liegt. Ein unbekannter oder nicht entscheidbarer Vergleich bleibt moeglich; genau ein verbleibender moeglicher Ehepartner kann die inferred-Beziehung erhalten, mehrere verbleibende Kandidaten verhindern sie. Der bisherige Sonderfall mit genau einem Ehepartner bleibt unveraendert.

### 5. YAML akzeptiert Legacy-Zahlen und schreibt kanonische Strings

Die Importvalidierung akzeptiert fuer die bestehenden Schluessel sowohl Strings als auch ganzzahlige Legacy-Werte. Beim Normalisieren werden Zahlen zu `YYYY`-Strings und leere optionale Werte zu `null`; neue Exporte enthalten die kanonischen Strings. Die fachliche Validierung bleibt nach dem strukturellen YAML-Parsing bestehen.

## Risks / Trade-offs

- **Typwechsel von Ganzzahl zu String** -> Alle internen Fixtures und Darstellungen werden auf kanonische Strings umgestellt; der YAML-Importer akzeptiert alte Ganzzahlen weiterhin.
- **Teilwerte koennen chronologisch nicht eindeutig sein** -> Der Vergleich gibt bei unbekannten Komponenten keine Entscheidung zurueck; Inferenz schliesst nur nachweisbar unmoegliche Kandidaten aus.
- **Kalenderfehler koennen vor dem Import auftreten** -> Format- und Kalenderpruefung sitzt zentral in der Domain-Utility und wird sowohl bei Formularoperationen als auch beim YAML-Import verwendet.

## Migration Plan

1. Domaintyp und Partial-Date-Utility ergaenzen, danach rote Domaintests fuer vollstaendige, teilweise und ungueltige Werte implementieren.
2. Personenformular, YAML-Grenze, Graphanzeige und Inferenz auf die kanonischen Strings umstellen und fokussiert verifizieren.
3. Bestehende Fixtures und E2E-Locators aktualisieren, Vollsuite und Build ausfuehren.
4. Keine Datenmigration fuer Nutzer erforderlich; alte numerische Jahrwerte werden beim Import automatisch normalisiert.

## Open Questions

Keine. Format, Teilangaben, Eingabemodell und Vergleichsverhalten sind geklaert.
