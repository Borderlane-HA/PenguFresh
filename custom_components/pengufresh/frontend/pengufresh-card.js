const PENGUFRESH_CARD_VERSION = "0.2.3";

const PF_DEFAULT_LAYOUT = "full_large";
const PF_LAYOUTS = {
  full_compact: { columns: "full", rows: 1 },
  full_medium: { columns: "full", rows: 3 },
  full_large: { columns: "full", rows: 6 },
  half_compact: { columns: 6, rows: 1 },
  half_medium: { columns: 6, rows: 3 },
  half_large: { columns: 6, rows: 6 },
};

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
    closed: "Geschlossen",
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
    layout: "Layout",
    layoutFullCompact: "Vollbreite – Kompakt",
    layoutFullMedium: "Vollbreite – Mittel",
    layoutFullLarge: "Vollbreite – Groß",
    layoutHalfCompact: "Halbe Breite – Kompakt",
    layoutHalfMedium: "Halbe Breite – Mittel",
    layoutHalfLarge: "Halbe Breite – Groß",
    layoutHint: "In Abschnitts-Dashboards setzt das Preset Breite und Höhe automatisch. Manuelles Größenändern bleibt möglich; PenguFresh passt die Informationsdichte an.",
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
    closed: "Closed",
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
    layout: "Layout",
    layoutFullCompact: "Full width – Compact",
    layoutFullMedium: "Full width – Medium",
    layoutFullLarge: "Full width – Large",
    layoutHalfCompact: "Half width – Compact",
    layoutHalfMedium: "Half width – Medium",
    layoutHalfLarge: "Half width – Large",
    layoutHint: "In Sections dashboards the preset automatically sets width and height. Manual resizing is still possible; PenguFresh adapts the information density.",
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

function pfLayoutKey(config) {
  if (config?.layout && PF_LAYOUTS[config.layout]) return config.layout;

  const columns = config?.grid_options?.columns;
  const rows = Number(config?.grid_options?.rows);
  if (rows && columns !== undefined) {
    const isHalf = Number(columns) === 6;
    const size = rows <= 1 ? "compact" : rows <= 3 ? "medium" : "large";
    return `${isHalf ? "half" : "full"}_${size}`;
  }

  return PF_DEFAULT_LAYOUT;
}

function pfEffectiveLayout(config) {
  const key = pfLayoutKey(config);
  const preset = PF_LAYOUTS[key] || PF_LAYOUTS[PF_DEFAULT_LAYOUT];
  const rawRows = config?.grid_options?.rows;
  const rawColumns = config?.grid_options?.columns;

  const rows = Number.isFinite(Number(rawRows)) ? Number(rawRows) : preset.rows;
  const columns = rawColumns !== undefined ? rawColumns : preset.columns;
  const density = rows <= 1 ? "compact" : rows <= 3 ? "medium" : "large";
  const width = columns === "full" || Number(columns) > 6 ? "full" : "half";

  return { key, rows, columns, density, width };
}

function pfLayoutOptions(t) {
  return [
    ["full_compact", t.layoutFullCompact],
    ["full_medium", t.layoutFullMedium],
    ["full_large", t.layoutFullLarge],
    ["half_compact", t.layoutHalfCompact],
    ["half_medium", t.layoutHalfMedium],
    ["half_large", t.layoutHalfLarge],
  ];
}

class PenguFreshCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("pengufresh-card-editor");
  }

  static getStubConfig(hass) {
    const first = findPenguFreshInstances(hass)[0];
    const preset = PF_LAYOUTS[PF_DEFAULT_LAYOUT];
    const config = {
      type: "custom:pengufresh-card",
      layout: PF_DEFAULT_LAYOUT,
      grid_options: { columns: preset.columns, rows: preset.rows },
    };
    if (!first) return config;
    return {
      ...config,
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
    return pfEffectiveLayout(this._config).rows;
  }

  getGridOptions() {
    const layout = pfEffectiveLayout(this._config);
    return {
      rows: layout.rows,
      columns: layout.columns,
      min_rows: 1,
      max_rows: 6,
      min_columns: 6,
      max_columns: 12,
    };
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _cardData() {
    const t = PF_I18N[pfLanguage(this._hass)];
    const hum = this._config.humidity_entity
      ? this._hass.states[this._config.humidity_entity]
      : null;
    const cool = this._config.cooling_entity
      ? this._hass.states[this._config.cooling_entity]
      : null;

    if (!hum && !cool) return { t, hum, cool, empty: true };

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

    return {
      t,
      hum,
      cool,
      available,
      humOn,
      coolOn,
      shouldOpen,
      attrs,
      title,
      advice,
      outTemp,
      outTempUnit,
      outRh,
      dewValue,
      weatherIcon,
      tempLabel,
      moistureLabel,
      outdoorClass,
      rooms,
      outdoorValues,
    };
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;

    const data = this._cardData();
    const layout = pfEffectiveLayout(this._config);

    if (data.empty) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="empty"><strong>${data.t.cardTitle}</strong><span>${data.t.setup}</span></div>
        </ha-card>
        <style>${this._styles()}</style>`;
      return;
    }

    if (layout.density === "compact") {
      this._renderCompact(data, layout);
    } else if (layout.density === "medium") {
      this._renderMedium(data, layout);
    } else {
      this._renderLarge(data, layout);
    }
  }

  _renderCompact(data, layout) {
    const { t, title, shouldOpen, advice, outdoorClass, weatherIcon, outTemp, outTempUnit, outRh, humOn, coolOn } = data;
    const action = shouldOpen ? t.ventilate : t.closed;
    const actionIcon = shouldOpen ? "🪟↗" : "🪟✓";
    const outside = [
      outTemp !== undefined ? `${esc(outTemp)} ${esc(outTempUnit)}` : null,
      outRh !== undefined ? `${esc(outRh)}%` : null,
    ].filter(Boolean).join(" · ");

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card compact-card ${outdoorClass} ${layout.width}">
        <div class="compact-row" title="${esc(advice)}">
          <div class="compact-brand"><span class="penguin">🐧</span><strong>${esc(title)}</strong></div>
          <div class="compact-weather"><span>${weatherIcon}</span><span>${outside || "–"}</span></div>
          <div class="compact-flags" aria-label="${esc(advice)}">
            <span class="mini-flag ${humOn ? "active" : ""}">💧</span>
            <span class="mini-flag ${coolOn ? "active" : ""}">🌡️</span>
          </div>
          <div class="compact-action ${shouldOpen ? "active" : "inactive"}"><span>${actionIcon}</span><strong>${esc(action)}</strong></div>
        </div>
      </ha-card>
      <style>${this._styles()}</style>`;
  }

  _renderMedium(data, layout) {
    const { t, hum, cool, title, shouldOpen, advice, outdoorClass, weatherIcon, outdoorValues, humOn, coolOn } = data;
    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card medium-card ${outdoorClass} ${layout.width} ${shouldOpen ? "is-open" : "is-closed"}">
        <div class="medium-hero">
          <div class="medium-copy">
            <div class="brand">🐧 ${esc(title)}</div>
            <div class="advice">${esc(advice)}</div>
            <div class="medium-weather"><span>${weatherIcon}</span><strong>${outdoorValues || "–"}</strong></div>
          </div>
          <div class="window-wrap medium-window ${shouldOpen ? "open" : "closed"}" aria-label="${esc(advice)}">
            ${this._windowHtml()}
          </div>
        </div>
        <div class="medium-status-grid">
          ${this._mediumStatus(t.humidity, "💧", humOn, hum, "humidity", t)}
          ${this._mediumStatus(t.cooling, "🌡️", coolOn, cool, "cooling", t)}
        </div>
      </ha-card>
      <style>${this._styles()}</style>`;

    this.shadowRoot.querySelector('[data-kind="humidity"]')?.addEventListener("click", () => this._moreInfo(hum?.entity_id));
    this.shadowRoot.querySelector('[data-kind="cooling"]')?.addEventListener("click", () => this._moreInfo(cool?.entity_id));
  }

  _renderLarge(data, layout) {
    const {
      t, hum, cool, title, shouldOpen, advice, outdoorClass, weatherIcon, outdoorValues,
      tempLabel, moistureLabel, dewValue, humOn, coolOn, rooms,
    } = data;

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card large-card ${outdoorClass} ${layout.width} ${shouldOpen ? "is-open" : "is-closed"}">
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
              ${this._windowHtml()}
            </div>
          </div>
        </div>

        <div class="content">
          <div class="status-grid">
            ${this._statusTile(t.humidity, "💧", humOn, hum, "humidity", t)}
            ${this._statusTile(t.cooling, "🌡️", coolOn, cool, "cooling", t)}
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
      <style>${this._styles()}</style>`;

    this.shadowRoot.querySelector('[data-kind="humidity"]')?.addEventListener("click", () => this._moreInfo(hum?.entity_id));
    this.shadowRoot.querySelector('[data-kind="cooling"]')?.addEventListener("click", () => this._moreInfo(cool?.entity_id));
  }

  _windowHtml() {
    return `
      <div class="window-frame">
        <div class="pane left"><span class="handle"></span></div>
        <div class="pane right"><span class="handle"></span></div>
        <div class="breeze"><i></i><i></i><i></i></div>
      </div>`;
  }

  _mediumStatus(label, icon, active, entity, kind, t) {
    return `
      <button class="medium-status ${active ? "active" : "inactive"}" data-kind="${kind}" ${entity ? "" : "disabled"}>
        <span class="medium-status-icon">${icon}</span>
        <span><strong>${esc(label)}</strong><small>${active ? esc(t.ventilate) : esc(t.off)}</small></span>
        <i></i>
      </button>`;
  }

  _statusTile(label, icon, active, entity, kind, t) {
    const reason = entity?.attributes?.recommendation || "";
    return `
      <button class="status ${active ? "active" : "inactive"}" data-kind="${kind}" ${entity ? "" : "disabled"}>
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
      :host { display: block; height: 100%; }
      ha-card.pf-card { overflow: hidden; border-radius: var(--ha-card-border-radius, 16px); height: 100%; box-sizing: border-box; }
      .empty { padding: 24px; display: grid; gap: 8px; }
      .empty span { color: var(--secondary-text-color); }

      /* Compact: one grid row, only the decision and essential outdoor values. */
      .compact-card { color: #fff; }
      .compact-card.cool { background: linear-gradient(110deg, #155e75, #0f766e 55%, #164e63); }
      .compact-card.warm { background: linear-gradient(110deg, #b45309, #c2410c 55%, #9a3412); }
      .compact-row { min-height: 56px; height: 100%; box-sizing: border-box; padding: 7px 12px; display: flex; align-items: center; gap: 12px; }
      .compact-brand { min-width: 0; display: flex; align-items: center; gap: 6px; }
      .compact-brand strong { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
      .penguin { font-size: 17px; }
      .compact-weather { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 12px; white-space: nowrap; opacity: .96; }
      .compact-flags { display: flex; gap: 4px; }
      .mini-flag { width: 23px; height: 23px; display: grid; place-items: center; border-radius: 7px; background: rgba(255,255,255,.12); opacity: .5; font-size: 13px; }
      .mini-flag.active { background: rgba(255,255,255,.26); opacity: 1; box-shadow: inset 0 0 0 1px rgba(255,255,255,.22); }
      .compact-action { display: flex; align-items: center; gap: 6px; border-radius: 10px; padding: 6px 9px; background: rgba(255,255,255,.14); white-space: nowrap; }
      .compact-action.active { background: rgba(255,255,255,.25); box-shadow: inset 0 0 0 1px rgba(255,255,255,.22); }
      .compact-action strong { font-size: 12px; }
      .compact-card.half .compact-brand strong { max-width: 82px; }
      .compact-card.half .compact-weather { font-size: 11px; }
      .compact-card.half .compact-flags { display: none; }
      .compact-card.half .compact-action strong { display: none; }
      .compact-card.half .compact-action { padding-inline: 7px; }

      /* Medium: small animated window plus the two decisions, no long reasons/room list. */
      .medium-card { display: grid; grid-template-rows: minmax(0, 1fr) auto; color: #fff; }
      .medium-card.cool { background: linear-gradient(135deg, #155e75, #0f766e 52%, #164e63); }
      .medium-card.warm { background: linear-gradient(135deg, #b45309, #c2410c 52%, #9a3412); }
      .medium-hero { min-height: 108px; padding: 12px 15px 7px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .medium-copy { min-width: 0; display: grid; gap: 3px; }
      .medium-copy .brand { font-size: 16px; font-weight: 700; }
      .medium-copy .advice { font-size: 12px; opacity: .94; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .medium-weather { display: flex; align-items: center; gap: 5px; font-size: 11px; margin-top: 3px; opacity: .92; }
      .medium-window { width: 92px !important; height: 70px !important; flex: 0 0 auto; }
      .medium-status-grid { background: var(--card-background-color); color: var(--primary-text-color); padding: 8px 10px 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
      .medium-status { appearance: none; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); border-radius: 10px; min-height: 46px; padding: 7px 9px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 7px; text-align: left; cursor: pointer; font: inherit; }
      .medium-status-icon { font-size: 17px; }
      .medium-status > span:nth-child(2) { min-width: 0; display: grid; }
      .medium-status strong { font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .medium-status small { font-size: 10px; color: var(--secondary-text-color); }
      .medium-status i { width: 8px; height: 8px; border-radius: 50%; background: var(--disabled-text-color); }
      .medium-status.active { border-color: color-mix(in srgb, var(--success-color, #2e7d32) 55%, var(--divider-color)); }
      .medium-status.active i { background: var(--success-color, #43a047); }
      .medium-card.half .medium-hero { padding-inline: 11px; gap: 8px; }
      .medium-card.half .medium-window { width: 72px !important; height: 57px !important; }
      .medium-card.half .medium-copy .brand { font-size: 14px; }
      .medium-card.half .medium-copy .advice { -webkit-line-clamp: 1; }
      .medium-card.half .medium-status-grid { gap: 5px; padding-inline: 7px; }
      .medium-card.half .medium-status { padding-inline: 6px; gap: 5px; }
      .medium-card.half .medium-status small { display: none; }

      /* Large: full PenguFresh dashboard presentation. */
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

      /* Window animation shared by medium and large layouts. */
      .window-wrap { width: 156px; height: 120px; perspective: 700px; }
      .window-frame { box-sizing: border-box; position: relative; width: 100%; height: 100%; border: 9px solid rgba(255,255,255,.96); border-radius: 8px; box-shadow: 0 14px 32px rgba(0,0,0,.24), inset 0 0 0 1px rgba(0,0,0,.08); background: rgba(206,242,255,.30); }
      .medium-window .window-frame { border-width: 6px; border-radius: 6px; box-shadow: 0 8px 18px rgba(0,0,0,.2); }
      .window-frame::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 5px; transform: translateX(-50%); background: rgba(255,255,255,.96); z-index: 4; }
      .medium-window .window-frame::before { width: 3px; }
      .pane { position: absolute; top: 0; bottom: 0; width: calc(50% - 2px); box-sizing: border-box; border: 3px solid rgba(255,255,255,.9); background: linear-gradient(145deg, rgba(224,247,255,.62), rgba(147,210,230,.30)); transition: transform .65s cubic-bezier(.2,.8,.2,1), box-shadow .65s ease; z-index: 3; }
      .medium-window .pane { border-width: 2px; }
      .pane.left { left: 0; transform-origin: left center; }
      .pane.right { right: 0; transform-origin: right center; }
      .window-wrap.open .pane.left { transform: rotateY(-58deg); box-shadow: 8px 5px 15px rgba(0,0,0,.18); }
      .window-wrap.open .pane.right { transform: rotateY(58deg); box-shadow: -8px 5px 15px rgba(0,0,0,.18); }
      .handle { position: absolute; top: 48%; width: 3px; height: 18px; border-radius: 3px; background: rgba(255,255,255,.95); }
      .medium-window .handle { width: 2px; height: 10px; }
      .left .handle { right: 7px; } .right .handle { left: 7px; }
      .medium-window .left .handle { right: 4px; } .medium-window .right .handle { left: 4px; }
      .breeze { position: absolute; inset: 18px 12px; z-index: 2; opacity: 0; transition: opacity .3s ease; overflow: hidden; }
      .medium-window .breeze { inset: 8px 6px; }
      .window-wrap.open .breeze { opacity: 1; }
      .breeze i { position: absolute; left: -55px; width: 70px; height: 15px; border-top: 2px solid rgba(255,255,255,.75); border-radius: 50%; animation: pf-breeze 2.3s linear infinite; }
      .medium-window .breeze i { width: 38px; height: 8px; }
      .breeze i:nth-child(1) { top: 17px; animation-delay: 0s; }
      .breeze i:nth-child(2) { top: 45px; animation-delay: .7s; width: 52px; }
      .breeze i:nth-child(3) { top: 73px; animation-delay: 1.3s; width: 62px; }
      .medium-window .breeze i:nth-child(1) { top: 7px; }
      .medium-window .breeze i:nth-child(2) { top: 22px; width: 30px; }
      .medium-window .breeze i:nth-child(3) { top: 37px; width: 34px; }
      @keyframes pf-breeze { from { transform: translateX(0); opacity: 0; } 25% { opacity: 1; } to { transform: translateX(190px); opacity: 0; } }
      @media (prefers-reduced-motion: reduce) { .pane, .breeze i { transition: none !important; animation: none !important; } }

      .content { padding: 14px 16px 16px; display: grid; gap: 14px; }
      .status-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .status { appearance: none; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); border-radius: 13px; padding: 12px; display: grid; grid-template-columns: auto 1fr auto; align-items: start; gap: 10px; text-align: left; cursor: pointer; font: inherit; }
      .status:hover, .medium-status:hover { background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color)); }
      .status:disabled, .medium-status:disabled { cursor: default; opacity: .5; }
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

      .large-card.half .hero { padding: 16px; }
      .large-card.half .topbar { gap: 8px; }
      .large-card.half .brand { font-size: 17px; }
      .large-card.half .outside-pill { padding: 7px 8px; }
      .large-card.half .scene { min-height: 154px; }
      .large-card.half .window-wrap { width: 132px; height: 102px; }
      .large-card.half .outside-copy { max-width: 110px; font-size: 11px; }
      .large-card.half .content { gap: 10px; padding: 10px 12px 12px; }
      .large-card.half .status { padding: 9px; gap: 7px; }
      .large-card.half .status-copy small { -webkit-line-clamp: 1; }

      @media (max-width: 430px) {
        .compact-row { gap: 7px; padding-inline: 9px; }
        .compact-brand strong { max-width: 80px; }
        .compact-flags { display: none; }
        .compact-action strong { display: none; }
        .compact-weather { font-size: 10px; }
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
    const currentLayout = pfLayoutKey(this._config);

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
          <span>${esc(t.layout)}</span>
          <select id="layout">
            ${pfLayoutOptions(t).map(([value, label]) => `<option value="${value}" ${value === currentLayout ? "selected" : ""}>${esc(label)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>${esc(t.customTitle)}</span>
          <input id="title" type="text" value="${esc(this._config.title || "")}" placeholder="PenguFresh" />
        </label>
        <div class="hint">${esc(t.layoutHint)}</div>
      </div>
      <style>
        .editor { display: grid; gap: 16px; padding: 8px 0; }
        label { display: grid; gap: 6px; color: var(--primary-text-color); }
        label > span { font-size: 12px; color: var(--secondary-text-color); }
        select, input { box-sizing: border-box; width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); font: inherit; }
        .hint { font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; }
      </style>`;

    const instanceSelect = this.shadowRoot.querySelector("#instance");
    const layoutSelect = this.shadowRoot.querySelector("#layout");
    const title = this.shadowRoot.querySelector("#title");

    if (instances.length && !currentEntry) {
      const first = instances[0];
      queueMicrotask(() => this._fireConfigChanged({
        ...this._config,
        humidity_entity: first.humidity,
        cooling_entity: first.cooling,
      }));
    }

    instanceSelect?.addEventListener("change", (event) => {
      const item = instances.find((instance) => instance.id === event.target.value);
      if (!item) return;
      this._fireConfigChanged({
        ...this._config,
        humidity_entity: item.humidity,
        cooling_entity: item.cooling,
      });
    });

    layoutSelect?.addEventListener("change", (event) => {
      const layout = event.target.value;
      const preset = PF_LAYOUTS[layout] || PF_LAYOUTS[PF_DEFAULT_LAYOUT];
      this._fireConfigChanged({
        ...this._config,
        layout,
        grid_options: {
          columns: preset.columns,
          rows: preset.rows,
        },
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
    description: "Ventilation recommendation with adaptive layouts, animated window and indoor/outdoor climate status.",
    preview: true,
    getEntitySuggestion: (hass, entityId) => {
      const pair = pairForEntity(hass, entityId);
      if (!pair) return null;
      const preset = PF_LAYOUTS[PF_DEFAULT_LAYOUT];
      return {
        config: {
          type: "custom:pengufresh-card",
          humidity_entity: pair.humidity,
          cooling_entity: pair.cooling,
          layout: PF_DEFAULT_LAYOUT,
          grid_options: { columns: preset.columns, rows: preset.rows },
        },
      };
    },
  });
}

console.info(`%c PenguFresh Card %c ${PENGUFRESH_CARD_VERSION} `, "color:#fff;background:#0f766e;font-weight:700", "color:#0f766e;background:#e6fffb");
