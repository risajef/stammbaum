## Context

Die bisherige Erkennung in `src/ocr/ocr-suggestions.ts` sucht eine bekannte Person über einen normalisierten vollständigen Namen und verwendet den ersten Treffer. OCR-Datumsangaben werden nicht in den Vorschlag übernommen; `newPerson.birthYear` bleibt leer. In `App.tsx` übernimmt der Annahme-Handler einen Vorschlag unmittelbar über `acceptOcrSuggestion`, während `PersonInspector` bisher nur eine bestehende `Person` oder einen leeren Entwurf kennt.

Die ausgewählten OCR-Läufe enthalten viele Seiten mit historischen Spalten- und Registertexten sowie wiederkehrenden Namen. Deshalb muss die neue Logik ohne Dateisystemzugriff, externe Dienste oder neue Laufzeitabhängigkeiten arbeiten und bei nicht eindeutig zuordenbaren Bezugspersonen lieber keinen normalen Vorschlag erzeugen.

## Goals / Non-Goals

**Goals:**

- Die vorhandene Mustererkennung um eine testbare Evidenz- und Bewertungsstufe ergänzen.
- OCR-Bezugspersonen gegen alle plausiblen Stammbaum-Personen bewerten, statt den ersten Namensfund zu verwenden.
- Geburtsjahr, Monat und Tag mit abgestufter Genauigkeit vergleichen und erkannte Daten für die neue Person vorausfüllen.
- Score, Teilbewertungen, Beleganzahl und primäre Quelle im Vorschlag erhalten.
- Die bestehende Personenmaske für die korrigierbare Annahme verwenden und die Übernahme erst nach erfolgreicher Validierung atomar ausführen.

**Non-Goals:**

- Keine automatische Zusammenführung oder Bearbeitung vorhandener Personen.
- Keine statistische oder externe KI-basierte Identitätsauflösung.
- Keine Änderung der OCR-Lauf-Auswahl, des lokalen Backends oder der Review-URL-Regeln.
- Keine Persistierung offener Vorschläge und keine Aufnahme der realen Kirchenbuchdaten in Test-Fixtures.

## Decisions

### Strukturierte Evidenz zwischen Parser und Score

Die bestehende Erkennung bleibt die Quelle für gerichtete Muster wie Eltern-Kind, Kinderlisten und Ehebeziehungen. Für jedes erkannte Muster wird zunächst eine interne Evidenz mit folgenden Informationen gebildet: OCR-Kandidatenname, OCR-Bezugspersonenname, Beziehung und Richtung, mögliche Geschlechter, Kandidaten-Geburtsdatum, Bezugspersonen-Geburtsdatum, Ausschnitt und Quelle.

Die öffentliche `OcrSuggestion` erhält zusätzlich den Score, eine Teilbewertung, die zusammengefassten Belege und das bestmögliche extrahierte Geburtsdatum. `OcrPage` und der lokale Reader bleiben unverändert. So bleibt die Erkennung als reine Funktion auf serialisierbaren OCR-Seiten testbar.

### Konservative Datumsextraktion

