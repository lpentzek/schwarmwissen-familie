# LLM-Kontext: Schwarmwissen Familie

Diese Datei ist eine kurze Orientierung fuer LLMs, die an diesem Projekt mitarbeiten.

## Projektidee

Schwarmwissen Familie ist eine kleine, werbefreie Sammlung praxiserprobter Empfehlungen aus einem vertrauten Familien- und Freundeskreis. Die Plattform soll hilfreiche Hinweise aus dem echten Familienalltag auffindbar machen, ohne SEO-Rauschen, Sponsoring oder generische Ratgeberlogik.

Die App funktioniert als Anti-Mainstream-Filter: keine Werbe-Popups, kein Affiliate-Spam, kein Plattform-Hype, sondern eine schnelle und pragmatische Uebersicht echter Tipps.

## Zielgruppe

Eltern und Familien im eigenen Umfeld, die wenig Zeit haben und schnell gute Empfehlungen finden wollen, zum Beispiel zu Kinderbuechern, Hoerspielen, Medien, Helferlein, Anschaffungen, Orten, Erlebnissen oder Familienausfluegen.

## Ton und Haltung

- Unaufgeregt, persoenlich und vertrauensvoll.
- Pragmatisch statt belehrend.
- Kuratiert und unabhaengig, nicht werblich.
- Eher schmales Register als grosse Plattform.
- Keine Erziehungsphilosophie und keine Grundsatzdebatten.

## Aktueller technischer Stand

- Statische Frontend-Dateien liegen im Projektroot: `index.html`, `styles.css`, `app.js`.
- Die App zeigt Empfehlungen als lesbares Register mit Suche und Kategorie-Filter.
- Daten kommen produktiv ueber `/api/tipps`.
- Es gibt keinen lokalen CSV-Fallback mehr. Wenn die API nicht erreichbar ist, zeigt das Frontend einen ehrlichen Fehlerzustand statt Beispieldaten.
- Die API-Logik liegt in `functions/api/tipps.js`.
- Ziel-Hosting ist eine statische Website, z.B. ueber Cloudflare Pages.
- Die produktive Datenquelle ist ein Google Sheet, angebunden ueber eine API beziehungsweise Serverless Function.

## Wichtige Datenfelder

Die aktuelle Oberflaeche ist bewusst einfach, nutzt aber echte Kontextfelder aus dem Google Sheet:

- `titel`: Name des Tipps.
- `kategorie`: Primaeres Filter-Kriterium.
- `alter_min` und `alter_max`: Optionale Altersspanne.
- `medium`: Optionaler Typ, zum Beispiel Buch, Hoerspiel, Ausflug oder Hack.
- `ort`: Optionaler Ort.
- `quelle`: Optionaler Name der Person, von der der Tipp kommt.
- `hinweise`: Authentische Erfahrungen und Notizen aus dem Kreis. Wenn der Inhalt als Markdown-Stichpunktliste kommt, sollte er im Frontend als saubere `ul`/`li`-Liste dargestellt werden.
- `tags`: Optionale Suchbegriffe.
- `bewaehrt_seit`: Optionales Jahr oder kurzer Zeitraum.
- `url`: Optionaler externer Link. Wenn vorhanden, als klare Aktion anzeigen.

Alternative Spaltennamen werden in `app.js` und `functions/api/tipps.js` teilweise normalisiert, zum Beispiel `name`, `bemerkungen`, `warum` oder `link`.

## Kategorien

Die App sollte perspektivisch mit diesen Kernkategorien gut funktionieren:

- Kleine Helferlein
- Grosse Anschaffungen
- Medien & Entertainment
- Alltags-Hacks & Organisation
- Unterwegs & Reisen
- Orte & Erlebnisse

## Produktprinzipien

- Lieber wenige gute Funktionen als viele halbklare Features.
- Empfehlungen sollen schnell erfassbar und leicht filterbar sein.
- Das Projekt soll wie ein vertrautes Familienregister wirken, nicht wie ein Shop, Blog oder Social Network.
- Schreibweisen und UI-Texte sollten schlicht, warm und alltagstauglich bleiben.
- Mobile First: Eltern sollen die App auch nebenbei auf dem Smartphone gut nutzen koennen.
- Die Hinweise und Erfahrungen sind wichtiger als dekorative UI.
- Filter muessen reibungslos funktionieren, besonders nach Kategorie.
- Das DOM und die Frontend-Logik schlank halten.
