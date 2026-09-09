## Purpose

Diese Fähigkeit macht lokale Kirchenbuch- und OCR-Transkriptionen als quellenbezogene, ausdrücklich prüfbare Vorschläge für den geladenen Stammbaum nutzbar.

## ADDED Requirements

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
