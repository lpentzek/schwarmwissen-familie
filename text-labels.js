const UI_TEXTS_URL = "data/ui-texts.json";

const DEFAULT_UI_TEXTS = {
  index_meta_title: "Kinder-Fundst\u00fccke",
  index_brand_aria_label: "Kinder-Fundst\u00fccke Startseite",
  index_brand_mark: "KF",
  index_brand_title: "Kinder-Fundst\u00fccke",
  index_brand_subtitle: "Empfehlungen aus unserem Kreis",
  index_header_nav_aria_label: "Hauptnavigation",
  index_submit_link: "Tipp einreichen",
  index_masthead_aria_label: "Einordnung",
  index_eyebrow: "Kinder-Fundst\u00fccke",
  index_heading: "Gute Dinge f\u00fcr kleine Leute, gesammelt von Menschen, denen wir vertrauen.",
  index_intro:
    "B\u00fccher, H\u00f6rspiele, Orte, Helferlein und Alltagsideen, die im echten Familienleben empfohlen wurden. Ohne Ranking, ohne Werbung, ohne Ratgeberton.",
  index_finder_aria_label: "Tipps filtern",
  index_search_label: "Suchen",
  index_search_placeholder: "Titel, Ort, Hinweis oder Quelle",
  index_category_label: "Kategorie",
  index_category_all: "Alle Kategorien",
  index_reset_button: "Zur\u00fccksetzen",
  index_category_rail_aria_label: "Kategorien",
  index_collection_aria_label: "Empfehlungen",
  index_section_kicker: "Sammlung",
  index_collection_heading: "Fundst\u00fccke",
  index_collection_intro: "Kurze Empfehlungen aus der gemeinsamen Liste.",
  index_empty_state: "Nichts gefunden. Vielleicht anders suchen oder die Kategorie wechseln.",
  index_empty_state_error:
    "Die gemeinsame Liste konnte gerade nicht geladen werden. Bitte sp\u00e4ter noch einmal \u00f6ffnen.",
  submit_meta_title: "Tipp einreichen - Kinder-Fundst\u00fccke",
  submit_iframe_title: "Kinder-Fundst\u00fccke",
  tip_fallback_category: "Sonstiges",
  tip_source_prefix: "von",
  tip_since_prefix: "seit",
  tip_age_between: "{min}-{max} Jahre",
  tip_age_min: "ab {min} Jahren",
  tip_age_max: "bis {max} Jahre",
};

const uiTextState = {
  values: { ...DEFAULT_UI_TEXTS },
};

function getUiText(label) {
  const value = uiTextState.values[label];
  return typeof value === "string" ? value : "";
}

function applyUiTextLabels() {
  document.querySelectorAll("[data-text-label]").forEach((element) => {
    const label = element.getAttribute("data-text-label");
    const value = getUiText(label);
    if (value) element.textContent = value;
  });

  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of element.attributes) {
      if (!attribute.name.startsWith("data-text-attr-")) continue;

      const targetAttribute = attribute.name.slice("data-text-attr-".length);
      const label = attribute.value;
      const value = getUiText(label);

      if (value) {
        element.setAttribute(targetAttribute, value);
      }
    }
  });
}

async function loadUiTexts() {
  try {
    const response = await fetch(UI_TEXTS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("ui-texts response not ok");

    const json = await response.json();
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      throw new Error("ui-texts invalid payload");
    }

    uiTextState.values = { ...DEFAULT_UI_TEXTS, ...json };
  } catch (error) {
    uiTextState.values = { ...DEFAULT_UI_TEXTS };
  }
}

async function initUiTexts() {
  await loadUiTexts();
  applyUiTextLabels();
  return uiTextState.values;
}

window.UI_TEXTS = {
  defaults: { ...DEFAULT_UI_TEXTS },
  get(label) {
    return getUiText(label);
  },
  getAll() {
    return { ...uiTextState.values };
  },
  ready: initUiTexts(),
};
