## Purpose

Diese Capability erweitert die readonly Duplikatsuche um projektbezogene Schreibvarianten und tolerante Mehrfachvornamen, damit historisch unterschiedliche Erfassungen derselben Person als Kandidaten sichtbar werden.

## ADDED Requirements

### Requirement: Namensvarianten werden aus der Root-Konfiguration geladen

Das System SHALL eine Datei `duplicate-name-variants.yaml` im Projekt-Root verwenden. Die Datei MUST getrennte Listen `firstNameVariants` und `lastNameVariants` mit Namensgruppen unterstützen. Alle Namen innerhalb einer Gruppe MÜSSEN symmetrisch und transitiv als gleichwertige Schreibvarianten behandelt werden. Die Konfiguration MUSS beim Build beziehungsweise beim Start der Anwendung eingelesen werden und darf keine Stammbaumdaten verändern.

#### Scenario: Konfigurierte Varianten werden symmetrisch verglichen

- **GIVEN** die Konfiguration enthält `Schelling` und `Schilling` in einer Nachnamensgruppe
- **WHEN** zwei gleichnamige Personen diese beiden Schreibweisen verwenden
- **THEN** werden die Nachnamen für die Duplikatsuche als kompatibel betrachtet, unabhängig von ihrer Reihenfolge

#### Scenario: Vor- und Nachnamenslisten bleiben getrennt

- **GIVEN** ein Name steht in `firstNameVariants` und ein anderer in `lastNameVariants`
- **WHEN** zwei Personen verglichen werden
- **THEN** wird die Variante nur im jeweils passenden Namensfeld angewendet

### Requirement: Duplikatsuche unterstützt Mehrfachvornamen mit fehlenden Tokens

Das System SHALL zwei Personen als namenskompatibel betrachten, wenn ihre Nachnamen exakt oder über eine konfigurierte Nachnamensgruppe übereinstimmen und die Tokens des kürzeren Vornamens vollständig mit eindeutigen Tokens des längeren Vornamens übereinstimmen. Ein Tokenvergleich MUSS konfigurierte Vornamensvarianten berücksichtigen und darf nicht von der Tokenreihenfolge abhängen. Die bestehende Geburtsdatenkompatibilität, Priorisierung und der Ausschluss direkter Eltern-Kind-Paare MÜSSEN unverändert gelten.

#### Scenario: Einzelner Vorname matcht zusammengesetzten Vornamen

- **GIVEN** eine Person heißt `Johann Heinrich Weber` und eine weitere `Heinrich Weber`
- **WHEN** die Duplikatpaare berechnet werden
- **THEN** wird das Paar als namenskompatibler Kandidat berücksichtigt

#### Scenario: Vornamensvariante wird in einem Token verwendet

- **GIVEN** die Konfiguration enthält `Jacob` und `Jakob` in einer Vornamensgruppe
- **WHEN** eine Person `Jacob` und eine weitere `Jakob` heißt
- **THEN** werden die Vornamen als kompatibel betrachtet

#### Scenario: Nicht konfigurierte Schreibweise bleibt ausgeschlossen

- **GIVEN** die Konfiguration enthält keine Gruppe für `Müller` und `Mueller`
- **WHEN** zwei Personen nur diese unterschiedlichen Schreibweisen verwenden
- **THEN** erzeugt die Duplikatsuche daraus kein Namenspaar

#### Scenario: Datumspriorität bleibt bei Varianten erhalten

- **GIVEN** zwei Personen werden nur über eine konfigurierte Namensvariante kompatibel und besitzen dasselbe vollständige Geburtsdatum
- **WHEN** die Duplikate sortiert werden
- **THEN** erhält das Paar weiterhin Priorität 1
