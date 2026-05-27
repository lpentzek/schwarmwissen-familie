# Texte bearbeiten

Alle editierbaren UI-Texte liegen zentral in:

- `data/ui-texts.json`

## So funktioniert es

1. Jeder sichtbare Text im Markup hat ein Label (`data-text-label="..."`).
2. Texte in Attributen (z. B. `placeholder`, `aria-label`, `title`) haben ein Label (`data-text-attr-...="..."`).
3. `text-labels.js` laedt `data/ui-texts.json` und setzt die Inhalte automatisch.
4. Dynamische Texte aus `app.js` (z. B. `von`, `seit`, Altersformat) nutzen dieselben Label aus `data/ui-texts.json`.

## Hinweis zu Platzhaltern

Einige Werte enthalten Platzhalter:

- `tip_age_between`: `{min}`, `{max}`
- `tip_age_min`: `{min}`
- `tip_age_max`: `{max}`

Diese Platzhalter bitte nicht entfernen.
