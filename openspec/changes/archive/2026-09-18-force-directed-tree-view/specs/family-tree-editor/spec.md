## ADDED Requirements

### Requirement: Eine zusätzliche Federungsansicht zeigt den aktuellen Anzeigegraphen

Die Arbeitsfläche MUST neben der bestehenden bearbeitbaren Übersicht eine zusätzliche Federungsansicht anbieten. Die Federungsansicht MUST denselben aktuell sichtbaren Anzeigegraphen wie die Übersicht verwenden, einschließlich Suche, Ansichtsfiltern, Beziehungen und aktiver virtueller Kindergruppen. Die bestehende Übersicht MUST standardmäßig aktiv bleiben.

#### Scenario: Zwischen Übersicht und Federungsansicht wechseln

- **GIVEN** die Arbeitsfläche ist geöffnet
- **WHEN** die Benutzerin die Federungsansicht auswählt
- **THEN** wird die zusätzliche Ansicht sichtbar und die bestehende Übersicht ist nicht gleichzeitig als zweite Arbeitsfläche gerendert

#### Scenario: Filter gelten auch in der Federungsansicht

- **GIVEN** ein Stammbaum enthält mehrere Personen und ein Ansichtsfilter ist aktiv
- **WHEN** die Benutzerin die Federungsansicht öffnet
- **THEN** enthält der Anzeigegraph genau die Personen, virtuellen Kindergruppen und Beziehungen, die auch in der gefilterten Übersicht sichtbar wären

#### Scenario: Die Simulation verteilt den Anzeigegraphen

- **GIVEN** die Federungsansicht enthält mindestens zwei verbundene Nodes
- **WHEN** die Simulation nach ihrer Initialisierung läuft
- **THEN** werden die Nodes durch ihre Beziehungen und räumliche Kräfte in eine sichtbare, nicht vollständig überlappende Anordnung bewegt

#### Scenario: Leere oder leer gefilterte Anzeige

- **GIVEN** das Dokument enthält keine Personen oder die aktiven Filter liefern keine sichtbaren Personen
- **WHEN** die Benutzerin die Federungsansicht öffnet
- **THEN** bleibt die Ansicht ohne Fehler bedienbar und zeigt den bestehenden Leerzustand an

### Requirement: Nodes der Federungsansicht können flüchtig verschoben werden

Die Federungsansicht MUST das direkte Verschieben sichtbarer Personen- und virtueller Gruppenknoten mit der Maus erlauben. Während des Ziehens MUST der betroffene Node der Maus folgen. Nach dem Loslassen MUSS seine Position für die aktuelle Federungsansicht als manuelle Position erhalten bleiben, während die übrigen Nodes weiter simuliert werden. Diese Positionen MUST ausschließlich flüchtiger Ansichtszustand sein.

#### Scenario: Node per Maus verschieben

- **GIVEN** die Federungsansicht zeigt einen Personenknoten
- **WHEN** die Benutzerin den Knoten mit der Maus an eine andere Stelle zieht und loslässt
- **THEN** bleibt der Knoten an der neuen Position sichtbar und die übrigen sichtbaren Nodes können sich weiter durch die Simulation anpassen

#### Scenario: Force-Positionen ändern keine Fachdaten

- **GIVEN** ein Stammbaum ist geöffnet und die Federungsansicht zeigt Nodes
- **WHEN** die Benutzerin einen Node verschiebt und anschließend speichert oder exportiert
- **THEN** bleibt das `FamilyTreeDocument` unverändert, der Dirty-State unverändert und der Export frei von den flüchtigen Force-Positionen

#### Scenario: Veraltete Force-Positionen werden nicht wiederverwendet

- **GIVEN** die Benutzerin hat einen Node in der Federungsansicht verschoben
- **WHEN** sie einen Filter oder das geöffnete Dokument so ändert, dass dieser Node nicht mehr sichtbar oder nicht mehr vorhanden ist
- **THEN** wird seine alte Force-Position nicht auf einen anderen Node angewendet und neu sichtbare Nodes erhalten gültige Startpositionen

### Requirement: Die Federungsansicht ist für Stammbauänderungen schreibgeschützt

Die Federungsansicht MUST die fachlichen Daten des Stammbaums lesend darstellen. In dieser Ansicht MUST die Benutzerin keine Person oder Beziehung anlegen, bearbeiten oder löschen, keine Nodes verbinden und keine virtuellen Kindergruppen ein- oder auffächern können. Das Umschalten der Ansicht und das Verschieben von Nodes bleiben erlaubt und ändern den fachlichen Dirty-State nicht.

#### Scenario: Bearbeitungsaktionen sind im Force-View nicht verfügbar

- **GIVEN** die Federungsansicht ist aktiv
- **WHEN** die Benutzerin die Arbeitsfläche und den Detailbereich betrachtet
- **THEN** sind Aktionen zum Anlegen, Bearbeiten, Löschen, Verbinden, Zusammenführen sowie Ein- und Auffächern nicht erreichbar oder deaktiviert

#### Scenario: Wechsel zurück aktiviert die bestehende Bearbeitung

- **GIVEN** die Federungsansicht ist aktiv und enthält nur flüchtige Node-Positionen
- **WHEN** die Benutzerin zur Übersicht zurückwechselt
- **THEN** ist die bestehende bearbeitbare Ansicht wieder verfügbar und die fachlichen Daten entsprechen unverändert dem Zustand vor dem Wechsel

