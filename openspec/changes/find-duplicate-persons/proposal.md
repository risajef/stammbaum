## Why

Im Stammbaum können dieselben Personen mehrfach erfasst sein, ohne dass sie bei einer normalen Namenssuche zuverlässig als zusammengehörige Datensätze erkennbar sind. Eine nicht-destruktive Duplikatsuche soll alle gleichnamigen Kandidatenpaare sichtbar machen und sie nach der Verlässlichkeit ihrer Datums- und Generationsinformationen für den manuellen Vergleich ordnen.

## What Changes

- Das System ermittelt aus dem vollständigen Dokument alle Paare verschiedener Personen mit identischem normalisiertem Vor- und Nachnamen.
- Direkte Eltern-Kind-Paare werden auch bei gleichem Namen nicht als Duplikate betrachtet, weil Kinder häufig nach einem Elternteil benannt werden.
- Haben beide Personen ein gültiges Geburtsdatum, werden nur Paare mit kompatiblen bekannten Datumsbestandteilen aufgenommen. Ein vollständiges gleiches Datum hat die höchste Priorität; kompatible unvollständige Daten werden niedriger priorisiert.
- Fehlt bei mindestens einer Person das Geburtsdatum, wird die Layout-Generation als Ersatzinformation verwendet. Das Paar gilt als kompatibel, wenn die Generationen höchstens eine Generation auseinanderliegen; gemischte Paare aus bekanntem und unbekanntem Datum sind zulässig.
- Die Kandidaten werden nach vier Prioritäten sortiert: beide vollständigen Daten exakt gleich, vorhandene aber teilweise ungenaue Daten, genau ein fehlendes Datum, beide fehlenden Daten. Gleichrangige Paare bleiben in stabiler Dokumentreihenfolge.
- Die Kandidatenpaare erscheinen in einem eigenen Bereich „Duplikate“ neben der bestehenden Personensuche. Beide Personen eines Paares können angeklickt werden, um den jeweiligen Knoten im Graphen zu fokussieren.
- Die Bereiche „Duplikate“ und „OCR-Vorschläge“ können unabhängig voneinander über ihren Header ein- und ausgeblendet werden. Dieser reine View-Zustand startet geöffnet und wird nicht gespeichert.
- Die Personenkarten behalten ihre bestehende Größe und geschlechtsspezifische Farbgebung, nutzen den Innenraum aber kompakter: Vorname und Nachname stehen getrennt untereinander; das Geschlechtskürzel und die Beschriftung „Mann“/„Frau“ entfallen.
- Die Duplikatsuche bleibt eine reine Ansichtsfunktion. Sie darf Personen, Beziehungen, IDs, den Dirty-State oder den YAML-Export nicht verändern und führt keine automatische Fusion oder Löschung aus.
- Die Ergebnisse werden aus dem aktuellen Dokument und der aktuellen Layout-Generation abgeleitet und aktualisieren sich nach Import, Bearbeitung, Fusion oder Löschung automatisch.

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `family-tree-views`: Die bestehende Such- und Navigationsfähigkeit wird um bewertete gleichnamige Duplikatspaare, kompatible Teil-Datumswerte, generationenbasierte Kandidaten ohne Datum und die Navigation zu ausgeblendeten Personen erweitert.

## Impact

- Reine Auswertungslogik für normalisierte Namen, kompatible Teil-Datumswerte, Layout-Generationen, Kandidatenpaare und Prioritätsstufen.
- Ausschluss direkter Eltern-Kind-Beziehungen aus der Kandidatenmenge.
- Anpassungen der Arbeitsflächen-UI neben der bestehenden Personensuche sowie der Navigation und Sichtbarmachung fokussierter Personen.
- Flüchtige, unabhängige Sichtbarkeits-Toggles für Duplikat- und OCR-Prüfbereiche.
- Kompaktere, zweizeilige Personenkarten ohne redundante Geschlechtsanzeige.
- Gemeinsame Nutzung der nicht persistierten Generationsebene des Layouts für die Kandidatenprüfung.
- Komponenten-, Anwendungs- und Graph-Layouttests für Paarbildung, Priorisierung, Filterverhalten, Graph-Fokus und unveränderte Dokumentdaten.
- Keine Änderung am YAML-Schema, keine neue Abhängigkeit und kein Backend-Aufruf.
