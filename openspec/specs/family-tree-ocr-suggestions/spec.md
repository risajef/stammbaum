# family-tree-ocr-suggestions Specification

## Purpose

Diese Fähigkeit macht lokale Kirchenbuch- und OCR-Transkriptionen als quellenbezogene, ausdrücklich prüfbare Vorschläge für den geladenen Stammbaum nutzbar.

## Requirements

### Requirement: Lokale OCR-Quellen können über einen Pfad geladen werden

Die Anwendung MUST einen vom Benutzer eingegebenen Linux-Dateisystempfad an einen lokalen OCR-Dienst übergeben können. Der Dienst MUST die dort vorhandenen Laufmetadaten in `run.json` und transkribierten Seiten unter `text/page-*.txt` read-only lesen; die Anwendung DARF dafür keinen Browser-Ordnerupload und keine Übertragung der lokalen Dateien an die Website verlangen. Nicht unterstützte, unvollständige oder nicht lesbare Dateien MUST übersprungen und verständlich als Problem oder fehlende Quelle angezeigt werden.

#### Scenario: OCR-Pfad wird erfolgreich geladen

- **GIVEN** die Benutzerin trägt einen erreichbaren Linux-Pfad mit mindestens einem gültigen Lauf und einer lesbaren Textseite ein und der lokale OCR-Dienst läuft
- **WHEN** sie den OCR-Import startet
- **THEN** zeigt die Anwendung den geladenen Lauf beziehungsweise die gelesenen Quellen an und kann daraus Vorschläge berechnen

#### Scenario: Nicht erreichbarer OCR-Pfad verändert den Stammbaum nicht

- **GIVEN** der eingegebene Pfad existiert nicht, ist keine lesbare Quelle oder der lokale OCR-Dienst ist nicht erreichbar
- **WHEN** die Benutzerin den OCR-Import startet
- **THEN** zeigt die Anwendung einen verständlichen Fehler- oder Leerzustand und lässt den geladenen Stammbaum unverändert

### Requirement: OCR-Läufe werden nachvollziehbar ausgewählt

Der OCR-Dienst MUST nur vollständige Läufe berücksichtigen, je Buch und Modell den neuesten vollständigen Lauf auswählen und den Lauf des Modells `kraken-pp-ocrv6-medium` gegenüber dem deutschen Handschriftmodell priorisieren, wenn beide dieselbe Seite oder denselben Vorschlag belegen. Seiten aus den genealogisch relevanten Abschnitten `Familienregister`, `Taufen`, `Heiraten` und `Begräbnisse` MÜSSEN als Quellen nutzbar sein; Verwaltungs- und reine Namensregisterseiten DÜRFEN keine gleichwertige Vorschlagsquelle darstellen.

#### Scenario: Unvollständige oder ältere Läufe werden nicht als Primärquelle verwendet

- **GIVEN** ein OCR-Pfad enthält mehrere Läufe desselben Buchs, darunter laufende, unvollständige und mehrere vollständige Läufe
- **WHEN** der Dienst die Quellen liest
- **THEN** werden nur vollständige Läufe berücksichtigt und der neueste vollständige Lauf je Buch und Modell angezeigt

#### Scenario: PP-OCRv6 gewinnt bei doppelter Evidenz

- **GIVEN** beide Modelle liefern für dieselbe Buchseite einen gleichartigen Familienhinweis
- **WHEN** die Anwendung Vorschläge dedupliziert
- **THEN** bleibt der PP-OCRv6-Nachweis als primäre Quelle erhalten und es erscheint kein doppelter Vorschlag

### Requirement: OCR-Daten erzeugen nachvollziehbare Personenvorschläge

Die Anwendung MUST aus den geladenen OCR-Texten nur Kandidaten ableiten, die über ein erkennbares Familienregister-Muster mit mindestens einer bereits im Stammbaum vorhandenen Person verbunden sind. Ein Vorschlag MUST mindestens den neuen Namen, die bestehende Bezugsperson, den Beziehungstyp, eine kurze Begründung, den OCR-Textausschnitt und die identifizierte Quelle enthalten. Ein Kandidat, der bereits als gleichnamige Person oder als vorhandene Beziehung erkannt wird, DARF nicht erneut als neuer Vorschlag angeboten werden.

#### Scenario: Elternteil oder Kind wird vorgeschlagen

- **GIVEN** eine OCR-Seite enthält ein erkennbares `Sohn`-, `Tochter`- oder Kinder-Muster und nennt eine bereits geladene Person
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** erscheint ein Vorschlag für die neue Person mit einer gerichteten Eltern-Kind-Beziehung, Begründung und Seitenquelle

