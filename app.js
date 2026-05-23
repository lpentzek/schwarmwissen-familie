const GOOGLE_SHEET_CSV_URL = "";
const LOCAL_CSV_URL = "data/tipps.csv";

const state = {
  tips: [],
  filters: {
    search: "",
    category: "",
    age: "",
    medium: "",
  },
};

const els = {
  search: document.querySelector("#search"),
  category: document.querySelector("#category"),
  age: document.querySelector("#age"),
  medium: document.querySelector("#medium"),
  reset: document.querySelector("#resetFilters"),
  grid: document.querySelector("#tipsGrid"),
  empty: document.querySelector("#emptyState"),
  resultCount: document.querySelector("#resultCount"),
  categoryCount: document.querySelector("#categoryCount"),
  sourceCount: document.querySelector("#sourceCount"),
  mediaCount: document.querySelector("#mediaCount"),
};

init();

async function init() {
  const csvUrl = GOOGLE_SHEET_CSV_URL || LOCAL_CSV_URL;
  const csv = await fetch(csvUrl).then((response) => response.text());
  state.tips = parseCsv(csv).map(normalizeTip);

  populateSelect(els.category, unique(state.tips.map((tip) => tip.kategorie)));
  populateSelect(els.medium, unique(state.tips.map((tip) => tip.medium)));
  bindEvents();
  render();
}

function bindEvents() {
  els.search.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  els.category.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    render();
  });

  els.age.addEventListener("change", (event) => {
    state.filters.age = event.target.value;
    render();
  });

  els.medium.addEventListener("change", (event) => {
    state.filters.medium = event.target.value;
    render();
  });

  els.reset.addEventListener("click", () => {
    state.filters = { search: "", category: "", age: "", medium: "" };
    els.search.value = "";
    els.category.value = "";
    els.age.value = "";
    els.medium.value = "";
    render();
  });
}

function render() {
  const tips = filteredTips();
  els.grid.innerHTML = tips.map(renderTip).join("");
  els.empty.hidden = tips.length > 0;
  els.resultCount.textContent = `${tips.length} ${tips.length === 1 ? "Tipp" : "Tipps"}`;

  els.categoryCount.textContent = unique(state.tips.map((tip) => tip.kategorie)).length;
  els.sourceCount.textContent = unique(state.tips.map((tip) => tip.quelle)).length;
  els.mediaCount.textContent = state.tips.filter((tip) =>
    ["Kinderbuch", "Hoerspiel", "Musik", "Film"].includes(tip.medium)
  ).length;
}

function filteredTips() {
  return state.tips.filter((tip) => {
    const text = [
      tip.titel,
      tip.kategorie,
      tip.medium,
      tip.ort,
      tip.quelle,
      tip.warum,
      tip.tags,
    ].join(" ").toLowerCase();

    const matchesSearch = !state.filters.search || text.includes(state.filters.search);
    const matchesCategory = !state.filters.category || tip.kategorie === state.filters.category;
    const matchesMedium = !state.filters.medium || tip.medium === state.filters.medium;
    const matchesAge = !state.filters.age || ageMatches(tip, Number(state.filters.age));

    return matchesSearch && matchesCategory && matchesMedium && matchesAge;
  });
}

function ageMatches(tip, ageStart) {
  const ageEnd = ageStart === 9 ? 18 : ageStart + 2;
  return tip.alterMin <= ageEnd && tip.alterMax >= ageStart;
}

function renderTip(tip, index) {
  const color = ["green", "blue", "yellow", "red"][index % 4];
  const ageLabel = `${tip.alterMin}-${tip.alterMax} Jahre`;
  const tags = tip.tags
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
  const link = tip.link
    ? `<a href="${escapeHtml(tip.link)}" target="_blank" rel="noreferrer">Link</a>`
    : "<span></span>";

  return `
    <article class="tip-card" data-color="${color}">
      <div class="tip-head">
        <h3>${escapeHtml(tip.titel)}</h3>
        <span class="badge">${escapeHtml(tip.kategorie)}</span>
      </div>
      <p>${escapeHtml(tip.warum)}</p>
      <div class="meta-list">
        <span>${escapeHtml(tip.medium)}</span>
        <span>${ageLabel}</span>
        <span>${escapeHtml(tip.ort || "ueberall")}</span>
        ${tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="source-line">
        <span>Empfohlen von ${escapeHtml(tip.quelle)}</span>
        ${link}
      </div>
    </article>
  `;
}

function normalizeTip(row) {
  return {
    titel: row.titel || "",
    kategorie: row.kategorie || "Sonstiges",
    alterMin: Number(row.alter_min || 0),
    alterMax: Number(row.alter_max || 18),
    medium: row.medium || "Tipp",
    ort: row.ort || "",
    quelle: row.quelle || "Unbekannt",
    warum: row.warum || "",
    tags: row.tags || "",
    bewaehrtSeit: row.bewaehrt_seit || "",
    link: row.link || "",
  };
}

function populateSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const headers = rows.shift().map((header) => header.trim());
  return rows
    .filter((cells) => cells.some((value) => value.trim()))
    .map((cells) =>
      Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()]))
    );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