Die Datumsextraktion verwendet die vorhandene Partial-Date-Semantik (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`) und ergänzt nur bekannte deutsche beziehungsweise historische Monatsvarianten wie `März`, `Maerz`, `Marz`, `Febr` oder `Novbr`. Ein Jahr aus dem Abschnitt oder einer Registerüberschrift darf nur als Jahresangabe mit geringerer Sicherheit verwendet werden.

Datum und Name werden nur aus einem begrenzten Familienregister-/Zeilenkontext verbunden. Ein beliebiges Datum derselben Seite oder ein weit entferntes Datum darf nicht als Geburtsdatum einer Person übernommen werden. Kann eine Spaltenstruktur nicht sicher rekonstruiert werden, bleibt der betreffende Bestandteil unbekannt.

Für die neue Person wird ein erfasstes Kandidaten-Geburtsdatum in `newPerson.birthYear` vorausgefüllt. Für die Identifizierung der vorhandenen Bezugsperson wird, sofern vorhanden, das OCR-Geburtsdatum des Bezugspersonenblocks mit der Stammbaum-Person verglichen. Das Datum der neuen Person wird zusätzlich zur relationalen Plausibilitätsprüfung verwendet, nicht zur automatischen Identitätsentscheidung.

### Fuzzy-Namensvergleich ohne neue Abhängigkeit

Vor- und Nachnamen werden nach der bereits verwendeten historischen Normalisierung getrennt verglichen. Eine kleine Levenshtein-Distanz wird abhängig von der Tokenlänge toleriert; der Nachname erhält eine strengere Schwelle als der Vorname. Dadurch können Schreibfehler wie `Hane`/`Hans` und `Grorg`/`Georg` gefunden werden, während ein beliebiger ähnlicher Familienname nicht genügt.

Alle passenden Stammbaum-Personen werden bewertet. Ein Score unter der festen Mindestschwelle erzeugt keinen normalen Vorschlag. Bei gleichnamigen Personen muss der beste Treffer zusätzlich einen ausreichenden Abstand zum zweitbesten Treffer haben und mindestens eine unterscheidende Datums- oder Beziehungsevidenz besitzen. Ein Gleichstand wird unterdrückt, statt von der Dokumentreihenfolge entschieden zu werden.

### Deterministische 100-Punkte-Metrik

Die Teilwerte werden als feste, sichtbare Dimensionen berechnet:

- Name der OCR-Bezugsperson: 0 bis 35 Punkte; Vor- und Nachname werden getrennt gewichtet.
- Geburtsdatum: 0 bis 35 Punkte; voller Tag/Monat/Jahr ist besser als Jahr/Monat, dieses besser als nur das Jahr. Ein um ein Jahr abweichender Wert wird schwach bewertet, ein bekannter Widerspruch nicht positiv.
- Geschlecht: 0 bis 10 Punkte; nur zuverlässige OCR-Marker beziehungsweise vorhandene Domänendaten liefern Punkte.
- Beziehungs- und Zeitplausibilität: 0 bis 10 Punkte; beispielsweise liegt ein Kind zeitlich nach einem bekannten Elternteil und nicht nach dessen Tod.
- Quellen- und Wiederholungsevidenz: 0 bis 10 Punkte; übereinstimmende Belege, Modellpriorität und wiederholte Seitenbelege werden berücksichtigt.

Die Summe wird auf 0 bis 100 begrenzt. Eine feste Mindestschwelle und ein fester Tie-Break-Abstand werden in den Erkennungstests als konservative Konstanten abgesichert, nicht als Benutzeroption eingeführt. Der Score ist eine Rangmetrik und keine Wahrscheinlichkeit.

### Deduplizierung mit Geburtsdatum im Schlüssel

Die fachliche Vorschlagsidentität besteht aus vorhandener Bezugsperson, Beziehungstyp und -richtung, normalisiertem neuen Namen sowie dem erkannten Kandidaten-Geburtsdatum. Dadurch werden dieselben OCR-Belege zusammengeführt, aber zwei eigenständige Personen mit gleichem Namen und unterschiedlichen plausiblen Geburtsdaten nicht versehentlich verschmolzen.

Beim Zusammenführen bleibt die primäre Quelle nach der bestehenden Modellpriorität erhalten. Zusätzliche Quellen, Seiten und die Beleganzahl werden am Vorschlag gesammelt und für Score sowie UI verwendet. Die stabile Vorschlags-ID muss das Geburtsdatum ebenfalls berücksichtigen.

### Korrigierbare Annahme über den bestehenden Inspector

Die UI erhält einen flüchtigen `pendingOcrSuggestion`-Zustand. Das Öffnen einer Karte setzt den Inspector in den Erstellmodus und übergibt einen initialen `PersonDraft`; die Karte bleibt offen, bis das Speichern erfolgreich ist. Der Inspector erhält dafür eine optionale Initialisierung für einen neuen Entwurf, ohne den normalen manuellen Erstell- oder Bearbeitungsfall zu verändern.

Beim Speichern eines aus OCR geöffneten Entwurfs ruft `App` die atomare Domänenoperation mit dem korrigierten Entwurf auf. Diese validiert die Person, prüft die Beziehung und erstellt erst danach Person und `ocr-suggestion`-Beziehung. Bei einem Fehler bleibt `pendingOcrSuggestion`, der Inspector und die offene Karte erhalten. Bei Erfolg werden Karte und Pending-Zustand entfernt, der normale Dirty-State gesetzt und die bestehende Auswahl-/Layoutaktualisierung verwendet. Abbrechen verwirft ausschließlich den flüchtigen Pending-Zustand.

Die bisherige globale Ablehnung gleicher Namen wird für den Erstellfall auf eine fachliche Doppelprüfung aus normalisiertem Namen und gleichem Geburtsdatum verschärft: Ein abweichendes, plausibles Geburtsdatum kann eine eigenständige neue Person erlauben; die Eingabemaske bleibt die letzte Korrekturinstanz.

### Performance und Testgrenzen

Die Erkennung erstellt einmalig normalisierte Personenindizes und berechnet normalisierte OCR-Zeilen beziehungsweise kurze Kontextfenster nur einmal pro Seite. So wird nicht für jedes Muster eine vollständige Suche durch alle Personen und den gesamten Seitentext wiederholt.

Die zentrale Testgrenze bleibt `detectOcrSuggestions` mit kleinen synthetischen `OcrPage`- und `FamilyTreeDocument`-Werten. Komponenten- und App-Tests prüfen Scoreanzeige, Sortierung, Initialwerte, Abbrechen und Speichern über sichtbare Rollen und Felder. E2E-Fixtures bleiben klein und enthalten keine privaten Originaldaten.

## Risks / Trade-offs

- **OCR-Spalten verlieren die räumliche Zuordnung von Datum und Name.** → Nur begrenzte Registerkontexte verwenden, unbekannte Bestandteile nicht ergänzen und zweifelhafte Bezugspersonen unterdrücken.
- **Fuzzy Matching kann verschiedene historische Namen verwechseln.** → Nachnamen strenger bewerten, Datums-/Beziehungsabstand verlangen und Gleichstände nicht anzeigen.
- **Ein falscher Score wirkt objektiver als er ist.** → Score als Rangmetrik kennzeichnen, Teilwerte sichtbar machen und niemals automatisch übernehmen.
- **Die neue Personenmaske verlängert den Annahmevorgang.** → OCR-Werte vorausfüllen, Quelle und Ausschnitt in der Vorschlagskarte belassen und die bestehende manuelle Maske wiederverwenden.
- **Mehrere Belege können zu vielen Evidenzobjekten führen.** → Nach fachlicher Identität deduplizieren, Quellen begrenzen beziehungsweise zusammenfassen und eine stabile primäre Quelle wählen.

## Migration Plan

1. Zuerst die öffentlichen Erkennungstests für Dateiextraktion, Fuzzy-Namen, Bezugspersonenranking, Score und Deduplizierung rot ausführen.
2. Die Erkennung und `OcrSuggestion` additiv um Evidenz, Date, Score und Sortierung erweitern; fokussierte Tests grün machen.
3. Die OCR-Annahme auf einen korrigierten `PersonDraft` und den Pending-Inspector umstellen; Komponenten- und App-Tests rot-grün durchführen.
4. Vorschlagskarten, Score-Erklärung und Belegzusammenfassung ergänzen und den Playwright-Happy-Path für Öffnen, Korrigieren, Abbrechen und Speichern erweitern.
5. `npm test`, `npm run build` und `npm run test:e2e` ausführen. Ein Rollback entfernt nur die neue Ranking-/Inspector-Logik; bestehende YAML-Dateien und OCR-Quellen bleiben unverändert.
