# Schwarmwissen Familie

Eine kleine, werbefreie Sammlung praxiserprobter Empfehlungen aus dem eigenen Familien- und Freundeskreis.

Schwarmwissen Familie ist kein Testportal und keine Demo-App. Die Website liest ihre Inhalte produktiv aus einem Google Sheet und zeigt sie als ruhiges Register mit Suche und Kategorie-Filter.

## Idee

Wer heute nach Kinderbuechern, Medien oder Alltagshelfern sucht, landet schnell zwischen gehypten Erstausstattungslisten, SEO-Ratgebern und immergleichen Plattform-Empfehlungen. Die wirklich hilfreichen Hinweise liegen oft im eigenen Umfeld: bei Menschen, die Dinge selbst ausprobiert, verworfen, weiterempfohlen oder bewusst ausgelassen haben.

Schwarmwissen Familie sammelt genau dieses schmerzgepruefte Erfahrungswissen und macht es fuer den eigenen Kreis auffindbar.

## Marken-DNA

- Handverlesen und unabhaengig
- Medien-First: Kinderliteratur, Hoerspiele, Orte und Erlebnisse
- Pragmatisch statt ideologisch
- Persoenlich, vertraut und werbefrei

## Emotionaler Kern

> Wir teilen nicht die Theorie, wie es sein sollte, sondern die echten Abkuerzungen derer, die den Alltag bereits erfolgreich erprobt haben.

## Dokumentation

- [Konzept](docs/konzept.md)

## Produktiver Betrieb

Die einzige Datenquelle der Website ist `/api/tipps`. Die API liegt in `functions/api/tipps.js` und liest das konfigurierte Google Sheet ueber einen Google-Service-Account.

Erforderliche Environment Variables fuer Cloudflare Pages:

- `GOOGLE_SHEET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

Das Google Sheet muss fuer die Service-Account-Mailadresse freigegeben sein. Die Website enthaelt keinen lokalen CSV-Fallback mehr; wenn die API nicht erreichbar ist, zeigt das Frontend einen ehrlichen Fehlerzustand statt Beispieldaten.

Unterstuetzte Spaltennamen im Sheet:

- `titel`
- `kategorie`
- `alter_min`
- `alter_max`
- `medium`
- `ort`
- `quelle`
- `hinweise` oder `warum`
- `tags`
- `bewaehrt_seit`
- `url` oder `link`
