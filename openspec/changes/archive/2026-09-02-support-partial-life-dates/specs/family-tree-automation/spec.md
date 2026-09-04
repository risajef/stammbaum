## MODIFIED Requirements

### Requirement: Sichere Elternschaften werden automatisch geschlussfolgert

Das System MUST fuer eine Eltern-Kind-Beziehung A nach C die Ehepartner von A als moegliche weitere Eltern pruefen. Bei genau einem Ehepartner B MUST eine fehlende Beziehung B nach C automatisch mit `status: inferred` angelegt werden, auch wenn Lebensdaten fehlen. Bei mehreren Ehepartnern MUSS das System bekannte Datumskomponenten von C und den Ehepartnern vergleichen: Ein Ehepartner, dessen Tod nachweisbar vor dem Geburtsdatum von C liegt, ist nicht zeitlich moeglich; fehlende Datumskomponenten bleiben unbekannt. Wenn nach diesem Vergleich genau ein Ehepartner zeitlich moeglich bleibt, DARF eine automatische Elternschaft angelegt werden. Sind kein Geburtsdatum von C vorhanden oder mehrere Ehepartner zeitlich moeglich, DARF keine automatische Elternschaft angelegt werden.

Automatisch angelegte Beziehungen MUESSEN im Dokument als `status: inferred` und als automatisch abgeleitet gekennzeichnet werden. Ihre automatisch erzeugte Erklaerung MUSS als Kommentar hinterlegt werden. Wird die Quellbeziehung entfernt oder ist die Zeitbedingung spaeter nicht mehr erfuellt, MUSS die automatisch angelegte Beziehung entfernt werden; ein bestehender Kommentar einer weiterhin gueltigen automatischen Beziehung MUSS erhalten bleiben.

#### Scenario: Einziger Ehepartner wird als zweiter Elternteil ergaenzt
- **GIVEN** A ist mit B verheiratet und A ist Elternteil von C
- **WHEN** die Beziehung gespeichert wird
- **THEN** wird B nach C automatisch als `inferred` angelegt und die Beziehung erklaert ihre Ableitung per Kommentar

#### Scenario: Mehrere Ehepartner werden ueber Todesdaten zugeordnet
- **GIVEN** A hat mehrere Ehepartner, C hat ein bekanntes Geburtsdatum, genau ein Ehepartner B ist nach den bekannten Datumskomponenten zeitlich moeglich und alle anderen Ehepartner sind nachweisbar vorher gestorben
- **WHEN** A als Elternteil von C gespeichert wird
- **THEN** wird nur B nach C als `inferred` angelegt

#### Scenario: Fehlendes Todesdatum verhindert die mehrdeutige Ableitung
- **GIVEN** A hat mehrere Ehepartner und mindestens ein Todesdatum oder das Geburtsdatum von C ist nur teilweise oder gar nicht bekannt, sodass dadurch mehrere Ehepartner zeitlich moeglich bleiben
- **WHEN** die zeitliche Eignung der Ehepartner bestimmt wird
- **THEN** werden fehlende Komponenten nicht durch angenommene Monate oder Tage ersetzt und bei dadurch mehreren moeglichen Ehepartnern wird keine automatische Elternschaft angelegt

#### Scenario: Mehrere zeitlich passende Ehepartner verhindern eine Ableitung
- **GIVEN** A hat mehrere Ehepartner, C hat ein bekanntes Geburtsdatum und mindestens zwei Ehepartner sind nach den bekannten Komponenten zeitlich moeglich
- **WHEN** A als Elternteil von C gespeichert wird
- **THEN** wird keine automatische Elternschaft angelegt

#### Scenario: Automatische Beziehung wird bei ungueltiger Voraussetzung entfernt
- **GIVEN** B nach C wurde aus A-Ehe-B und A nach C automatisch angelegt
- **WHEN** die Ehe oder die Quell-Elternschaft entfernt wird oder die Zeitbedingung nicht mehr gilt
- **THEN** wird nur die automatische Beziehung entfernt und die manuell erfassten Personen sowie andere Beziehungen bleiben erhalten
