const PENGUFRESH_CARD_VERSION = "0.2.2";

const PF_I18N = {
  de: {
    openBoth: "Jetzt lüften – kühlen & entfeuchten",
    openHumidity: "Fenster öffnen – Feuchtigkeit abführen",
    openCooling: "Fenster öffnen – zum Abkühlen",
    keepClosed: "Fenster schließen / geschlossen lassen",
    unavailable: "PenguFresh-Daten nicht verfügbar",
    outdoor: "Draußen",
    dewPoint: "Taupunkt",
    humidity: "Feuchtigkeit",
    cooling: "Abkühlen",
    ventilate: "Lüften",
    noNeed: "Kein Lüftungsbedarf",
    rooms: "Empfohlene Räume",
    coolOutside: "kühl draußen",
    warmOutside: "warm draußen",
    humidOutside: "feucht draußen",
    dryOutside: "trockener draußen",
    cardTitle: "PenguFresh",
    editorTitle: "PenguFresh-Instanz",
    noInstance: "Keine PenguFresh-Instanz gefunden",
    customTitle: "Kartentitel (optional)",
    setup: "Wähle im Karteneditor eine PenguFresh-Instanz aus.",
    on: "empfohlen",
    off: "nicht nötig",
  },
  en: {
    openBoth: "Ventilate now – cool & dehumidify",
    openHumidity: "Open windows – remove moisture",
    openCooling: "Open windows – cool the room",
    keepClosed: "Close / keep windows closed",
    unavailable: "PenguFresh data unavailable",
    outdoor: "Outside",
    dewPoint: "Dew point",
    humidity: "Humidity",
    cooling: "Cooling",
    ventilate: "Ventilate",
    noNeed: "No ventilation needed",
    rooms: "Recommended rooms",
    coolOutside: "cool outside",
    warmOutside: "warm outside",
    humidOutside: "humid outside",
    dryOutside: "drier outside",
    cardTitle: "PenguFresh",
    editorTitle: "PenguFresh instance",
    noInstance: "No PenguFresh instance found",
    customTitle: "Card title (optional)",
    setup: "Select a PenguFresh instance in the card editor.",
    on: "recommended",
    off: "not needed",
  },
};

function pfLanguage(hass) {
  const lang = hass?.locale?.language || hass?.language || "en";
  return String(lang).toLowerCase().startsWith("de") ? "de" : "en";
}

function isPenguFreshHumidity(stateObj) {
  return Boolean(
    stateObj &&
      stateObj.entity_id?.startsWith("binary_sensor.") &&
      stateObj.attributes?.pengufresh_entry_id &&
      Object.prototype.hasOwnProperty.call(stateObj.attributes, "relative_humidity_threshold")
  );
}

function isPenguFreshCooling(stateObj) {
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
        cooling: null,
      });
    }
    const instance = instances.get(entryId);
    if (isPenguFreshHumidity(stateObj)) instance.humidity = stateObj.entity_id;
    if (isPenguFreshCooling(stateObj)) instance.cooling = stateObj.entity_id;
  });
  return [...instances.values()].filter((item) => item.humidity || item.cooling);
}

