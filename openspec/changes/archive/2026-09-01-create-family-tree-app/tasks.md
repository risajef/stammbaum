## 1. Projektgrundlage und Test-Harness

- [x] 1.1 Das Vite-/React-/TypeScript-Projekt mit klaren Quell-, Test- und E2E-Verzeichnissen anlegen und die in `design.md` begruendeten Abhaengigkeiten fuer Graph, YAML und Laufzeitvalidierung einrichten; verifizieren mit `npm run build`.
- [x] 1.2 Vitest, Playwright und die Skripte `npm test`, `npm run test:e2e` und `npm run build` konfigurieren und je einen funktionierenden Smoke-Test fuer Unit- und Browserausfuehrung hinterlegen; verifizieren mit `npm test` und `npm run test:e2e`.

## 2. Domainmodell und Personen

- [x] 2.1 Zuerst die fehlenden Domain-Tests fuer Personenerstellung, optionale Lebensdaten, unveraenderte Beziehungen bei Personenaenderungen sowie Jahres- und Pflichtfeldvalidierung schreiben und den erwarteten roten Lauf mit `npm test -- src/domain/person.test.ts` beobachten.
- [x] 2.2 Die frameworkfreie Dokument- und Personenlogik mit stabilen IDs, optionalem `gender`, `birthYear`, `deathYear` und `position` implementieren; verifizieren mit `npm test -- src/domain/person.test.ts`.

## 3. Beziehungsregeln

- [x] 3.1 Zuerst fehlende Domain-Tests fuer Ehekanonisierung Frau/Mann, mehrere Ehen, Duplikate, Selbstbeziehungen, ungueltige Geschlechtsaenderungen sowie mehrere Eltern-Kind-Beziehungen und selektives Entfernen schreiben; den roten Lauf mit `npm test -- src/domain/relationship.test.ts` beobachten.
- [x] 3.2 Die fachlichen Operationen fuer Ehe- und Eltern-Kind-Beziehungen inklusive Richtung, Duplikatpruefung, Fehlerobjekten und atomarer Rueckgabe implementieren; verifizieren mit `npm test -- src/domain/relationship.test.ts`.

## 4. Quellen und Schlussfolgerungsstatus

- [x] 4.1 Zuerst fehlende Domain-Tests fuer die Statuswerte `explicit`/`inferred`, den Default `explicit`, optionale Quellen und die Ablehnung leerer bzw. ungueltiger HTTP-/HTTPS-URLs schreiben; den roten Lauf mit `npm test -- src/domain/evidence.test.ts` beobachten.
- [x] 4.2 Quellen- und Statusvalidierung in die Beziehungsoperationen und strukturierten Feldfehler integrieren; verifizieren mit `npm test -- src/domain/evidence.test.ts` und `npm test -- src/domain/relationship.test.ts`.

## 5. YAML-Dokument und Dateiprotokoll

- [x] 5.1 Zuerst fehlende Tests fuer YAML-Roundtrip, Schema-Version, stabile IDs, Positionen, Kantenrichtung, Quellen und atomare Ablehnung syntaktisch oder fachlich ungueltiger Dateien schreiben; den roten Lauf mit `npm test -- src/persistence/yaml.test.ts` beobachten.
- [x] 5.2 Den versionierten YAML-Parser/Serializer und die Laufzeitvalidierung implementieren, ohne externe URLs abzurufen; verifizieren mit `npm test -- src/persistence/yaml.test.ts`.
- [x] 5.3 Zuerst einen fehlenden Test fuer einen FilePort mit Lesen/Schreiben und einem Download-/Upload-kompatiblen Fallback schreiben und den roten Lauf mit `npm test -- src/persistence/file-port.test.ts` beobachten.
- [x] 5.4 Den gekapselten FilePort fuer direkte Dateisystem-API sowie Browser-Fallback implementieren; verifizieren mit `npm test -- src/persistence/file-port.test.ts`.

## 6. Graphprojektion und Arbeitsflaeche