#### Scenario: Ehepartnerin oder Ehepartner wird vorgeschlagen

- **GIVEN** eine OCR-Seite enthält ein erkennbares Ehe- oder Geburtsnamen-Muster und nennt eine bereits geladene Person
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** erscheint ein Vorschlag für die neue Person mit einer Ehebeziehung und dem OCR-Nachweis

#### Scenario: Unsichere OCR wird nicht als Tatsache ausgegeben

- **GIVEN** ein Name oder Beziehungstyp lässt sich aus dem OCR-Text nicht ausreichend sicher bestimmen
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** wird kein unmarkierter Stammbaum-Eintrag erzeugt; der Text darf höchstens als nicht übernommener Hinweis angezeigt werden

### Requirement: Vorschläge zeigen ihre Herkunft mit verlinktem Quell- und Dokumentennachweis

Die Anwendung MUST bei jedem angezeigten Vorschlag das Quellendokument (Buch), das Modell und die Seite als klickbaren Link zur Review-Anwendung (`target="_blank"`) anzeigen und die Herkunft als OCR-Vorschlag erkennbar machen. Interne OCR-Dateipfade MÜSSEN im sichtbaren OCR-Panel verborgen bleiben. Die Vorschlagsprüfung und Ablehnung DARF nicht von der Erreichbarkeit des Review-Servers abhängen.

#### Scenario: Vorschlagskarten zeigen klickbaren Quelllink mit Dokumentennamen

- **GIVEN** ein gültiger OCR-Vorschlag und gegebenenfalls einzelne nicht lesbare OCR-Dateien wurden berechnet
- **WHEN** die Vorschlagsliste unterhalb der Stammbaum-Arbeitsfläche angezeigt wird
- **THEN** sieht die Benutzerin Vorschlagskarten mit einem klickbaren Link, der Dokumentenname, Modell und Seite nennt und zur Review-URL führt, während interne Dateipfade verborgen bleiben

#### Scenario: Vorschlagsstatus bleibt von bestehenden Kanten unterscheidbar

- **GIVEN** der Stammbaum enthält manuelle, automatisch abgeleitete und aus OCR angenommene Beziehungen
- **WHEN** die Arbeitsfläche oder Beziehungsdetails angezeigt werden
- **THEN** sind die drei Herkünfte anhand einer sichtbaren Kennzeichnung unterscheidbar

### Requirement: Vorschläge können einzeln angenommen oder abgelehnt werden

Die Anwendung MUST jeden Vorschlag einzeln zum Annehmen oder Ablehnen anbieten. Das Annehmen MUST die vorgeschlagene Person und Beziehung atomar in den aktuellen Dokumentzustand übernehmen, den OCR-Nachweis erhalten und den bestehenden Speichern-Workflow als ungespeichert markieren. Das Ablehnen MUST den Dokumentzustand, vorhandene Personen und Beziehungen unverändert lassen und den Vorschlag aus der offenen Liste entfernen.

#### Scenario: OCR-Vorschlag wird angenommen

- **GIVEN** ein Vorschlag enthält einen gültigen neuen Namen und eine gültige Beziehung zu einer vorhandenen Person
- **WHEN** die Benutzerin den Vorschlag annimmt
- **THEN** erscheinen die neue Person und die Beziehung im Stammbaum, die Beziehung ist als `ocr-suggestion` gekennzeichnet, ihre Quelle bleibt erhalten und der Speichern-Status zeigt eine ungespeicherte Änderung

#### Scenario: OCR-Vorschlag wird abgelehnt

- **GIVEN** ein OCR-Vorschlag wird angezeigt
- **WHEN** die Benutzerin ihn ablehnt
- **THEN** verschwindet er aus den offenen Vorschlägen und weder Personenzahl noch Beziehungszahl des Stammbaums ändern sich

#### Scenario: Ungültiger oder doppelter Vorschlag wird nicht übernommen

- **GIVEN** zwischen denselben Personen besteht bereits die vorgeschlagene Beziehung oder die neue Person verletzt eine Domänenvalidierung
- **WHEN** die Benutzerin den Vorschlag annimmt
- **THEN** bleibt der Stammbaum unverändert und die Anwendung erklärt den konkreten Übernahmefehler

### Requirement: Annahmen werden über den bestehenden Datei-Workflow gespeichert

Die Anwendung MUST OCR-Vorschläge nicht automatisch in eine Datei schreiben. Eine angenommene Herkunftskennzeichnung und ihre Quellenangabe MUST beim bestehenden Speichern als YAML exportiert und beim erneuten Öffnen wieder geladen werden. Abgelehnte oder noch offene Vorschläge MUST nicht als fachliche Personen oder Beziehungen exportiert werden.

