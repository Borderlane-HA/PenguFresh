const PENGUFRESH_CARD_VERSION = "0.3.0";

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
    hint: "Klein zeigt nur die beiden Statussymbole. Groß ergänzt kurze Texte.",
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
    hint: "Small shows only the two status symbols. Large adds short text labels.",
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
      <button class="status ${kind} ${stateClass}" ${entityId ? `data-entity="${esc(entityId)}"` : "disabled"}>
        <div class="icon-stack">
          <ha-icon class="category-icon" icon="${icon}"></ha-icon>
          <ha-icon class="window-icon" icon="${windowIcon}"></ha-icon>
        </div>
        <div class="copy">
          <strong>${esc(label)}</strong>
          <span>${esc(stateText)}</span>
        </div>
        <span class="dot" aria-hidden="true"></span>
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
        border-radius: var(--ha-card-border-radius, 16px);
        background: var(--ha-card-background, var(--card-background-color));
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
        appearance: none;
        border: 1px solid var(--divider-color);
        border-radius: 13px;
        background: color-mix(in srgb, var(--card-background-color) 94%, var(--primary-text-color) 6%);
        color: var(--primary-text-color);
        min-width: 0;
        height: 100%;
        box-sizing: border-box;
        font: inherit;
        text-align: left;
        cursor: pointer;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        transition: background .2s ease, border-color .2s ease, transform .15s ease;
      }

      .status:active:not(:disabled) { transform: scale(.985); }
      .status:disabled { cursor: default; opacity: .62; }

      .status.heat.active {
        background: color-mix(in srgb, #0284c7 18%, var(--card-background-color));
        border-color: color-mix(in srgb, #0284c7 55%, var(--divider-color));
      }

      .status.humidity.active {
        background: color-mix(in srgb, #059669 18%, var(--card-background-color));
        border-color: color-mix(in srgb, #059669 55%, var(--divider-color));
      }

      .icon-stack {
        position: relative;
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
      }

      .category-icon {
        --mdc-icon-size: 27px;
      }

      .heat .category-icon { color: #ef6c00; }
      .humidity .category-icon { color: #039be5; }

      .window-icon {
        position: absolute;
        right: -5px;
        bottom: -5px;
        --mdc-icon-size: 18px;
        padding: 3px;
        border-radius: 7px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        box-shadow: 0 1px 4px rgba(0,0,0,.16);
      }

      .active .window-icon {
        color: var(--success-color, #43a047);
      }

      .copy {
        min-width: 0;
        display: grid;
        gap: 3px;
      }

      .copy strong {
        font-size: 13px;
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .copy span {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--disabled-text-color);
      }

      .active .dot { background: var(--success-color, #43a047); }
      .unavailable .dot { background: var(--error-color, #db4437); }

      /* Small 6 × 1: icon-first, no explanatory text. */
      .small .statuses {
        gap: 6px;
        padding: 5px;
      }

      .small .status {
        grid-template-columns: 1fr;
        place-items: center;
        padding: 4px;
        border-radius: 10px;
      }

      .small .icon-stack {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }

      .small .category-icon { --mdc-icon-size: 25px; }
      .small .window-icon { --mdc-icon-size: 16px; }
      .small .copy,
      .small .dot { display: none; }

      /* Large 6 × 2: image/icon plus one short status line. */
      .large .statuses {
        padding: 9px;
        gap: 9px;
      }

      .large .status {
        min-height: 0;
      }

      .empty {
        padding: 16px;
        color: var(--secondary-text-color);
      }

      @media (max-width: 360px) {
        .large .status { gap: 7px; padding: 8px; }
        .large .icon-stack { width: 36px; height: 36px; }
        .large .copy strong { font-size: 12px; }
        .large .copy span { font-size: 11px; }
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
