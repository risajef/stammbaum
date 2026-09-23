## Context

Die reine View-Projektion in `src/graph/graph-view.ts` bildet bereits Eltern-, Kinder- und Partnerindizes und berechnet Blutlinien- sowie Vorfahrenmengen. `App.tsx` speichert den zuletzt per Button angewendeten Modus samt Anker unabhängig von der laufenden Node-Auswahl. Siehe `proposal.md` und die Delta-Spezifikation für das beobachtbare Verhalten.

## Goals / Non-Goals

**Goals:**

- Zwei weitere Modi in derselben bestehenden Filterkette unterstützen: reine Nachkommen und erweiterte Nachkommen.
- Die Nachkommenmengen über beliebig viele parent-child-Generationen bestimmen.
- In der erweiterten Variante alle direkten Partner tatsächlicher Nachkommen sowie deren Kinder einschließen, ohne Partnerketten zu verfolgen.
- Die bestehende On-demand-Ankerung, Schnittmengenlogik, Auswahl-Synchronisierung und Speicherausnahme für neue Personen unverändert weiterverwenden.

**Non-Goals:**

- Keine Umbenennung der bestehenden `BloodlineMode`-API oder eine neue persistierte Filterstruktur.
- Keine Änderung der Semantik von Blutsverwandten-, Vorfahren-, lokaler oder Leaf-Ansicht.
- Keine rekursive Ermittlung von Eltern, Geschwistern, Partnern der neu hinzugekommenen Kinder oder weiteren Partnerfamilien.

## Decisions

1. **Bestehenden Modus-Typ erweitern:** `BloodlineMode` erhält die Werte `descendants` und `extended-descendants`. Der bestehende Typname und die `GraphViewOptions` bleiben erhalten, weil die Modi dieselbe einzelne View-Filterdimension bilden und dadurch keine zusätzliche State-Struktur nötig ist. Eine separate `FamilyFilterMode`-Abstraktion würde nur eine bestehende öffentliche Grenze umbenennen.

2. **Nachkommen per gerichteter BFS bestimmen:** Eine Hilfsfunktion startet mit dem Anker und folgt ausschließlich `childrenByParent` abwärts. Eine besuchte Menge beendet die Suche bei wiederholten oder zyklischen Daten und erlaubt beliebig viele Generationen ohne Tiefenlimit.

3. **Erweiterung in zwei nicht-rekursiven Schritten:** Zuerst wird die vollständige Nachkommenmenge berechnet. Danach werden nur für tatsächliche Nachkommen (die Menge ohne den Anker) alle Partner aufgenommen. Im letzten Schritt werden die direkten Kinder jedes dieser Partner aufgenommen. Die neu hinzugekommenen Kinder werden nicht erneut als Partnerquellen verwendet; dadurch entstehen keine Partnerketten. Der Partner des Ankers ist keine Partnerquelle und bleibt ausgeschlossen.

4. **UI wiederverwendet den vorhandenen Klickzustand:** `handleBloodlineModeClick` erhält lediglich die beiden zusätzlichen Moduswerte; die bestehende Speicherung von `{ mode, anchorPersonId }` sorgt automatisch dafür, dass die Auswahl nach dem Klick nicht weiter auf die Projektion wirkt. Die Oberfläche ergänzt zwei gewöhnliche Buttons ohne `aria-pressed`, `checked` oder Radio-Elemente.

5. **Tests an bestehenden öffentlichen Grenzen:**
   - `filterFamilyTreeDocument` wird mit literal erwarteten Personenmengen für Nachkommen, Partnerkinder und ausgeschlossene Partnerketten getestet.
   - `App` wird über zugängliche Buttons, sichtbare Personenanzahl/Nodes und den Inspector getestet: beide neuen Buttons existieren, „Nachkommen“ bleibt beim Personenwechsel stabil und „Erweiterte Nachkommen“ übernimmt den neuen Anker erst nach erneutem Klick.
   - Die vorhandenen Tests für Speicherausnahmen, lokale Ansicht, Leaf-Filter, bestehende Modi und YAML-Persistenz bleiben unverändert grün; die neue Projektion nutzt dieselben `unfilteredPersonIds`.

## Risks / Trade-offs

- **[Risk]** Die bestehende Indexbildung behandelt jede nicht-parent-child-Beziehung als Partnerbeziehung. → **Mitigation:** Der Dokumenttyp erlaubt hier nur `marriage` oder `parent-child`; die neuen Tests verwenden die öffentliche Dokumentrepräsentation und prüfen die gewünschte Begrenzung.
- **[Risk]** Eine zyklische oder fehlerhafte Eltern-Kind-Struktur könnte eine rekursive Suche endlos laufen lassen. → **Mitigation:** Die BFS verwendet Sets für bereits besuchte Personen und beendet damit jeden Knoten höchstens einmal.
- **[Risk]** Die erweiterte Ansicht könnte durch eine falsche Iterationsquelle ungewollt Partnerketten erweitern. → **Mitigation:** Partnerquellen werden vor der Erweiterung als die ursprünglichen tatsächlichen Nachkommen festgelegt; Partnerkinder werden nicht wieder als Quellen verwendet.

## Migration Plan

Keine Datenmigration und keine Abhängigkeitserweiterung. Bestehende YAML-Dateien bleiben unverändert kompatibel, weil die neuen Modi ausschließlich im flüchtigen View-Zustand leben. Ein Rollback entfernt die beiden Moduswerte, Hilfsfunktionen und Buttons.