#### Scenario: Angenommener OCR-Vorschlag überlebt den YAML-Roundtrip

- **GIVEN** die Benutzerin hat einen OCR-Vorschlag angenommen und den Stammbaum gespeichert
- **WHEN** sie die exportierte Datei erneut öffnet
- **THEN** bleiben Person, Beziehung, `origin: ocr-suggestion`, Quelle und Begründung erhalten

#### Scenario: Offene Vorschläge werden nicht automatisch gespeichert

- **GIVEN** OCR-Vorschläge sind nur berechnet, aber nicht angenommen
- **WHEN** die Benutzerin den Stammbaum speichert
- **THEN** enthält die exportierte YAML-Datei keine dieser Vorschlagspersonen oder Beziehungen

### Requirement: OCR-Bezugspersonen werden kontextbezogen zugeordnet

Die Anwendung MUST einen Vorschlag für eine neue Person nur dann erzeugen, wenn die im OCR-Muster genannte Bezugsperson einer vorhandenen Stammbaum-Person ausreichend eindeutig zugeordnet werden kann. Die Zuordnung MUSS kleine OCR-Abweichungen in Vor- und Nachnamen tolerieren und verfügbare Geburtsdaten zur Unterscheidung gleichnamiger Personen verwenden. Bei fehlender oder nicht ausreichend eindeutiger Zuordnung DARF kein normaler Vorschlag entstehen.

#### Scenario: Gleichnamiger, aber zeitlich unpassender Elternteil erzeugt keinen Vorschlag

- **GIVEN** der Stammbaum enthält eine Person `Jacob Weber`, der OCR-Eintrag nennt ebenfalls `Jacob Weber` als Elternteil und das aus dem Eintrag erkennbare Geburtsjahr gehört zu einer anderen, nicht vorhandenen Person
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** wird für das darin genannte Kind kein normaler neuer Personenvorschlag erzeugt

#### Scenario: Passender gleichnamiger Elternteil wird als Bezugsperson verwendet

- **GIVEN** mehrere Personen `Jacob Weber` existieren und eine davon stimmt mit dem OCR-Geburtsjahr, -monat oder -tag überein
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** wird der neue Kindvorschlag nur mit der am besten passenden vorhandenen `Jacob Weber`-Person verknüpft

#### Scenario: OCR-Schreibfehler werden bei der Bezugsperson toleriert

- **GIVEN** der Stammbaum enthält `Hans Müller` und der OCR-Text nennt dieselbe Bezugsperson als `Hane Mueler` oder `Hane Müller`
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** kann `Hans Müller` als Bezugsperson erkannt werden, ohne den originalen OCR-Ausschnitt zu verändern

#### Scenario: Gleichstand zwischen Bezugspersonen wird konservativ behandelt

- **GIVEN** mehrere gleichnamige Stammbaum-Personen haben keine unterscheidbare oder gleich gute Datumsübereinstimmung mit dem OCR-Eintrag
- **WHEN** die Anwendung den OCR-Eintrag auswertet
- **THEN** wird kein unmarkierter Vorschlag einer beliebig ausgewählten Bezugsperson angezeigt

### Requirement: Vorschläge erhalten eine erklärbare Qualitätsbewertung

Jeder angezeigte Vorschlag MUST eine deterministische Punktzahl von 0 bis 100 und eine lesbare Begründung der Teilbewertungen enthalten. Die Gesamtbewertung MUST die Namensähnlichkeit der Bezugsperson mit bis zu 35 Punkten, Geburtsdatum/-jahr mit bis zu 35 Punkten, Geschlecht mit bis zu 10 Punkten, zeitliche beziehungsweise relationale Plausibilität mit bis zu 10 Punkten sowie Quellen- und Wiederholungsevidenz mit bis zu 10 Punkten berücksichtigen.

#### Scenario: Vollständiges Datum führt zur höchsten Datumsbewertung

- **GIVEN** eine OCR-Bezugsperson und eine Stammbaum-Person stimmen in Geburtsjahr, Monat und Tag überein
- **WHEN** der Vorschlag bewertet wird
- **THEN** erhält die Datumsdimension mehr Punkte als bei gleicher Übereinstimmung nur in Jahr und Monat, und diese mehr Punkte als bei gleicher Übereinstimmung nur im Jahr

#### Scenario: Passendes Geburtsjahr schlägt einen bloßen Namensgleichstand

- **GIVEN** zwei mögliche Bezugspersonen haben denselben Namen, aber nur eine passt zum im OCR-Eintrag erkannten Geburtsjahr
- **WHEN** die Vorschläge bewertet werden
- **THEN** erhält die zeitlich passende Bezugsperson den höheren Score und wird bevorzugt

