const PENGUFRESH_CARD_VERSION = "0.3.3";

const PF_LAYOUTS = {
  small: { columns: 6, rows: 1 },
  large: { columns: 6, rows: 2 },
};

const PF_I18N = {
  de: {
    cardName: "PenguFresh",
    cardDescription: "Kompakte Lüftungsanzeige für Wärme und Feuchtigkeit.",
    instance: "PenguFresh-Instanz",
    layout: "Kartengröße",
    small: "Klein – 6 × 1",
    large: "Groß – 6 × 2",
    heat: "Lüften Wärme",
    humidity: "Lüften Feuchtigkeit",
    ventilate: "Lüften",
    keepClosed: "Nicht lüften",
    unavailable: "Nicht verfügbar",
    noInstance: "Keine PenguFresh-Instanz gefunden",
    setup: "Wähle eine PenguFresh-Instanz aus.",
    hint: "Klein und Groß zeigen nur die beiden Statussymbole. Groß nutzt lediglich mehr Platz und größere Darstellung.",
  },
  en: {
    cardName: "PenguFresh",
    cardDescription: "Compact ventilation status for heat and humidity.",
    instance: "PenguFresh instance",
    layout: "Card size",
    small: "Small – 6 × 1",
    large: "Large – 6 × 2",
    heat: "Ventilate for heat",
    humidity: "Ventilate for humidity",
    ventilate: "Ventilate",
    keepClosed: "Keep closed",
    unavailable: "Unavailable",
    noInstance: "No PenguFresh instance found",
    setup: "Select a PenguFresh instance.",
    hint: "Small and large both show only the two status symbols. Large simply uses more space and larger visuals.",
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

function isHumidityEntity(stateObj) {
  return Boolean(
    stateObj &&
      stateObj.entity_id?.startsWith("binary_sensor.") &&
      stateObj.attributes?.pengufresh_entry_id &&
      Object.prototype.hasOwnProperty.call(stateObj.attributes, "relative_humidity_threshold")
  );
}

function isHeatEntity(stateObj) {
  return Boolean(
    stateObj &&
      stateObj.entity_id?.startsWith("binary_sensor.") &&
      stateObj.attributes?.pengufresh_entry_id &&
      Object.prototype.hasOwnProperty.call(stateObj.attributes, "target_temperature")
  );
}

function findPenguFreshInstances(hass) {
  const instances = new Map();

  Object.values(hass?.states || {}).forEach((stateObj) => {
    const entryId = stateObj.attributes?.pengufresh_entry_id;
    if (!entryId) return;

    if (!instances.has(entryId)) {
      instances.set(entryId, {
        id: entryId,
        name: stateObj.attributes?.pengufresh_instance || "PenguFresh",
        humidity: null,
        heat: null,
      });
    }

    const instance = instances.get(entryId);
    if (isHumidityEntity(stateObj)) instance.humidity = stateObj.entity_id;
    if (isHeatEntity(stateObj)) instance.heat = stateObj.entity_id;
  });

  return [...instances.values()].filter((item) => item.humidity || item.heat);
}

function pairForEntity(hass, entityId) {
  const selected = hass?.states?.[entityId];
  const entryId = selected?.attributes?.pengufresh_entry_id;
  if (!entryId) return null;
  return findPenguFreshInstances(hass).find((item) => item.id === entryId) || null;
}

function normalizeLayout(config) {
  if (config?.layout === "small" || config?.layout === "large") return config.layout;
  const rows = Number(config?.grid_options?.rows);
  return rows === 1 ? "small" : "large";
}

function normalizeConfig(config = {}) {
  const layout = normalizeLayout(config);
  const grid = PF_LAYOUTS[layout];
  return {
    type: "custom:pengufresh-card",
    humidity_entity: config.humidity_entity,
    heat_entity: config.heat_entity || config.cooling_entity,
    layout,
    grid_options: { columns: grid.columns, rows: grid.rows },
  };
}

class PenguFreshCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("pengufresh-card-editor");
  }

  static getStubConfig(hass) {
    const first = findPenguFreshInstances(hass)[0];
    const config = {
      type: "custom:pengufresh-card",
      layout: "large",
      grid_options: { columns: 6, rows: 2 },
    };
    if (!first) return config;
    return {
      ...config,
      humidity_entity: first.humidity,
      heat_entity: first.heat,
    };
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

  _moreInfo(entityId) {
    if (!entityId) return;
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _state(entityId) {
    const obj = entityId ? this._hass?.states?.[entityId] : null;
    if (!obj || ["unknown", "unavailable"].includes(obj.state)) {
      return { obj, available: false, active: false };
    }
    return { obj, available: true, active: obj.state === "on" };
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;

    const t = PF_I18N[pfLanguage(this._hass)];
    const heat = this._state(this._config.heat_entity);
    const humidity = this._state(this._config.humidity_entity);
    const layout = this._config.layout;

    if (!this._config.heat_entity && !this._config.humidity_entity) {
      this.shadowRoot.innerHTML = `
        <ha-card><div class="empty">${esc(t.setup)}</div></ha-card>
        <style>${this._styles()}</style>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card ${layout}">
        <div class="statuses">
          ${this._tile({
            kind: "heat",
            entityId: this._config.heat_entity,
            label: t.heat,
            icon: "mdi:thermometer-chevron-down",
            data: heat,
            t,
          })}
          ${this._tile({
            kind: "humidity",
            entityId: this._config.humidity_entity,
            label: t.humidity,
            icon: "mdi:water-percent",
            data: humidity,
            t,
          })}
        </div>
      </ha-card>
      <style>${this._styles()}</style>`;

    this.shadowRoot.querySelectorAll("button[data-entity]").forEach((button) => {
      button.addEventListener("click", () => this._moreInfo(button.dataset.entity));
    });
  }

  _tile({ kind, entityId, label, icon, data, t }) {
    const stateClass = !data.available ? "unavailable" : data.active ? "active" : "inactive";
    const stateText = !data.available ? t.unavailable : data.active ? t.ventilate : t.keepClosed;
    const windowIcon = data.active ? "mdi:window-open-variant" : "mdi:window-closed-variant";

    return `
      <button
        class="status ${kind} ${stateClass}"
        ${entityId ? `data-entity="${esc(entityId)}"` : "disabled"}
        title="${esc(label)}: ${esc(stateText)}"
        aria-label="${esc(label)}: ${esc(stateText)}"
      >
        <span class="dot" aria-hidden="true"></span>
        <div class="icon-stack">
          <ha-icon class="category-icon" icon="${icon}"></ha-icon>
          <div class="window-badge">
            <ha-icon class="window-icon" icon="${windowIcon}"></ha-icon>
          </div>
        </div>
      </button>`;
  }

  _styles() {
    return `
      :host {
        display: block;
        height: 100%;
      }

      ha-card.pf-card {
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, 18px);
        background: linear-gradient(180deg, color-mix(in srgb, var(--card-background-color) 96%, white 4%), var(--card-background-color));
        box-shadow: 0 8px 24px rgba(0,0,0,.08);
      }

      .statuses {
        height: 100%;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 8px;
      }

      .status {
        position: relative;
        appearance: none;
        border: 1px solid color-mix(in srgb, var(--divider-color) 88%, transparent);
        border-radius: 18px;
        background: linear-gradient(180deg, color-mix(in srgb, var(--card-background-color) 97%, white 3%), color-mix(in srgb, var(--card-background-color) 93%, var(--primary-text-color) 7%));
        color: var(--primary-text-color);
        min-width: 0;
        height: 100%;
        box-sizing: border-box;
        font: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 2px 8px rgba(0,0,0,.06);
        transition: background .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease;
      }

      .status:hover:not(:disabled) {
        box-shadow: inset 0 1px 0 rgba(255,255,255,.42), 0 6px 14px rgba(0,0,0,.08);
      }

      .status:active:not(:disabled) { transform: scale(.985); }
      .status:disabled { cursor: default; opacity: .62; }

      .status.heat.active {
        background: linear-gradient(180deg, color-mix(in srgb, #7dd3fc 24%, var(--card-background-color)), color-mix(in srgb, #0ea5e9 16%, var(--card-background-color)));
        border-color: color-mix(in srgb, #0ea5e9 55%, var(--divider-color));
      }

      .status.humidity.active {
        background: linear-gradient(180deg, color-mix(in srgb, #86efac 24%, var(--card-background-color)), color-mix(in srgb, #10b981 16%, var(--card-background-color)));
        border-color: color-mix(in srgb, #10b981 55%, var(--divider-color));
      }

      .status.inactive {
        background: linear-gradient(180deg, color-mix(in srgb, #fee2e2 28%, var(--card-background-color)), color-mix(in srgb, #fca5a5 12%, var(--card-background-color)));
        border-color: color-mix(in srgb, var(--error-color, #db4437) 42%, var(--divider-color));
      }

      .status.unavailable {
        background: linear-gradient(180deg, color-mix(in srgb, var(--card-background-color) 95%, white 5%), color-mix(in srgb, var(--card-background-color) 92%, var(--disabled-text-color) 8%));
      }

      .icon-stack {
        position: relative;
        width: 56px;
        height: 56px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.35));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.75), 0 3px 10px rgba(0,0,0,.08);
      }

      .status.heat .icon-stack {
        background: linear-gradient(180deg, color-mix(in srgb, #ffedd5 90%, white 10%), color-mix(in srgb, #fed7aa 78%, transparent));
      }

      .status.humidity .icon-stack {
        background: linear-gradient(180deg, color-mix(in srgb, #dbeafe 90%, white 10%), color-mix(in srgb, #bfdbfe 78%, transparent));
      }

      .category-icon {
        --mdc-icon-size: 31px;
      }

      .heat .category-icon { color: #ef6c00; }
      .humidity .category-icon { color: #039be5; }

      .window-badge {
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(245,245,245,.9));
        box-shadow: 0 2px 7px rgba(0,0,0,.18);
        border: 1px solid rgba(0,0,0,.06);
      }

      .window-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }

      .active .window-icon { color: var(--success-color, #43a047); }
      .inactive .window-icon { color: var(--error-color, #db4437); }
      .unavailable .window-icon { color: var(--disabled-text-color); }

      .dot {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--error-color, #db4437);
        box-shadow: 0 0 0 2px var(--card-background-color), 0 0 10px rgba(219,68,55,.18);
      }

      .active .dot { background: var(--success-color, #43a047); box-shadow: 0 0 0 2px var(--card-background-color), 0 0 10px rgba(67,160,71,.28); }
      .inactive .dot { background: var(--error-color, #db4437); }
      .unavailable .dot { background: var(--disabled-text-color); box-shadow: 0 0 0 2px var(--card-background-color); }

      .copy { display: none; }

      /* Small 6 × 1: icon-focused, centered and symmetrical. */
      .small .statuses {
        gap: 5px;
        padding: 5px 7px;
      }

      .small .status {
        border-radius: 13px;
        padding: 4px 7px;
        overflow: hidden;
      }

      .small .icon-stack {
        width: 36px;
        height: 36px;
        border-radius: 11px;
      }

      .small .category-icon { --mdc-icon-size: 22px; }
      .small .window-badge {
        width: 18px;
        height: 18px;
        right: -2px;
        bottom: -2px;
        border-radius: 7px;
      }
      .small .window-icon { --mdc-icon-size: 13px; }
      .small .dot { top: 7px; right: 7px; width: 7px; height: 7px; }

      /* Large 6 × 2: same concept, more breathing room and larger symbols. */
      .large .statuses {
        padding: 10px;
        gap: 10px;
      }

      .large .status {
        border-radius: 19px;
        padding: 12px;
      }

      .large .icon-stack {
        width: 64px;
        height: 64px;
        border-radius: 18px;
      }

      .large .category-icon { --mdc-icon-size: 35px; }
      .large .window-badge { width: 28px; height: 28px; right: -6px; bottom: -6px; border-radius: 10px; }
      .large .window-icon { --mdc-icon-size: 19px; }
      .large .dot { top: 10px; right: 10px; width: 10px; height: 10px; }

      @media (max-width: 360px) {
        .large .statuses { padding: 8px; gap: 8px; }
        .large .status { padding: 9px; }
        .large .icon-stack { width: 56px; height: 56px; }
        .large .category-icon { --mdc-icon-size: 31px; }
      }

      .empty {
        padding: 16px;
        color: var(--secondary-text-color);
      }

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
    this._instanceSignature = "";
  }

  set hass(hass) {
    this._hass = hass;
    const signature = findPenguFreshInstances(hass)
      .map((item) => `${item.id}:${item.humidity || ""}:${item.heat || ""}`)
      .join("|");

    if (!this._rendered || signature !== this._instanceSignature) {
      this._instanceSignature = signature;
      this._render();
    }
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
    if (this._hass) this._render();
  }

  _emitConfig(config) {
    this._config = normalizeConfig(config);
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _selectedInstance(instances) {
    return (
      instances.find(
        (item) =>
          item.humidity === this._config.humidity_entity ||
          item.heat === this._config.heat_entity
      ) || instances[0] || null
    );
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;

    const t = PF_I18N[pfLanguage(this._hass)];
    const instances = findPenguFreshInstances(this._hass);
    const selected = this._selectedInstance(instances);

    if (selected && !this._config.humidity_entity && !this._config.heat_entity) {
      this._config = normalizeConfig({
        ...this._config,
        humidity_entity: selected.humidity,
        heat_entity: selected.heat,
      });
    }

    this.shadowRoot.innerHTML = `
      <div class="editor">
        <label>
          <span>${esc(t.instance)}</span>
          <select id="instance" ${instances.length ? "" : "disabled"}>
            ${instances.length
              ? instances
                  .map(
                    (item) =>
                      `<option value="${esc(item.id)}" ${selected?.id === item.id ? "selected" : ""}>${esc(item.name)}</option>`
                  )
                  .join("")
              : `<option>${esc(t.noInstance)}</option>`}
          </select>
        </label>

        <label>
          <span>${esc(t.layout)}</span>
          <select id="layout">
            <option value="small" ${this._config.layout === "small" ? "selected" : ""}>${esc(t.small)}</option>
            <option value="large" ${this._config.layout === "large" ? "selected" : ""}>${esc(t.large)}</option>
          </select>
        </label>

        <p>${esc(t.hint)}</p>
      </div>
      <style>
        :host { display:block; }
        .editor { display:grid; gap:16px; padding:4px 0 16px; }
        label { display:grid; gap:7px; }
        label>span { font-size:12px; color:var(--secondary-text-color); }
        select {
          width:100%;
          box-sizing:border-box;
          min-height:48px;
          padding:0 14px;
          border:1px solid var(--divider-color);
          border-radius:10px;
          color:var(--primary-text-color);
          background:var(--card-background-color);
          font:inherit;
        }
        p { margin:0; font-size:12px; line-height:1.45; color:var(--secondary-text-color); }
      </style>`;

    this._rendered = true;

    this.shadowRoot.getElementById("instance")?.addEventListener("change", (event) => {
      const instance = instances.find((item) => item.id === event.target.value);
      if (!instance) return;
      this._emitConfig({
        ...this._config,
        humidity_entity: instance.humidity,
        heat_entity: instance.heat,
      });
    });

    this.shadowRoot.getElementById("layout")?.addEventListener("change", (event) => {
      const layout = event.target.value === "small" ? "small" : "large";
      this._emitConfig({ ...this._config, layout });
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
    description: "Compact ventilation status for heat and humidity.",
    preview: true,
    getEntitySuggestion: (hass, entityId) => {
      const pair = pairForEntity(hass, entityId);
      if (!pair) return null;
      return {
        config: {
          type: "custom:pengufresh-card",
          humidity_entity: pair.humidity,
          heat_entity: pair.heat,
          layout: "large",
          grid_options: { columns: 6, rows: 2 },
        },
      };
    },
  });
}

console.info(`%c PenguFresh Card ${PENGUFRESH_CARD_VERSION} `, "color:#fff;background:#059669;font-weight:700;padding:2px 6px;border-radius:4px;");
