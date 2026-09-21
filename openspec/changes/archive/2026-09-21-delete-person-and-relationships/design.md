## Context

Beziehungen können bereits über den Beziehung-Inspektor mit Bestätigung entfernt werden. Personenänderungen laufen über `src/domain/person.ts` und werden in `App.tsx` in den Dokumentzustand übernommen. Das neue Löschen muss deshalb dieselbe nichtpersistente UI-Auswahl- und Dirty-State-Behandlung nutzen wie das Entfernen einer Beziehung.

## Goals / Non-Goals

**Goals:**

- Eine ausgewählte bestehende Person über einen sichtbaren Inspektor-Button löschen.
- Die Löschung im Domänenmodell atomar ausführen und alle Beziehungen mit der Person entfernen.
- Die automatische Beziehungsableitung nach der Löschung konsistent halten.
- Auswahl, temporäre Positionen und Dirty-State nach erfolgreicher Löschung zurücksetzen.

**Non-Goals:**

- Keine Papierkorb-, Undo- oder Wiederherstellungsfunktion.
- Keine Löschung über Tastatur oder Kontextmenü.
- Keine zusätzliche Bestätigung pro einzelner Beziehung.
- Keine Änderung der bestehenden Fusionslogik.

## Decisions

1. **Kaskadierende Löschung als eine Domänenoperation.**

   Eine neue Operation entfernt zuerst die Person und filtert anschließend alle Beziehungen, deren `fromId` oder `toId` auf die ID zeigen. Danach werden automatische Beziehungen synchronisiert und das Ergebnis validiert. So kann die UI keine Person ohne Beziehungen oder Beziehungen zu einer nicht vorhandenen Person hinterlassen. Einzelne `removeRelationship`-Aufrufe in der UI wären fehleranfällig und würden bei vielen Beziehungen unnötig mehrere Zwischenzustände erzeugen.

2. **Bestätigung in der App, Fehler im Domainmodell.**

   Die App verwendet wie beim Beziehungsentfernen `window.confirm`. Die reine Domänenoperation bleibt ohne Browserabhängigkeit testbar und liefert bei unbekannter ID einen `person-not-found`-Fehler.

3. **Button nur für bestehende Personen.**

   Bei einer neuen Person oder während des Fusionsmodus wird kein Löschbutton angezeigt. Damit bleibt die Formularaktion eindeutig und ein noch nicht gespeicherter Entwurf kann weiterhin nur verworfen werden.

## Risks / Trade-offs

- [Risk] Ein Klick entfernt eine Person und mehrere Beziehungen dauerhaft aus dem aktuellen Dokumentzustand. → Der Vorgang wird vor Ausführung bestätigt und wird erst beim Speichern dauerhaft exportiert.
- [Risk] Das Entfernen einer Person kann automatisch abgeleitete Beziehungen anderer Personen neu berechnen. → Die bestehende Inferenzsynchronisation und Dokumentvalidierung werden nach der Kaskade verwendet.
- [Risk] Aktive Filter oder temporäre Gruppen enthalten die gelöschte Person nicht mehr. → Auswahl, Gruppen und temporäre Positionskarten werden nach erfolgreicher Löschung wie bei anderen strukturellen Änderungen zurückgesetzt.