#### Scenario: Fehlende oder widersprüchliche Datumsbestandteile werden nicht erfunden

- **GIVEN** der OCR-Text enthält kein zuverlässig erkennbares Geburtsdatum oder widerspricht der Stammbaumangabe
- **WHEN** die Anwendung die Datumsdimension berechnet
- **THEN** bleiben unbekannte Bestandteile neutral beziehungsweise schwächer bewertet, und es wird kein fehlender Tag, Monat oder Jahr ergänzt

#### Scenario: Score-Erklärung ist in der Vorschlagskarte sichtbar

- **GIVEN** ein Vorschlag überschreitet die Anzeigeschwelle
- **WHEN** die Vorschlagsliste dargestellt wird
- **THEN** zeigt die Karte den Score und verständliche Hinweise zu Name, Datum, Beziehung und Quellenqualität an

### Requirement: Vorschläge werden qualitätsgeordnet und evidenzbasiert zusammengefasst

Die Anwendung MUST normale Vorschläge absteigend nach ihrer Qualitätsbewertung anzeigen. Gleiche neue Person, gleiche Bezugsperson, gleiche Beziehung und gleiches erkannte Geburtsdatum aus mehreren OCR-Belegen MUSS zu einem Vorschlag zusammengefasst werden; die zusammengefasste Evidenz MUSS die Zahl oder die relevanten Quellen der Belege nachvollziehbar erhalten. Die Reihenfolge MUSS bei gleichem Eingang deterministisch bleiben.

#### Scenario: Ein besser passender Treffer steht vor einem Namensgleichstand

- **GIVEN** zwei neue Personenvorschläge haben denselben OCR-Namen, aber nur einer besitzt eine passende Bezugsperson und ein passendes Geburtsjahr
- **WHEN** die Vorschlagsliste sortiert wird
- **THEN** steht der zeitlich und relational besser passende Vorschlag vor dem anderen oder der schwache Vorschlag wird unterdrückt

#### Scenario: Wiederholte OCR-Evidenz erzeugt keine Kartenflut

- **GIVEN** derselbe neue Name mit derselben Beziehung und demselben Geburtsdatum wird auf mehreren Seiten oder durch beide OCR-Modelle erkannt
- **WHEN** die Anwendung Vorschläge dedupliziert
- **THEN** erscheint eine Karte mit zusammengefasster Evidenz, wobei die primäre Quelle nach der bestehenden Modellpriorität gewählt wird

#### Scenario: Schwache Vorschläge bleiben aus der normalen Liste entfernt

- **GIVEN** ein OCR-Muster hat weder ausreichende Namensähnlichkeit noch eine passende Datums- oder Beziehungsevidenz
- **WHEN** die Anwendung die Vorschläge berechnet
- **THEN** erscheint dieses Muster nicht in der normalen offenen Vorschlagsliste und verändert den Stammbaum nicht

### Requirement: Neue Personenvorschläge bleiben von vorhandenen Personen unterscheidbar

Die Anwendung MUST weiterhin ausschließlich neue Personen zur Erfassung vorschlagen und keine vorhandene Person automatisch bearbeiten oder zusammenführen. Ein gleicher Name allein DARF einen neuen Vorschlag nicht verhindern, wenn ein deutlich anderes Geburtsdatum und eine ausreichend starke neue Beziehungsevidenz eine eigenständige Person belegen. Ohne diese zusätzliche Evidenz MUSS ein gleichnamiger Kandidat unterdrückt werden.

#### Scenario: Gleichnamige neue Person mit anderem Geburtsdatum bleibt möglich

- **GIVEN** der Stammbaum enthält bereits `Georg Weber` und ein OCR-Eintrag nennt einen weiteren `Georg Weber` mit abweichendem, plausibel erkanntem Geburtsdatum und passender Bezugsperson
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** erscheint ein neuer Vorschlag, ohne die bestehende `Georg Weber`-Person zu verändern

#### Scenario: Gleichnamiger Kandidat ohne unterscheidende Evidenz wird nicht vorgeschlagen

- **GIVEN** der Stammbaum enthält bereits eine Person mit demselben Namen und der OCR-Eintrag liefert weder ein unterscheidbares Datum noch eine ausreichende Beziehungsevidenz
- **WHEN** die Anwendung die Quellen auswertet
- **THEN** wird keine zweite Person mit diesem Namen als normaler Vorschlag angezeigt

### Requirement: Vorschläge werden über die korrigierbare Personenmaske übernommen

