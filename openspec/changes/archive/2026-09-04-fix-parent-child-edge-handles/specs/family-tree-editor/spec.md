## MODIFIED Requirements

### Requirement: Beziehungstypen sind auf der Arbeitsflaeche unterscheidbar

Das System MUST Ehe- und Eltern-Kind-Beziehungen auf der Arbeitsflaeche durch eine gemeinsame weiche `simplebezier`-Linienform sowie unterschiedliche Farben und sichtbare Typbezeichnungen unterscheidbar darstellen. Eine gespeicherte Eltern-Kind-Beziehung MUST am unteren Handle der Elternperson starten und am oberen Handle der Kindperson enden. Eine Eltern-Kind-Beziehung MUST weiterhin eindeutig in Richtung des Kindes zeigen; eine Ehe MUSS ihre seitlichen Ehe-Handles verwenden und DARF keinen Richtungspfeil zum Ehepartner anzeigen. Der Beziehungsstatus `inferred` MUSS unabhaengig vom Beziehungstyp zusaetzlich erkennbar bleiben.

#### Scenario: Ehe und Elternschaft haben unterschiedliche Kanten
- **GIVEN** eine Arbeitsflaeche enthaelt eine Ehe und eine Eltern-Kind-Beziehung
- **WHEN** beide Beziehungen angezeigt werden
- **THEN** unterscheiden sie sich ohne Oeffnen des Inspektors durch Farbe oder sichtbare Typbezeichnung

#### Scenario: Elternschaft zeigt zum Kind
- **GIVEN** eine gerichtete Eltern-Kind-Beziehung von A nach C ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** startet sie am unteren Handle von A, endet am oberen Handle von C und besitzt eine sichtbare Richtungsspitze auf der Seite von C

#### Scenario: Ehe hat keine kuenstliche Richtung
- **GIVEN** eine Ehe zwischen A und B ist vorhanden
- **WHEN** ihre Kante angezeigt wird
- **THEN** verbindet sie die seitlichen Ehe-Handles und besitzt keine Richtungsspitze, die einen Ehepartner als Kind oder Ziel auszeichnet

#### Scenario: Gespeicherte Beziehungen verwenden ihre semantischen Handles
- **GIVEN** ein Mann mit seitlichem Ehe-Handle und unterem Eltern-Handle ist mit anderen Personen verbunden
- **WHEN** die gespeicherten Beziehungen angezeigt werden
- **THEN** beginnt eine Eltern-Kind-Kante am unteren Handle und eine Ehe-Kante am seitlichen Ehe-Handle, ohne dass die Kantenart vom zufaelligen Handle-Reihenfolge im Node abhaengt

