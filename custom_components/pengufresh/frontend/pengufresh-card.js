const PENGUFRESH_CARD_VERSION = "0.4.2";

const PF_LAYOUTS = {
  small: { columns: 6, rows: 1 },
  large: { columns: 6, rows: 2 },
};

const PF_I18N = {
  de: {
    cardName: "PenguFresh",
    cardDescription: "Klare Lüften-Ja/Nein-Empfehlung für eine PenguFresh-Instanz oder einen Raum.",
    instance: "PenguFresh-Instanz",
    status: "Anzuzeigender Bereich",
    layout: "Kartengröße",
    small: "Klein – 6 × 1",
    large: "Groß – 6 × 2",
    overall: "Gesamt",
    ventilate: "Lüften",
    keepClosed: "Nicht lüften",
    unavailable: "Nicht verfügbar",
    setup: "Wähle einen PenguFresh-Status aus.",
    cooling: "Abkühlen",
    dehumidifying: "Entfeuchten",
    both: "Abkühlen + Entfeuchten",
    blocked: "Feuchteschutz",
    noBenefit: "Kein Lüftungsvorteil",
  },
  en: {
    cardName: "PenguFresh",
    cardDescription: "Clear yes/no ventilation recommendation for a PenguFresh instance or room.",
    instance: "PenguFresh instance",
    status: "Area to display",
    layout: "Card size",
    small: "Small – 6 × 1",
    large: "Large – 6 × 2",
    overall: "Overall",
    ventilate: "Ventilate",
    keepClosed: "Keep closed",
    unavailable: "Unavailable",
    setup: "Select a PenguFresh status.",
    cooling: "Cooling",
    dehumidifying: "Dehumidifying",
    both: "Cooling + dehumidifying",
    blocked: "Moisture guard",
    noBenefit: "No ventilation benefit",
  },
};

