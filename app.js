const LOCAL_CSV_URL = "data/tipps.csv";
const API_URL = "/api/tipps";

const state = {
  tips: [],
  filters: {
    search: "",
    category: "",
  },
};

const els = {
  search: document.querySelector("#search"),
  category: document.querySelector("#category"),
  reset: document.querySelector("#resetFilters"),
  grid: document.querySelector("#tipsGrid"),
  empty: document.querySelector("#emptyState"),
  resultCount: document.querySelector("#resultCount"),
};

init();

async function init() {
  state.tips = await loadTips();

  populateSelect(els.category, unique(state.tips.map((tip) => tip.kategorie)));
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

  els.reset.addEventListener("click", () => {
    state.filters = { search: "", category: "" };
    els.search.value = "";
    els.category.value = "";
    render();
  });
}

function render() {
  const tips = filteredTips();
  els.grid.innerHTML = tips.map(renderTip).join("");
  els.empty.hidden = tips.length > 0;
  els.resultCount.textContent = `${tips.length} ${tips.length === 1 ? "Tipp" : "Tipps"}`;
}

function filteredTips() {
  return state.tips.filter((tip) => {
    const text = [
      tip.titel,
      tip.kategorie,
      tip.hinweise,
      tip.url,
    ].join(" ").toLowerCase();

    const matchesSearch = !state.filters.search || text.includes(state.filters.search);
    const matchesCategory = !state.filters.category || tip.kategorie === state.filters.category;

    return matchesSearch && matchesCategory;
  });
}

function renderTip(tip) {
  const link = tip.url
    ? `<a href="${escapeHtml(tip.url)}" target="_blank" rel="noreferrer">Link</a>`
    : "";

  return `
    <article class="register-item">
      <div class="record-main">
        <h3>${escapeHtml(tip.titel)}</h3>
        <p>${escapeHtml(tip.hinweise)}</p>
      </div>
      <div class="record-side">
        <span class="category-chip">${escapeHtml(tip.kategorie)}</span>
        ${link}
      </div>
    </article>
  `;
}

function normalizeTip(row) {
  return {
    titel: row.titel || row.name || row.titel_name || "",
    kategorie: row.kategorie || "Sonstiges",
    hinweise:
      row.hinweise ||
      row.bemerkungen ||
      row.hinweise_bemerkungen ||
      row.hinweise_und_bemerkungen ||
      row.warum ||
      "Noch keine Hinweise hinterlegt.",
    url: row.url || row.link || "",
  };
}

async function loadTips() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("API nicht erreichbar");
    const tips = await response.json();
    return tips.map(normalizeTip);
  } catch (error) {
    const csv = await fetch(LOCAL_CSV_URL).then((response) => response.text());
    return parseCsv(csv).map(normalizeTip);
  }
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

  const headers = rows.shift().map(normalizeDataKey);
  return rows
    .filter((cells) => cells.some((value) => value.trim()))
    .map((cells) =>
      Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()]))
    );
}

function normalizeDataKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("&", "und")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
