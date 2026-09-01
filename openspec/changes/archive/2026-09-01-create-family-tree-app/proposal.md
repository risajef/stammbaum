## Why

Stammbaumdaten sollen ohne Datenbank als nachvollziehbare Dateien gepflegt werden koennen, waehrend Personen und Familienbeziehungen auf einen Blick verstaendlich bleiben. Eine lokale visuelle Anwendung soll das Anlegen und Bearbeiten von Personen sowie das Ziehen von Ehe- und Eltern-Kind-Verbindungen deutlich einfacher machen als eine rein textuelle Pflege.

## What Changes

- Eine lokal im Browser laufende Stammbaum-Anwendung mit einer grafischen Arbeitsflaeche fuer Personen und Beziehungen.
- Personen koennen mit Vorname, Nachname, optionalem Geschlecht (Frau oder Mann), Geburtsjahr und Todesjahr angelegt und bearbeitet werden.
- Zwischen einer Frau und einem Mann kann eine Eheverbindung angelegt werden; Personen koennen als Eltern mit ihren Kindern verbunden werden.
- Jede Beziehung kann als explizit belegt oder geschlussfolgert markiert werden und eine optionale Quellen-URL tragen.
- Beziehungen lassen sich direkt in der Arbeitsflaeche anlegen, auswaehlen und entfernen; geschlussfolgerte Beziehungen bleiben visuell unterscheidbar.
- Ein Stammbaum wird als eine YAML-Datei importiert und exportiert. Die Anwendung verwendet keine Datenbank.
- Die Oberflaeche bietet fokussierte Bearbeitung, stabile Navigation auf der Arbeitsflaeche sowie klare Validierungs- und Speicherfehler.
- Automatische Schlussfolgerungen, Suche/Filter, Rueckgaengig-Wiederholen, Bilder, Ereignisdaten ausser Geburts-/Todesjahr, weitere Beziehungstypen, Zusammenarbeit und serverseitige Speicherung sind nicht Teil dieses MVP.

## Capabilities

### New Capabilities

- `family-tree-editor`: Personen, Ehe- und Eltern-Kind-Beziehungen, Quellen, Schlussfolgerungsstatus, grafische Bearbeitung und YAML-Dateiablage.

### Modified Capabilities

- Keine bestehenden Capabilities werden geaendert.

## Impact

- Neues Frontend-Projekt auf Basis von Vite, React und TypeScript.
- Neue dateibasierte Datenstruktur inklusive Schema-Version und YAML-Serialisierung/-Validierung.
- Interaktive Graphdarstellung mit direkter Kantenbearbeitung und responsiver Arbeitsflaeche.
- Vitest fuer Unit-/Komponententests und Playwright fuer die wichtigsten Browser-Workflows; die konkreten Befehle werden bei der Projektinitialisierung als `npm test` und `npm run test:e2e` eingerichtet.
- Der MVP zielt primaer auf aktuelle Desktop-Browser. Dateiimport und -export muessen bei nicht verfuegbaren erweiterten Dateisystem-APIs ueber einen Download-/Upload-Fallback funktionieren.

## Assumptions and Open Questions

- Die Vorgabe "Frau und Mann" wird im MVP durch ein Person-Feld mit den Werten Frau oder Mann abgebildet; unbekannte oder weitere Geschlechtswerte sowie andere Partnerschaftstypen werden erst spaeter betrachtet.
- "Geschlussfolgert" ist ein manuell gesetzter Kantenstatus. Die Anwendung leitet Beziehungen nicht automatisch aus anderen Daten ab.
- Eine Quelle ist optional; wenn sie angegeben wird, muss sie eine gueltige HTTP- oder HTTPS-URL sein.
- Unbekannte Geburts- oder Todesjahre bleiben leer. Genauere YAML-Feldnamen, Layoutstrategie und die Wahl der Graphbibliothek sind Designentscheidungen und muessen die hier festgelegten beobachtbaren Regeln einhalten.