- [x] 6.1 Zuerst fehlende Komponententests fuer Personenknoten, gespeicherte Positionen, Ehe-/Eltern-Kind-Richtung, sichtbare Statusstile, Auswahl und `fit view` schreiben und den roten Lauf mit `npm test -- src/graph/graph-projection.test.ts` beobachten.
- [x] 6.2 Die Domainprojektion auf Graphknoten und -kanten sowie die deterministische Anfangsanordnung ohne gespeicherte Positionen implementieren; verifizieren mit `npm test -- src/graph/graph-projection.test.ts`.
- [x] 6.3 Die Desktop-Arbeitsflaeche mit Werkzeugleiste, zentraler Graphflaeche und angedocktem Inspektor aufbauen und Pan/Zoom, Knotenverschieben sowie eindeutige Auswahl darstellen; verifizieren mit `npm run build` und einem sichtbaren Browser-Smoke-Test.

## 7. Personeninspektor und direkte Beziehungserstellung

- [x] 7.1 Zuerst fehlende Komponententests fuer Person anlegen, bearbeiten, verwerfen, optionale Jahre und sichtbare Feldfehler schreiben und den roten Lauf mit `npm test -- src/components/person-inspector.test.tsx` beobachten.
- [x] 7.2 Den Personeninspektor mit Formularzustand, Speichern/Verwerfen und Domainfehlern an den Dokumentzustand anschliessen; verifizieren mit `npm test -- src/components/person-inspector.test.tsx`.
- [x] 7.3 Zuerst Playwright-Szenarien fuer eine direkte Ehe- und Eltern-Kind-Verbindung, Abbruch, ungueltiges Ziel und Auswahl der neuen Kante schreiben und den roten Lauf mit `npm run test:e2e -- e2e/relationships.spec.ts` beobachten.
- [x] 7.4 Den Verbindungsmodus mit Beziehungstypauswahl, klarer Richtung fuer Eltern-Kind und atomarem Commit bzw. Abbruch implementieren; verifizieren mit `npm run test:e2e -- e2e/relationships.spec.ts`.
- [x] 7.5 Zuerst Playwright-Szenarien fuer Beziehungsinspektor, Statuswechsel, optionale Quelle, URL-Fehler, sichtbare Statusunterscheidung und selektives Entfernen schreiben und den roten Lauf mit `npm run test:e2e -- e2e/relationship-details.spec.ts` beobachten.
- [x] 7.6 Beziehungsinspektor und Darstellungsregeln fuer durchgaengige explizite bzw. gestrichelte geschlussfolgerte Kanten implementieren; verifizieren mit `npm run test:e2e -- e2e/relationship-details.spec.ts`.

## 8. Datei-Workflow und Schutz vor Datenverlust

- [x] 8.1 Zuerst Playwright-Szenarien fuer Export/Import eines vollstaendigen Stammbaums, ungueltigen Import ohne Teilueberschreiben, Dirty-Hinweis und Bestaetigung beim Ersetzen schreiben und den roten Lauf mit `npm run test:e2e -- e2e/file-workflow.spec.ts` beobachten.
- [x] 8.2 Import, Export, Dirty-Zustand und Bestaetigungsdialog an den FilePort anschliessen; nur vollstaendig validierte Dokumente ersetzen und verifizieren mit `npm run test:e2e -- e2e/file-workflow.spec.ts`.
- [x] 8.3 Den Upload-/Download-Fallback in einem Browser ohne direkte Dateisystem-API ausfuehrbar machen und den Pfad mit `npm run test:e2e -- e2e/file-fallback.spec.ts` verifizieren.

## 9. Responsive Darstellung und Integrationspruefung

- [x] 9.1 Zuerst einen Playwright-Test fuer Desktop- und schmale Viewport-Groessen schreiben, der sicherstellt, dass Werkzeugleiste, Graph und Inspektor erreichbar bleiben und Texte bzw. Statusanzeigen nicht ueberlappen; den roten Lauf mit `npm run test:e2e -- e2e/responsive-workbench.spec.ts` beobachten.
- [x] 9.2 Die responsive Arbeitsflaeche mit nicht ueberlappendem mobilem Inspektor, ausreichenden Interaktionsflaechen und stabilen Dimensionen fertigstellen; verifizieren mit `npm run test:e2e -- e2e/responsive-workbench.spec.ts`.
- [x] 9.3 Alle fokussierten Tests, die vollstaendige Vitest-Suite, Playwright-Suite und Produktionsbuild ausfuehren; verifizieren mit `npm test`, `npm run test:e2e` und `npm run build` und verbleibende Risiken dokumentieren.