Das Öffnen eines OCR-Vorschlags MUST die bestehende Maske zum Anlegen einer neuen Person mit den erkannten OCR-Daten als Vorausfüllung öffnen. Die Benutzerin MUST Name, Geschlecht, Geburtsdatum, Todesdatum und Kommentar vor dem Speichern ändern können. Erst ein erfolgreiches Speichern DARF Person und Beziehung in den Dokumentzustand übernehmen; Abbrechen MUST den Stammbaum und den offenen Vorschlag unverändert lassen.

#### Scenario: OCR-Daten werden in der Personenmaske vorausgefüllt

- **GIVEN** ein bewerteter Vorschlag enthält einen Namen, ein erkennbares Geburtsdatum und gegebenenfalls ein Geschlecht
- **WHEN** die Benutzerin den Vorschlag zur Bearbeitung öffnet
- **THEN** zeigt die Personenmaske diese Werte vorausgefüllt und lässt sie vor dem Speichern editieren

#### Scenario: Korrigierter Vorschlag wird erst beim Speichern übernommen

- **GIVEN** die Benutzerin ändert mindestens ein vorausgefülltes OCR-Feld
- **WHEN** sie die Personenmaske speichert und die Domänenvalidierung erfolgreich ist
- **THEN** werden die korrigierte neue Person und die OCR-gekennzeichnete Beziehung atomar angelegt, der Vorschlag entfernt und der bestehende Speicherstatus auf ungespeichert gesetzt

#### Scenario: Abbrechen verändert weder Vorschlag noch Stammbaum

- **GIVEN** die Personenmaske für einen OCR-Vorschlag ist geöffnet
- **WHEN** die Benutzerin die Maske abbricht
- **THEN** bleibt der Vorschlag offen und Personen, Beziehungen sowie Dirty-State des Stammbaums bleiben unverändert

#### Scenario: Fehler beim Speichern lässt den Vorschlag offen

- **GIVEN** die korrigierten Werte verletzen eine Personen- oder Beziehungsvalidierung
- **WHEN** die Benutzerin speichert
- **THEN** zeigt die Anwendung den konkreten Fehler, übernimmt keine Teiländerung und lässt die Maske sowie den OCR-Vorschlag zur Korrektur geöffnet

### Requirement: Bezugspersonen eines OCR-Vorschlags sind direkt erreichbar

Die Anwendung MUST den Namen einer im Stammbaum vorhandenen Bezugsperson in der OCR-Vorschlagskarte als zugängliche Aktion anzeigen. Wird diese Aktion ausgelöst, MUSS die Anwendung genau die durch die Vorschlagsreferenz bestimmte Person auswählen, ihren sichtbaren Stammbaumknoten fokussieren und den bestehenden Personen-Inspector für diese Person anzeigen. Die Aktion MUST eine reine Navigation bleiben und darf weder den Dokumentinhalt noch den Dirty-State verändern.

#### Scenario: Bezugsperson aus einer Vorschlagskarte öffnen

- **GIVEN** eine OCR-Vorschlagskarte verweist über ihre stabile Personenreferenz auf `Anna Weber`
- **WHEN** die Benutzerin den klickbaren Namen `Anna Weber` in der Karte auslöst
- **THEN** wird `Anna Weber` im Stammbaum ausgewählt, die Arbeitsfläche auf ihren Knoten fokussiert und ihr Personen-Inspector angezeigt

#### Scenario: Gleichnamige Bezugspersonen bleiben eindeutig

- **GIVEN** zwei vorhandene Personen denselben angezeigten Namen haben und zwei Vorschläge jeweils auf eine andere stabile Personenreferenz zeigen
- **WHEN** die Benutzerin den Namen in einer der Karten auslöst
- **THEN** wird die zur Karte gehörende Personenreferenz ausgewählt und nicht lediglich ein gleichnamiger Treffer anhand des Namens

#### Scenario: Unbekannte Bezugsperson ist nicht navigierbar

- **GIVEN** die Personenliste enthält keine Person zur Bezugsperson-Referenz eines Vorschlags
- **WHEN** die Vorschlagskarte dargestellt wird
- **THEN** zeigt sie den bisherigen Hinweis auf eine unbekannte Bezugsperson ohne klickbare Aktion zu einer falschen Person

#### Scenario: Navigation verändert keine OCR- oder Fachdaten

- **GIVEN** eine OCR-Vorschlagskarte und ein unveränderter geladener Stammbaum werden angezeigt
- **WHEN** die Benutzerin die Bezugsperson öffnet
- **THEN** bleiben Vorschlagskarte, Personenanzahl, Beziehungen, OCR-Daten und Speichern-Status unverändert
