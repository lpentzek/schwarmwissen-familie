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
  bindEvents();

  try {
    state.tips = await loadTips();
    populateSelect(els.category, unique(state.tips.map((tip) => tip.kategorie)));
    render();
  } catch (error) {
    renderLoadError();
  }
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
      tip.medium,
      tip.ort,
      tip.quelle,
      tip.tags,
      tip.url,
    ].join(" ").toLowerCase();

    const matchesSearch = !state.filters.search || text.includes(state.filters.search);
    const matchesCategory = !state.filters.category || tip.kategorie === state.filters.category;

    return matchesSearch && matchesCategory;
  });
}

function renderTip(tip) {
  const link = tip.url
    ? `<a href="${escapeHtml(tip.url)}" target="_blank" rel="noreferrer">ansehen</a>`
    : "";
  const meta = renderMeta([
    formatAge(tip.alterMin, tip.alterMax),
    tip.medium,
    tip.ort,
    tip.quelle ? `von ${tip.quelle}` : "",
    tip.bewaehrtSeit ? `seit ${tip.bewaehrtSeit}` : "",
  ]);

  return `
    <article class="register-item">
      <div class="record-main">
        <h3>${escapeHtml(tip.titel)}</h3>
        <p>${escapeHtml(tip.hinweise)}</p>
        ${meta}
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
    alterMin: row.alter_min || row.alter_von || row.ab_alter || "",
    alterMax: row.alter_max || row.alter_bis || "",
    medium: row.medium || row.typ || "",
    ort: row.ort || "",
    quelle: row.quelle || row.empfohlen_von || "",
    hinweise:
      row.hinweise ||
      row.bemerkungen ||
      row.hinweise_bemerkungen ||
      row.hinweise_und_bemerkungen ||
      row.warum ||
      "Noch keine Hinweise hinterlegt.",
    tags: row.tags || "",
    bewaehrtSeit: row.bewaehrt_seit || row.bewahrt_seit || row.seit || "",
    url: row.url || row.link || "",
  };
}

function renderMeta(values) {
  const items = values.filter(Boolean);
  if (!items.length) return "";

  return `
    <div class="record-meta">
      ${items.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}
    </div>
  `;
}

function formatAge(min, max) {
  if (min && max) return `${min}-${max} Jahre`;
  if (min) return `ab ${min} Jahren`;
  if (max) return `bis ${max} Jahre`;
  return "";
}

async function loadTips() {
  const response = await fetch(API_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("API nicht erreichbar");

  const tips = await response.json();
  if (!Array.isArray(tips)) throw new Error("Unerwartete API-Antwort");

  return tips.map(normalizeTip);
}

function renderLoadError() {
  els.grid.innerHTML = "";
  els.empty.hidden = false;
  els.empty.textContent =
    "Die gemeinsame Liste konnte gerade nicht geladen werden. Bitte später noch einmal öffnen.";
  els.resultCount.textContent = "0 Tipps";
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