function pfLanguage(hass) {
  const lang = hass?.locale?.language || hass?.language || "en";
  return String(lang).toLowerCase().startsWith("de") ? "de" : "en";
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isPenguFreshStatus(stateObj) {
  return Boolean(
    stateObj &&
      stateObj.entity_id?.startsWith("binary_sensor.") &&
      stateObj.attributes?.pengufresh_entry_id &&
      ["overall", "room"].includes(stateObj.attributes?.pengufresh_kind)
  );
}

function findPenguFreshInstances(hass) {
  const instances = new Map();
  Object.values(hass?.states || {}).forEach((stateObj) => {
    if (!isPenguFreshStatus(stateObj)) return;
    const entryId = String(stateObj.attributes.pengufresh_entry_id);
    if (!instances.has(entryId)) {
      instances.set(entryId, {
        id: entryId,
        name: stateObj.attributes.pengufresh_instance || "PenguFresh",
        statuses: [],
      });
    }
    instances.get(entryId).statuses.push({
      entity: stateObj.entity_id,
      kind: stateObj.attributes.pengufresh_kind,
      room: stateObj.attributes.pengufresh_room || null,
    });
  });

  return [...instances.values()].map((instance) => {
    instance.statuses.sort((a, b) => {
      if (a.kind === "overall" && b.kind !== "overall") return -1;
      if (b.kind === "overall" && a.kind !== "overall") return 1;
      return String(a.room || "").localeCompare(String(b.room || ""));
    });
    return instance;
  });
}

function normalizeLayout(config) {
  if (config?.layout === "small" || config?.layout === "large") return config.layout;
  return Number(config?.grid_options?.rows) === 1 ? "small" : "large";
}

function normalizeConfig(config = {}) {
  const layout = normalizeLayout(config);
  const grid = PF_LAYOUTS[layout];
  return {
    type: "custom:pengufresh-card",
    entity: config.entity,
    layout,
    grid_options: { columns: grid.columns, rows: grid.rows },
  };
}

function reasonInfo(stateObj, t) {
  const reasons = Array.isArray(stateObj?.attributes?.reasons) ? stateObj.attributes.reasons : [];
  const reasonCode = stateObj?.attributes?.reason_code || "";
  const icons = [];
  if (reasons.includes("cooling") || reasonCode === "cooling") icons.push({ icon: "mdi:thermometer-chevron-down", cls: "cool" });
  if (reasons.includes("dehumidifying") || reasonCode === "dehumidifying") icons.push({ icon: "mdi:water-percent", cls: "dry" });
  if (reasonCode === "cooling_and_dehumidifying") {
    if (!icons.some((x) => x.cls === "cool")) icons.push({ icon: "mdi:thermometer-chevron-down", cls: "cool" });
    if (!icons.some((x) => x.cls === "dry")) icons.push({ icon: "mdi:water-percent", cls: "dry" });
  }
  if (reasonCode === "blocked_by_moisture_guard") icons.push({ icon: "mdi:shield-water", cls: "blocked" });

  let label = t.noBenefit;
  if (reasonCode === "cooling") label = t.cooling;
  else if (reasonCode === "dehumidifying") label = t.dehumidifying;
  else if (reasonCode === "cooling_and_dehumidifying") label = t.both;
  else if (reasonCode === "blocked_by_moisture_guard") label = t.blocked;
  else if (stateObj?.attributes?.reason) label = stateObj.attributes.reason;
  return { icons, label };
}

class PenguFreshCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("pengufresh-card-editor");
  }

  static getStubConfig(hass) {
    const first = findPenguFreshInstances(hass)[0];
    const entity = first?.statuses?.[0]?.entity;
    return normalizeConfig({ entity, layout: "large" });
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = normalizeConfig();
    this._hass = null;
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return PF_LAYOUTS[this._config.layout].rows;
  }

  getGridOptions() {
    const grid = PF_LAYOUTS[this._config.layout];
    return {
      columns: grid.columns,
      rows: grid.rows,
      min_columns: 6,
      max_columns: 6,
      min_rows: grid.rows,
      max_rows: grid.rows,
    };
  }

  _moreInfo() {
    if (!this._config.entity) return;
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId: this._config.entity };
    this.dispatchEvent(event);
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const t = PF_I18N[pfLanguage(this._hass)];
    const stateObj = this._hass.states?.[this._config.entity];

    if (!stateObj) {
      this.shadowRoot.innerHTML = `<ha-card><div class="empty">${esc(t.setup)}</div></ha-card><style>${this._styles()}</style>`;
      return;
    }

    const available = !["unknown", "unavailable"].includes(stateObj.state);
    const active = available && stateObj.state === "on";
    const stateClass = !available ? "unavailable" : active ? "active" : "inactive";
    const statusText = !available ? t.unavailable : active ? t.ventilate : t.keepClosed;
    const windowIcon = active ? "mdi:window-open-variant" : "mdi:window-closed-variant";
    const reason = reasonInfo(stateObj, t);
    const reasonIcons = reason.icons.map((item) => `<ha-icon class="reason-icon ${item.cls}" icon="${item.icon}"></ha-icon>`).join("");

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card ${this._config.layout} ${stateClass}" tabindex="0" role="button" aria-label="${esc(statusText)}">
        <span class="status-dot" aria-hidden="true"></span>
        <div class="window-wrap">
          <ha-icon class="window-icon" icon="${windowIcon}"></ha-icon>
        </div>
        <div class="reason-icons">${reasonIcons}</div>
        <div class="copy">
          <strong>${esc(statusText)}</strong>
          <span class="reason">${esc(reason.label)}</span>
        </div>
      </ha-card>
      <style>${this._styles()}</style>`;

    this.shadowRoot.querySelector("ha-card")?.addEventListener("click", () => this._moreInfo());
    this.shadowRoot.querySelector("ha-card")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") this._moreInfo();
    });
  }

  _styles() {
    return `
      :host { display:block; height:100%; }
      ha-card.pf-card {
        position:relative;
        height:100%;
        box-sizing:border-box;
        overflow:hidden;
        cursor:pointer;
        display:grid;
        grid-template-columns:auto auto minmax(0,1fr);
        align-items:center;
        gap:14px;
        padding:14px 18px;
        border-radius:var(--ha-card-border-radius,18px);
        border:1px solid var(--divider-color);
        background:var(--ha-card-background,var(--card-background-color));
        transition:border-color .2s ease, background .2s ease, transform .15s ease;
      }
      ha-card.pf-card:active { transform:scale(.992); }
      ha-card.active {
        border-color:color-mix(in srgb,var(--success-color,#43a047) 55%,var(--divider-color));
        background:linear-gradient(135deg,color-mix(in srgb,var(--success-color,#43a047) 12%,var(--card-background-color)),var(--card-background-color) 65%);
      }
      ha-card.inactive {
        border-color:color-mix(in srgb,var(--error-color,#db4437) 45%,var(--divider-color));
        background:linear-gradient(135deg,color-mix(in srgb,var(--error-color,#db4437) 8%,var(--card-background-color)),var(--card-background-color) 65%);
      }
      .status-dot {
        position:absolute; top:12px; right:12px;
        width:10px; height:10px; border-radius:50%;
        background:var(--disabled-text-color);
        box-shadow:0 0 0 2px var(--card-background-color);
      }
      .active .status-dot { background:var(--success-color,#43a047); }
      .inactive .status-dot { background:var(--error-color,#db4437); }
      .window-wrap {
        width:64px; height:64px; border-radius:18px;
        display:grid; place-items:center;
        background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color));
      }
      .window-icon { --mdc-icon-size:42px; color:var(--secondary-text-color); }
      .active .window-icon { color:var(--success-color,#43a047); }
      .inactive .window-icon { color:var(--error-color,#db4437); }
      .reason-icons { display:flex; gap:7px; min-width:34px; justify-content:center; }
      .reason-icon { --mdc-icon-size:27px; }
      .reason-icon.cool { color:#ef6c00; }
      .reason-icon.dry { color:#039be5; }
      .reason-icon.blocked { color:#7e57c2; }
      .copy { min-width:0; display:grid; gap:3px; }
      .copy strong { font-size:20px; line-height:1.1; }
      .reason { font-size:12px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .small {
        grid-template-columns:auto auto;
        justify-content:center;
        gap:12px;
        padding:6px 16px;
      }
      .small .window-wrap { width:42px; height:42px; border-radius:12px; }
      .small .window-icon { --mdc-icon-size:29px; }
      .small .reason-icons { gap:4px; min-width:0; }
      .small .reason-icon { --mdc-icon-size:23px; }
      .small .copy { display:none; }
      .small .status-dot { width:8px; height:8px; top:8px; right:9px; }
      .empty { padding:16px; color:var(--secondary-text-color); }
    `;
  }
}

class PenguFreshCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = normalizeConfig();
    this._rendered = false;
    this._signature = "";
  }

  set hass(hass) {
    this._hass = hass;
    const signature = findPenguFreshInstances(hass)
      .map((item) => `${item.id}:${item.statuses.map((s) => s.entity).join(",")}`)
      .join("|");
    if (!this._rendered || signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
    if (this._hass) this._render();
  }

  _emit(config) {
    this._config = normalizeConfig(config);
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const t = PF_I18N[pfLanguage(this._hass)];
    const instances = findPenguFreshInstances(this._hass);
    let selectedInstance = instances.find((instance) => instance.statuses.some((status) => status.entity === this._config.entity)) || instances[0];
    if (!this._config.entity && selectedInstance?.statuses?.length) {
      this._config = normalizeConfig({ ...this._config, entity: selectedInstance.statuses[0].entity });
    }
    selectedInstance = instances.find((instance) => instance.statuses.some((status) => status.entity === this._config.entity)) || selectedInstance;

    const statusOptions = selectedInstance?.statuses || [];
    this.shadowRoot.innerHTML = `
      <div class="editor">
        <label><span>${esc(t.instance)}</span><select id="instance">
          ${instances.map((instance) => `<option value="${esc(instance.id)}" ${instance.id === selectedInstance?.id ? "selected" : ""}>${esc(instance.name)}</option>`).join("")}
        </select></label>
        <label><span>${esc(t.status)}</span><select id="status">
          ${statusOptions.map((status) => `<option value="${esc(status.entity)}" ${status.entity === this._config.entity ? "selected" : ""}>${esc(status.kind === "overall" ? t.overall : status.room || status.entity)}</option>`).join("")}
        </select></label>
        <label><span>${esc(t.layout)}</span><select id="layout">
          <option value="small" ${this._config.layout === "small" ? "selected" : ""}>${esc(t.small)}</option>
          <option value="large" ${this._config.layout === "large" ? "selected" : ""}>${esc(t.large)}</option>
        </select></label>
      </div>
      <style>
        :host{display:block}.editor{display:grid;gap:16px;padding:4px 0 16px}label{display:grid;gap:7px}label>span{font-size:12px;color:var(--secondary-text-color)}select{width:100%;box-sizing:border-box;min-height:48px;padding:0 14px;border:1px solid var(--divider-color);border-radius:10px;color:var(--primary-text-color);background:var(--card-background-color);font:inherit}
      </style>`;
    this._rendered = true;

    this.shadowRoot.getElementById("instance")?.addEventListener("change", (event) => {
      const instance = instances.find((item) => item.id === event.target.value);
      const entity = instance?.statuses?.[0]?.entity;
      this._emit({ ...this._config, entity });
    });
    this.shadowRoot.getElementById("status")?.addEventListener("change", (event) => {
      this._emit({ ...this._config, entity: event.target.value });
    });
    this.shadowRoot.getElementById("layout")?.addEventListener("change", (event) => {
      this._emit({ ...this._config, layout: event.target.value === "small" ? "small" : "large" });
    });
  }
}

customElements.define("pengufresh-card", PenguFreshCard);
customElements.define("pengufresh-card-editor", PenguFreshCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "pengufresh-card")) {
  window.customCards.push({
    type: "pengufresh-card",
    name: "PenguFresh",
    description: "Clear ventilation recommendation for a PenguFresh room.",
    preview: true,
    getEntitySuggestion: (hass, entityId) => {
      const obj = hass?.states?.[entityId];
      if (!isPenguFreshStatus(obj)) return null;
      return { config: normalizeConfig({ entity: entityId, layout: "large" }) };
    },
  });
}

console.info(`%c PenguFresh Card ${PENGUFRESH_CARD_VERSION} `, "color:#fff;background:#059669;font-weight:700;padding:2px 6px;border-radius:4px;");