function pairForEntity(hass, entityId) {
  const selected = hass?.states?.[entityId];
  const entryId = selected?.attributes?.pengufresh_entry_id;
  if (!entryId) return null;
  return findPenguFreshInstances(hass).find((item) => item.id === entryId) || null;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

class PenguFreshCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("pengufresh-card-editor");
  }

  static getStubConfig(hass) {
    const first = findPenguFreshInstances(hass)[0];
    if (!first) {
      return { type: "custom:pengufresh-card" };
    }
    // Home Assistant normally adds the selected custom card type itself, but
    // keeping it in the stub as well makes the card robust across frontend
    // versions and prevents the YAML editor from receiving a typeless config.
    return {
      type: "custom:pengufresh-card",
      humidity_entity: first.humidity,
      cooling_entity: first.cooling,
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = { type: "custom:pengufresh-card", ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 5;
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;

    const t = PF_I18N[pfLanguage(this._hass)];
    const hum = this._config.humidity_entity
      ? this._hass.states[this._config.humidity_entity]
      : null;
    const cool = this._config.cooling_entity
      ? this._hass.states[this._config.cooling_entity]
      : null;

    if (!hum && !cool) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="empty"><strong>${t.cardTitle}</strong><span>${t.setup}</span></div>
        </ha-card>
        <style>${this._styles()}</style>`;
      return;
    }

    const available = [hum, cool].some(
      (obj) => obj && !["unknown", "unavailable"].includes(obj.state)
    );
    const humOn = hum?.state === "on";
    const coolOn = cool?.state === "on";
    const shouldOpen = humOn || coolOn;
    const attrs = cool?.attributes || hum?.attributes || {};
    const title = this._config.title || attrs.pengufresh_instance || t.cardTitle;

    let advice = t.keepClosed;
    if (!available) advice = t.unavailable;
    else if (humOn && coolOn) advice = t.openBoth;
    else if (humOn) advice = t.openHumidity;
    else if (coolOn) advice = t.openCooling;

    const outTemp = attrs.outdoor_temperature;
    const outTempUnit = attrs.outdoor_temperature_unit || "°C";
    const outRh = attrs.outdoor_relative_humidity;
    const dew = attrs.outdoor_dew_point;
    const target = cool?.attributes?.target_temperature;
    const isCoolOutside = Number.isFinite(Number(outTemp)) && Number.isFinite(Number(target))
      ? Number(outTemp) < Number(target)
      : coolOn;
    const isHumidOutside = Number(outRh) >= 80;

    const weatherIcon = isCoolOutside ? "❄️" : "☀️";
    const tempLabel = isCoolOutside ? t.coolOutside : t.warmOutside;
    const moistureLabel = humOn ? t.dryOutside : isHumidOutside ? t.humidOutside : "";
    const outdoorClass = isCoolOutside ? "cool" : "warm";

    const rooms = Array.from(
      new Set([
        ...(hum?.attributes?.recommended_rooms || []),
        ...(cool?.attributes?.recommended_rooms || []),
      ])
    );

    const outdoorValues = [
      outTemp !== undefined ? `${esc(outTemp)} ${esc(outTempUnit)}` : null,
      outRh !== undefined ? `${esc(outRh)} %` : null,
    ].filter(Boolean).join(" · ");

    const dewValue = dew !== undefined ? `${esc(dew)} ${esc(outTempUnit)}` : "–";

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card ${shouldOpen ? "is-open" : "is-closed"}">
        <div class="hero ${outdoorClass}">
          <div class="topbar">
            <div>
              <div class="brand">🐧 ${esc(title)}</div>
              <div class="advice">${esc(advice)}</div>
            </div>
            <div class="outside-pill">
              <span class="weather-icon">${weatherIcon}</span>
              <div>
                <strong>${esc(t.outdoor)}</strong>
                <span>${outdoorValues || "–"}</span>
              </div>
            </div>
          </div>

          <div class="scene">
            <div class="outside-copy">
              <span>${esc(tempLabel)}</span>
              ${moistureLabel ? `<span>💧 ${esc(moistureLabel)}</span>` : ""}
              <span>${esc(t.dewPoint)} ${dewValue}</span>
            </div>
            <div class="window-wrap ${shouldOpen ? "open" : "closed"}" aria-label="${esc(advice)}">
              <div class="window-frame">
                <div class="pane left"><span class="handle"></span></div>
                <div class="pane right"><span class="handle"></span></div>
                <div class="breeze"><i></i><i></i><i></i></div>
              </div>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="status-grid">
            ${this._statusTile(t.humidity, "💧", humOn, hum, t)}
            ${this._statusTile(t.cooling, "🌡️", coolOn, cool, t)}
          </div>

          <div class="rooms">
            <div class="rooms-label">${esc(t.rooms)}</div>
            <div class="chips">
              ${rooms.length
                ? rooms.map((room) => `<span class="chip">${esc(room)}</span>`).join("")
                : `<span class="chip muted">${esc(t.noNeed)}</span>`}
            </div>
          </div>
        </div>
      </ha-card>
      <style>${this._styles()}</style>
    `;

    const humidityTile = this.shadowRoot.querySelector('[data-kind="humidity"]');
    const coolingTile = this.shadowRoot.querySelector('[data-kind="cooling"]');
    humidityTile?.addEventListener("click", () => this._moreInfo(hum?.entity_id));
    coolingTile?.addEventListener("click", () => this._moreInfo(cool?.entity_id));
  }

  _statusTile(label, icon, active, entity, t) {
    const reason = entity?.attributes?.recommendation || "";
    return `
      <button class="status ${active ? "active" : "inactive"}" data-kind="${label === t.humidity ? "humidity" : "cooling"}" ${entity ? "" : "disabled"}>
        <div class="status-icon">${icon}</div>
        <div class="status-copy">
          <strong>${esc(label)}</strong>
          <span>${active ? esc(t.ventilate) : esc(t.off)}</span>
          ${reason ? `<small>${esc(reason)}</small>` : ""}
        </div>
        <div class="dot"></div>
      </button>`;
  }

  _styles() {
    return `
      :host { display: block; }
      ha-card.pf-card { overflow: hidden; border-radius: var(--ha-card-border-radius, 16px); }
      .empty { padding: 24px; display: grid; gap: 8px; }
      .empty span { color: var(--secondary-text-color); }
      .hero { position: relative; padding: 20px; color: #fff; overflow: hidden; }
      .hero.cool { background: linear-gradient(135deg, #155e75 0%, #0f766e 48%, #164e63 100%); }
      .hero.warm { background: linear-gradient(135deg, #b45309 0%, #c2410c 52%, #9a3412 100%); }
      .hero::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 78% 16%, rgba(255,255,255,.2), transparent 36%); pointer-events: none; }
      .topbar { position: relative; z-index: 2; display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
      .brand { font-size: 20px; font-weight: 700; letter-spacing: .1px; }
      .advice { font-size: 14px; margin-top: 5px; opacity: .94; max-width: 420px; }
      .outside-pill { display: flex; gap: 9px; align-items: center; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.22); backdrop-filter: blur(10px); border-radius: 14px; padding: 9px 11px; white-space: nowrap; }
      .outside-pill div { display: grid; font-size: 11px; line-height: 1.25; }
      .outside-pill span { opacity: .9; }
      .weather-icon { font-size: 22px; }
      .scene { position: relative; z-index: 1; min-height: 172px; display: flex; align-items: center; justify-content: center; }
      .outside-copy { position: absolute; left: 0; bottom: 10px; display: grid; gap: 4px; font-size: 12px; opacity: .9; }
      .window-wrap { width: 156px; height: 120px; perspective: 700px; }
      .window-frame { box-sizing: border-box; position: relative; width: 100%; height: 100%; border: 9px solid rgba(255,255,255,.96); border-radius: 8px; box-shadow: 0 14px 32px rgba(0,0,0,.24), inset 0 0 0 1px rgba(0,0,0,.08); background: rgba(206,242,255,.30); }
      .window-frame::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 5px; transform: translateX(-50%); background: rgba(255,255,255,.96); z-index: 4; }
      .pane { position: absolute; top: 0; bottom: 0; width: calc(50% - 2px); box-sizing: border-box; border: 3px solid rgba(255,255,255,.9); background: linear-gradient(145deg, rgba(224,247,255,.62), rgba(147,210,230,.30)); transition: transform .65s cubic-bezier(.2,.8,.2,1), box-shadow .65s ease; z-index: 3; }
      .pane.left { left: 0; transform-origin: left center; }
      .pane.right { right: 0; transform-origin: right center; }
      .window-wrap.open .pane.left { transform: rotateY(-58deg); box-shadow: 8px 5px 15px rgba(0,0,0,.18); }
      .window-wrap.open .pane.right { transform: rotateY(58deg); box-shadow: -8px 5px 15px rgba(0,0,0,.18); }
      .handle { position: absolute; top: 48%; width: 3px; height: 18px; border-radius: 3px; background: rgba(255,255,255,.95); }
      .left .handle { right: 7px; } .right .handle { left: 7px; }
      .breeze { position: absolute; inset: 18px 12px; z-index: 2; opacity: 0; transition: opacity .3s ease; overflow: hidden; }
      .window-wrap.open .breeze { opacity: 1; }
      .breeze i { position: absolute; left: -55px; width: 70px; height: 15px; border-top: 2px solid rgba(255,255,255,.75); border-radius: 50%; animation: pf-breeze 2.3s linear infinite; }
      .breeze i:nth-child(1) { top: 17px; animation-delay: 0s; }
      .breeze i:nth-child(2) { top: 45px; animation-delay: .7s; width: 52px; }
      .breeze i:nth-child(3) { top: 73px; animation-delay: 1.3s; width: 62px; }
      @keyframes pf-breeze { from { transform: translateX(0); opacity: 0; } 25% { opacity: 1; } to { transform: translateX(190px); opacity: 0; } }
      @media (prefers-reduced-motion: reduce) { .pane, .breeze i { transition: none !important; animation: none !important; } }
      .content { padding: 14px 16px 16px; display: grid; gap: 14px; }
      .status-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .status { appearance: none; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); border-radius: 13px; padding: 12px; display: grid; grid-template-columns: auto 1fr auto; align-items: start; gap: 10px; text-align: left; cursor: pointer; font: inherit; }
      .status:hover { background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color)); }
      .status:disabled { cursor: default; opacity: .5; }
      .status.active { border-color: color-mix(in srgb, var(--success-color, #2e7d32) 55%, var(--divider-color)); }
      .status-icon { font-size: 21px; }
      .status-copy { min-width: 0; display: grid; gap: 2px; }
      .status-copy strong { font-size: 13px; }
      .status-copy span { font-size: 12px; color: var(--secondary-text-color); }
      .status-copy small { margin-top: 4px; font-size: 10px; line-height: 1.25; color: var(--secondary-text-color); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 4px; background: var(--disabled-text-color); }
      .active .dot { background: var(--success-color, #43a047); box-shadow: 0 0 0 4px color-mix(in srgb, var(--success-color, #43a047) 18%, transparent); }
      .rooms { display: grid; gap: 7px; }
      .rooms-label { font-size: 11px; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .05em; }
      .chips { display: flex; gap: 6px; flex-wrap: wrap; }
      .chip { font-size: 11px; padding: 5px 9px; border-radius: 999px; background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color)); color: var(--primary-text-color); }
      .chip.muted { background: var(--secondary-background-color); color: var(--secondary-text-color); }
      @media (max-width: 430px) {
        .hero { padding: 16px; }
        .topbar { flex-direction: column; }
        .outside-pill { align-self: flex-end; }
        .scene { min-height: 150px; }
        .outside-copy { max-width: 105px; }
        .status-grid { grid-template-columns: 1fr; }
      }
    `;
  }
}

class PenguFreshCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    this._config = { type: "custom:pengufresh-card", ...config };
    this._render();
  }

  _fireConfigChanged(config) {
    const nextConfig = { type: "custom:pengufresh-card", ...config };
    this._config = nextConfig;
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: nextConfig };
    this.dispatchEvent(event);
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const t = PF_I18N[pfLanguage(this._hass)];
    const instances = findPenguFreshInstances(this._hass);
    const currentEntry =
      this._hass.states[this._config.humidity_entity]?.attributes?.pengufresh_entry_id ||
      this._hass.states[this._config.cooling_entity]?.attributes?.pengufresh_entry_id ||
      "";

    this.shadowRoot.innerHTML = `
      <div class="editor">
        <label>
          <span>${esc(t.editorTitle)}</span>
          <select id="instance" ${instances.length ? "" : "disabled"}>
            ${instances.length
              ? instances.map((item) => `<option value="${esc(item.id)}" ${item.id === currentEntry ? "selected" : ""}>${esc(item.name)}</option>`).join("")
              : `<option>${esc(t.noInstance)}</option>`}
          </select>
        </label>
        <label>
          <span>${esc(t.customTitle)}</span>
          <input id="title" type="text" value="${esc(this._config.title || "")}" placeholder="PenguFresh" />
        </label>
        <div class="hint">${esc(t.setup)}</div>
      </div>
      <style>
        .editor { display: grid; gap: 16px; padding: 8px 0; }
        label { display: grid; gap: 6px; color: var(--primary-text-color); }
        label > span { font-size: 12px; color: var(--secondary-text-color); }
        select, input { box-sizing: border-box; width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); font: inherit; }
        .hint { font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; }
      </style>`;

    const select = this.shadowRoot.querySelector("#instance");
    const title = this.shadowRoot.querySelector("#title");

    if (instances.length && !currentEntry) {
      const first = instances[0];
      queueMicrotask(() => this._fireConfigChanged({
        ...this._config,
        humidity_entity: first.humidity,
        cooling_entity: first.cooling,
      }));
    }

    select?.addEventListener("change", (event) => {
      const item = instances.find((instance) => instance.id === event.target.value);
      if (!item) return;
      this._fireConfigChanged({
        ...this._config,
        humidity_entity: item.humidity,
        cooling_entity: item.cooling,
      });
    });

    title?.addEventListener("change", (event) => {
      const value = event.target.value.trim();
      const next = { ...this._config };
      if (value) next.title = value;
      else delete next.title;
      this._fireConfigChanged(next);
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
    description: "Ventilation recommendation with animated window and indoor/outdoor climate status.",
    preview: true,
    getEntitySuggestion: (hass, entityId) => {
      const pair = pairForEntity(hass, entityId);
      if (!pair) return null;
      return {
        config: {
          type: "custom:pengufresh-card",
          humidity_entity: pair.humidity,
          cooling_entity: pair.cooling,
        },
      };
    },
  });
}

console.info(`%c PenguFresh Card %c ${PENGUFRESH_CARD_VERSION} `, "color:#fff;background:#0f766e;font-weight:700", "color:#0f766e;background:#e6fffb");
