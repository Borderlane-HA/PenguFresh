const PENGUFRESH_CARD_VERSION = "0.2.8";

const PF_DEFAULT_LAYOUT = "full_large";
const PF_LAYOUTS = {
  full_compact: { columns: "full", rows: 1 },
  full_medium: { columns: "full", rows: 3 },
  full_large: { columns: "full", rows: 6 },
  half_compact: { columns: 6, rows: 1 },
  half_medium: { columns: 6, rows: 3 },
  half_large: { columns: 6, rows: 6 },
};

const PF_DEFAULTS = {
  show_title: false,
  show_advice: true,
  show_outdoor: true,
  show_dew_point: true,
  show_window: true,
  show_humidity: true,
  show_cooling: true,
  show_rooms: true,
  show_reasons: false,
  show_humidity_reason: false,
  show_cooling_reason: false,
  show_status_state: true,
  color_mode: "auto",
  background_color: "#0f766e",
  text_color: "#ffffff",
  accent_color: "#67e8f9",
  block_order: ["title", "advice", "outdoor", "dew", "window", "humidity", "cooling", "rooms"],
  text_open_both: "",
  text_open_humidity: "",
  text_open_cooling: "",
  text_keep_closed: "",
  text_outdoor: "",
  text_dew_point: "",
  text_humidity: "",
  text_cooling: "",
  text_rooms: "",
  text_ventilate: "",
  text_off: "",
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
    customTitle: "Eigener Titel (optional)",
    layout: "Layout",
    layoutFullCompact: "Vollbreite – Kompakt",
    layoutFullMedium: "Vollbreite – Mittel",
    layoutFullLarge: "Vollbreite – Groß",
    layoutHalfCompact: "Halbe Breite – Kompakt",
    layoutHalfMedium: "Halbe Breite – Mittel",
    layoutHalfLarge: "Halbe Breite – Groß",
    layoutHint: "Kleine Layouts blenden automatisch Details aus. Manuelles Größenändern im Abschnitts-Dashboard bleibt möglich.",
    setup: "Wähle im Karteneditor eine PenguFresh-Instanz aus.",
    on: "empfohlen",
    off: "nicht nötig",
    content: "Inhalt",
    colors: "Farben",
    showTitle: "Titel anzeigen",
    showAdvice: "Lüftungsempfehlung anzeigen",
    showOutdoor: "Außenwerte anzeigen",
    showDewPoint: "Taupunkt anzeigen",
    showWindow: "Fenstergrafik / Animation anzeigen",
    showHumidity: "Status Feuchtigkeit anzeigen",
    showCooling: "Status Abkühlen anzeigen",
    showRooms: "Empfohlene Räume anzeigen",
    showReasons: "Begründungen anzeigen",
    showHumidityReason: "Begründung bei Feuchtigkeit anzeigen",
    showCoolingReason: "Begründung bei Abkühlen anzeigen",
    showStatusState: "Status „Lüften / nicht nötig“ anzeigen",
    colorMode: "Farbmodus",
    colorAuto: "Automatisch nach Status",
    colorTheme: "Home-Assistant-Theme",
    colorCustom: "Eigene Farben",
    backgroundColor: "Hintergrund",
    textColor: "Text",
    accentColor: "Akzent",
    autoColorHint: "Automatik: Blau = Kühlen, Grün = Entfeuchten, Türkis = beides, Orange = draußen zu warm / geschlossen lassen.",
    arrangement: "Positionen",
    arrangementHint: "Elemente frei per Drag & Drop positionieren. Die Positionen werden für das aktuell gewählte Kartenlayout gespeichert.",
    resetArrangement: "Positionen zurücksetzen",
    hidden: "ausgeblendet",
    texts: "Texte",
    textsHint: "Leer lassen, um den automatisch übersetzten Standardtext zu verwenden. Eigene Texte gelten nur für diese Dashboard-Karte.",
    textOpenBoth: "Empfehlung: Kühlen + Entfeuchten",
    textOpenHumidity: "Empfehlung: Entfeuchten",
    textOpenCooling: "Empfehlung: Kühlen",
    textKeepClosed: "Empfehlung: Fenster geschlossen",
    textOutdoor: "Bezeichnung Außenwerte",
    textDewPoint: "Bezeichnung Taupunkt",
    textHumidity: "Bezeichnung Feuchtigkeit",
    textCooling: "Bezeichnung Abkühlen",
    textRooms: "Bezeichnung Räume",
    textVentilate: "Status aktiv",
    textOff: "Status inaktiv",
    blockTitle: "Titel",
    blockAdvice: "Empfehlung",
    blockOutdoor: "Außenwerte",
    blockDew: "Taupunkt",
    blockWindow: "Fenster",
    blockHumidity: "Feuchtigkeit",
    blockCooling: "Abkühlen",
    blockRooms: "Räume",
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
    customTitle: "Custom title (optional)",
    layout: "Layout",
    layoutFullCompact: "Full width – Compact",
    layoutFullMedium: "Full width – Medium",
    layoutFullLarge: "Full width – Large",
    layoutHalfCompact: "Half width – Compact",
    layoutHalfMedium: "Half width – Medium",
    layoutHalfLarge: "Half width – Large",
    layoutHint: "Small layouts automatically hide details. Manual resizing in Sections dashboards is still supported.",
    setup: "Select a PenguFresh instance in the card editor.",
    on: "recommended",
    off: "not needed",
    content: "Content",
    colors: "Colors",
    showTitle: "Show title",
    showAdvice: "Show ventilation recommendation",
    showOutdoor: "Show outdoor values",
    showDewPoint: "Show dew point",
    showWindow: "Show window graphic / animation",
    showHumidity: "Show humidity status",
    showCooling: "Show cooling status",
    showRooms: "Show recommended rooms",
    showReasons: "Show reasons",
    showHumidityReason: "Show humidity reason",
    showCoolingReason: "Show cooling reason",
    showStatusState: "Show Ventilate / not needed status",
    colorMode: "Color mode",
    colorAuto: "Automatic by status",
    colorTheme: "Home Assistant theme",
    colorCustom: "Custom colors",
    backgroundColor: "Background",
    textColor: "Text",
    accentColor: "Accent",
    autoColorHint: "Automatic: blue = cooling, green = dehumidifying, teal = both, orange = outside too warm / keep closed.",
    arrangement: "Positions",
    arrangementHint: "Freely position elements by drag and drop. Positions are saved for the currently selected card layout.",
    resetArrangement: "Reset positions",
    hidden: "hidden",
    texts: "Texts",
    textsHint: "Leave empty to use the automatically translated default. Custom texts apply only to this dashboard card.",
    textOpenBoth: "Advice: cool + dehumidify",
    textOpenHumidity: "Advice: dehumidify",
    textOpenCooling: "Advice: cool",
    textKeepClosed: "Advice: keep windows closed",
    textOutdoor: "Outdoor label",
    textDewPoint: "Dew point label",
    textHumidity: "Humidity label",
    textCooling: "Cooling label",
    textRooms: "Rooms label",
    textVentilate: "Active status",
    textOff: "Inactive status",
    blockTitle: "Title",
    blockAdvice: "Advice",
    blockOutdoor: "Outdoor values",
    blockDew: "Dew point",
    blockWindow: "Window",
    blockHumidity: "Humidity",
    blockCooling: "Cooling",
    blockRooms: "Rooms",
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

function pfValue(config, key) {
  return config?.[key] ?? PF_DEFAULTS[key];
}

function pfBool(config, key) {
  return Boolean(pfValue(config, key));
}

function pfCleanInstanceName(name) {
  const raw = String(name || "").trim();
  const cleaned = raw.replace(/^PenguFresh\s*(?:[-–—:]\s*)?/i, "").trim();
  return cleaned || raw || "";
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
  return {
    key,
    rows,
    columns,
    density: rows <= 1 ? "compact" : rows <= 3 ? "medium" : "large",
    width: columns === "full" || Number(columns) > 6 ? "full" : "half",
  };
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

function pfSafeColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

const PF_BLOCKS = ["title", "advice", "outdoor", "dew", "window", "humidity", "cooling", "rooms"];

function pfCustomText(config, key, fallback) {
  const value = String(config?.[key] ?? "").trim();
  return value || fallback;
}

function pfBlockOrder(config) {
  const raw = Array.isArray(config?.block_order) ? config.block_order : PF_DEFAULTS.block_order;
  const valid = raw.filter((item, index) => PF_BLOCKS.includes(item) && raw.indexOf(item) === index);
  return [...valid, ...PF_BLOCKS.filter((item) => !valid.includes(item))];
}

const PF_POSITION_DEFAULTS = {
  full_compact: { title:{x:12,y:50}, advice:{x:72,y:50}, outdoor:{x:30,y:50}, dew:{x:45,y:50}, window:{x:50,y:50}, humidity:{x:48,y:50}, cooling:{x:56,y:50}, rooms:{x:86,y:50} },
  half_compact: { title:{x:12,y:50}, advice:{x:66,y:50}, outdoor:{x:26,y:50}, dew:{x:42,y:50}, window:{x:50,y:50}, humidity:{x:45,y:50}, cooling:{x:55,y:50}, rooms:{x:84,y:50} },
  full_medium: { title:{x:14,y:9}, advice:{x:20,y:23}, outdoor:{x:79,y:20}, dew:{x:79,y:47}, window:{x:50,y:47}, humidity:{x:22,y:76}, cooling:{x:56,y:76}, rooms:{x:82,y:78} },
  half_medium: { title:{x:18,y:8}, advice:{x:27,y:20}, outdoor:{x:73,y:20}, dew:{x:75,y:43}, window:{x:31,y:51}, humidity:{x:69,y:57}, cooling:{x:31,y:82}, rooms:{x:72,y:84} },
  full_large: { title:{x:13,y:7}, advice:{x:20,y:17}, outdoor:{x:80,y:15}, dew:{x:81,y:34}, window:{x:50,y:43}, humidity:{x:22,y:73}, cooling:{x:53,y:73}, rooms:{x:81,y:75} },
  half_large: { title:{x:18,y:7}, advice:{x:27,y:16}, outdoor:{x:73,y:16}, dew:{x:75,y:34}, window:{x:32,y:43}, humidity:{x:69,y:48}, cooling:{x:32,y:72}, rooms:{x:70,y:78} },
};

function pfPositionMap(config, layoutKey) {
  const defaults = PF_POSITION_DEFAULTS[layoutKey] || PF_POSITION_DEFAULTS[PF_DEFAULT_LAYOUT];
  const saved = config?.positions?.[layoutKey] || {};
  const result = {};
  PF_BLOCKS.forEach((key) => {
    const fallback = defaults[key] || { x:50, y:50 };
    const item = saved[key] || {};
    const x = Number(item.x);
    const y = Number(item.y);
    result[key] = {
      x: Number.isFinite(x) ? Math.max(3, Math.min(97, x)) : fallback.x,
      y: Number.isFinite(y) ? Math.max(3, Math.min(97, y)) : fallback.y,
    };
  });
  return result;
}

function pfPositionStyle(position) {
  return `left:${position.x}%;top:${position.y}%;`;
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
    return { ...config, humidity_entity: first.humidity, cooling_entity: first.cooling };
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
    const hum = this._config.humidity_entity ? this._hass.states[this._config.humidity_entity] : null;
    const cool = this._config.cooling_entity ? this._hass.states[this._config.cooling_entity] : null;
    if (!hum && !cool) return { t, hum, cool, empty: true };

    const available = [hum, cool].some((obj) => obj && !["unknown", "unavailable"].includes(obj.state));
    const humOn = hum?.state === "on";
    const coolOn = cool?.state === "on";
    const shouldOpen = humOn || coolOn;
    const attrs = cool?.attributes || hum?.attributes || {};
    const instanceName = pfCleanInstanceName(attrs.pengufresh_instance || "");
    const title = this._config.title || instanceName;

    const labels = {
      outdoor: pfCustomText(this._config, "text_outdoor", t.outdoor),
      dewPoint: pfCustomText(this._config, "text_dew_point", t.dewPoint),
      humidity: pfCustomText(this._config, "text_humidity", t.humidity),
      cooling: pfCustomText(this._config, "text_cooling", t.cooling),
      rooms: pfCustomText(this._config, "text_rooms", t.rooms),
      ventilate: pfCustomText(this._config, "text_ventilate", t.ventilate),
      off: pfCustomText(this._config, "text_off", t.off),
    };

    let advice = pfCustomText(this._config, "text_keep_closed", t.keepClosed);
    if (!available) advice = t.unavailable;
    else if (humOn && coolOn) advice = pfCustomText(this._config, "text_open_both", t.openBoth);
    else if (humOn) advice = pfCustomText(this._config, "text_open_humidity", t.openHumidity);
    else if (coolOn) advice = pfCustomText(this._config, "text_open_cooling", t.openCooling);

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
    const rooms = Array.from(new Set([
      ...(hum?.attributes?.recommended_rooms || []),
      ...(cool?.attributes?.recommended_rooms || []),
    ]));

    const outdoorValues = [
      outTemp !== undefined ? `${outTemp} ${outTempUnit}` : null,
      outRh !== undefined ? `${outRh} %` : null,
    ].filter(Boolean).join(" · ");
    const dewValue = dew !== undefined ? `${dew} ${outTempUnit}` : "–";

    let statusClass = "status-neutral";
    if (humOn && coolOn) statusClass = "status-both";
    else if (coolOn) statusClass = "status-cooling";
    else if (humOn) statusClass = "status-humidity";
    else if (!isCoolOutside) statusClass = "status-warm";

    return {
      t, hum, cool, available, humOn, coolOn, shouldOpen, attrs, title, advice,
      outTemp, outTempUnit, outRh, dewValue, weatherIcon, tempLabel, moistureLabel,
      rooms, outdoorValues, statusClass, labels,
    };
  }

  _appearance(data) {
    const mode = pfValue(this._config, "color_mode");
    if (mode === "custom") {
      const bg = pfSafeColor(this._config.background_color, PF_DEFAULTS.background_color);
      const text = pfSafeColor(this._config.text_color, PF_DEFAULTS.text_color);
      const accent = pfSafeColor(this._config.accent_color, PF_DEFAULTS.accent_color);
      return {
        classes: "color-custom",
        style: `--pf-bg:${bg};--pf-fg:${text};--pf-accent:${accent};`,
      };
    }
    if (mode === "theme") return { classes: "color-theme", style: "" };
    return { classes: `color-auto ${data.statusClass}`, style: "" };
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const data = this._cardData();
    const layout = pfEffectiveLayout(this._config);

    if (data.empty) {
      this.shadowRoot.innerHTML = `<ha-card><div class="empty"><span>${esc(data.t.setup)}</span></div></ha-card><style>${this._styles()}</style>`;
      return;
    }

    if (layout.density === "compact") this._renderCompact(data, layout);
    else this._renderPositioned(data, layout);
  }

  _titleHtml(data, className = "title") {
    if (!pfBool(this._config, "show_title") || !data.title) return "";
    return `<div class="${className}">${esc(data.title)}</div>`;
  }

  _adviceHtml(data, className = "advice") {
    if (!pfBool(this._config, "show_advice")) return "";
    return `<div class="${className}">${esc(data.advice)}</div>`;
  }

  _renderCompact(data, layout) {
    const a = this._appearance(data);
    const enabled = {
      title: pfBool(this._config, "show_title") && Boolean(data.title),
      advice: pfBool(this._config, "show_advice"),
      outdoor: pfBool(this._config, "show_outdoor"),
      humidity: pfBool(this._config, "show_humidity"),
      cooling: pfBool(this._config, "show_cooling"),
    };
    const action = data.shouldOpen ? data.labels.ventilate : data.t.closed;
    const parts = {
      title: () => `<div class="compact-title">${esc(data.title)}</div>`,
      outdoor: () => `<div class="compact-weather"><span>${data.weatherIcon}</span><strong>${esc(data.outdoorValues || "–")}</strong></div>`,
      humidity: () => `<span class="mini-flag ${data.humOn ? "active" : ""}" title="${esc(data.labels.humidity)}">💧</span>`,
      cooling: () => `<span class="mini-flag ${data.coolOn ? "active" : ""}" title="${esc(data.labels.cooling)}">🌡️</span>`,
      advice: () => `<div class="compact-action ${data.shouldOpen ? "active" : "inactive"}" title="${esc(data.advice)}"><span>${data.shouldOpen ? "↗" : "✓"}</span><strong>${esc(enabled.advice ? data.advice : action)}</strong></div>`,
    };
    const order = pfBlockOrder(this._config).filter((key) => enabled[key] && parts[key]);
    if (!order.includes("advice")) order.push("advice");
    const html = order.map((key) => parts[key]()).join("");

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card compact-card ${layout.width} ${a.classes}" style="${a.style}">
        <div class="compact-row">${html}</div>
      </ha-card><style>${this._styles()}</style>`;
  }

  _renderPositioned(data, layout) {
    const a = this._appearance(data);
    const positions = pfPositionMap(this._config, layout.key);
    const enabled = {
      title: pfBool(this._config, "show_title") && Boolean(data.title),
      advice: pfBool(this._config, "show_advice"),
      outdoor: pfBool(this._config, "show_outdoor"),
      dew: pfBool(this._config, "show_outdoor") && pfBool(this._config, "show_dew_point"),
      window: pfBool(this._config, "show_window"),
      humidity: pfBool(this._config, "show_humidity"),
      cooling: pfBool(this._config, "show_cooling"),
      rooms: pfBool(this._config, "show_rooms"),
    };

    const modules = {
      title: () => `<div class="pf-free pf-free-title" style="${pfPositionStyle(positions.title)}"><strong>${esc(data.title)}</strong></div>`,
      advice: () => `<div class="pf-free pf-free-advice" style="${pfPositionStyle(positions.advice)}"><span class="pf-kicker">${data.shouldOpen ? "↗" : "✓"}</span><strong>${esc(data.advice)}</strong></div>`,
      outdoor: () => `<div class="pf-free pf-free-outdoor" style="${pfPositionStyle(positions.outdoor)}"><span class="pf-weather-icon">${data.weatherIcon}</span><div><small>${esc(data.labels.outdoor)}</small><strong>${esc(data.outdoorValues || "–")}</strong></div></div>`,
      dew: () => `<div class="pf-free pf-free-dew" style="${pfPositionStyle(positions.dew)}"><span>💧</span><div><small>${esc(data.labels.dewPoint)}</small><strong>${esc(data.dewValue)}</strong></div></div>`,
      window: () => `<div class="pf-free pf-free-window" style="${pfPositionStyle(positions.window)}"><div class="window-wrap free-window ${data.shouldOpen ? "open" : "closed"}" aria-label="${esc(data.advice)}">${this._windowHtml()}</div></div>`,
      humidity: () => `<div class="pf-free pf-free-status" style="${pfPositionStyle(positions.humidity)}">${this._moduleStatus(data.labels.humidity, "💧", data.humOn, data.hum, "humidity", data)}</div>`,
      cooling: () => `<div class="pf-free pf-free-status" style="${pfPositionStyle(positions.cooling)}">${this._moduleStatus(data.labels.cooling, "🌡️", data.coolOn, data.cool, "cooling", data)}</div>`,
      rooms: () => `<div class="pf-free pf-free-rooms" style="${pfPositionStyle(positions.rooms)}"><small>${esc(data.labels.rooms)}</small><div class="chips">${data.rooms.length ? data.rooms.map((room) => `<span class="chip">${esc(room)}</span>`).join("") : `<span class="chip muted">${esc(data.t.noNeed)}</span>`}</div></div>`,
    };

    const html = PF_BLOCKS.filter((key) => enabled[key]).map((key) => modules[key]()).join("");
    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card positioned-card ${layout.density} ${layout.width} ${a.classes} ${data.shouldOpen ? "is-open" : "is-closed"}" style="${a.style}">
        <div class="pf-free-stage">${html}</div>
      </ha-card><style>${this._styles()}</style>`;
    this._bindStatusClicks(data);
  }

  _renderModular(data, layout) {
    const a = this._appearance(data);
    const order = pfBlockOrder(this._config);
    const enabled = {
      title: pfBool(this._config, "show_title") && Boolean(data.title),
      advice: pfBool(this._config, "show_advice"),
      outdoor: pfBool(this._config, "show_outdoor"),
      dew: pfBool(this._config, "show_outdoor") && pfBool(this._config, "show_dew_point"),
      window: pfBool(this._config, "show_window"),
      humidity: pfBool(this._config, "show_humidity"),
      cooling: pfBool(this._config, "show_cooling"),
      rooms: pfBool(this._config, "show_rooms") && layout.density === "large",
    };

    const modules = {
      title: () => `<div class="pf-module pf-title-module"><strong>${esc(data.title)}</strong></div>`,
      advice: () => `<div class="pf-module pf-advice-module"><span class="pf-kicker">${data.shouldOpen ? "↗" : "✓"}</span><strong>${esc(data.advice)}</strong></div>`,
      outdoor: () => `<div class="pf-module pf-outdoor-module"><span class="pf-weather-icon">${data.weatherIcon}</span><div><small>${esc(data.labels.outdoor)}</small><strong>${esc(data.outdoorValues || "–")}</strong></div></div>`,
      dew: () => `<div class="pf-module pf-dew-module"><span>💧</span><div><small>${esc(data.labels.dewPoint)}</small><strong>${esc(data.dewValue)}</strong></div></div>`,
      window: () => `<div class="pf-module pf-window-module"><div class="window-wrap modular-window ${data.shouldOpen ? "open" : "closed"}" aria-label="${esc(data.advice)}">${this._windowHtml()}</div></div>`,
      humidity: () => this._moduleStatus(data.labels.humidity, "💧", data.humOn, data.hum, "humidity", data),
      cooling: () => this._moduleStatus(data.labels.cooling, "🌡️", data.coolOn, data.cool, "cooling", data),
      rooms: () => `<div class="pf-module pf-rooms-module"><small>${esc(data.labels.rooms)}</small><div class="chips">${data.rooms.length ? data.rooms.map((room) => `<span class="chip">${esc(room)}</span>`).join("") : `<span class="chip muted">${esc(data.t.noNeed)}</span>`}</div></div>`,
    };

    const html = order.filter((key) => enabled[key]).map((key) => modules[key]()).join("");

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card modular-card ${layout.density} ${layout.width} ${a.classes} ${data.shouldOpen ? "is-open" : "is-closed"}" style="${a.style}">
        <div class="pf-modules">${html}</div>
      </ha-card><style>${this._styles()}</style>`;
    this._bindStatusClicks(data);
  }

  _moduleStatus(label, icon, active, entity, kind, data) {
    const showReason = kind === "humidity" ? pfBool(this._config, "show_humidity_reason") : pfBool(this._config, "show_cooling_reason");
    const reason = showReason ? (entity?.attributes?.recommendation || "") : "";
    const stateText = pfBool(this._config, "show_status_state") ? `<span>${active ? esc(data.labels.ventilate) : esc(data.labels.off)}</span>` : "";
    return `<button class="pf-module pf-status-module ${active ? "active" : "inactive"}" data-kind="${kind}" ${entity ? "" : "disabled"}><span class="pf-status-icon">${icon}</span><div><strong>${esc(label)}</strong>${stateText}${reason ? `<small>${esc(reason)}</small>` : ""}</div><i></i></button>`;
  }

  _renderMedium(data, layout) {
    const a = this._appearance(data);
    const showOutdoor = pfBool(this._config, "show_outdoor");
    const showWindow = pfBool(this._config, "show_window");
    const showHumidity = pfBool(this._config, "show_humidity");
    const showCooling = pfBool(this._config, "show_cooling");

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card medium-card ${layout.width} ${a.classes} ${data.shouldOpen ? "is-open" : "is-closed"}" style="${a.style}">
        <div class="medium-hero">
          <div class="medium-copy">
            ${this._titleHtml(data, "medium-title")}
            ${this._adviceHtml(data)}
            ${showOutdoor ? `<div class="medium-weather"><span>${data.weatherIcon}</span><strong>${esc(data.outdoorValues || "–")}</strong></div>` : ""}
          </div>
          ${showWindow ? `<div class="window-wrap medium-window ${data.shouldOpen ? "open" : "closed"}" aria-label="${esc(data.advice)}">${this._windowHtml()}</div>` : ""}
        </div>
        ${(showHumidity || showCooling) ? `<div class="medium-status-grid">
          ${showHumidity ? this._mediumStatus(data.t.humidity, "💧", data.humOn, data.hum, "humidity", data.t) : ""}
          ${showCooling ? this._mediumStatus(data.t.cooling, "🌡️", data.coolOn, data.cool, "cooling", data.t) : ""}
        </div>` : ""}
      </ha-card><style>${this._styles()}</style>`;

    this._bindStatusClicks(data);
  }

  _renderLarge(data, layout) {
    const a = this._appearance(data);
    const showOutdoor = pfBool(this._config, "show_outdoor");
    const showDew = showOutdoor && pfBool(this._config, "show_dew_point");
    const showWindow = pfBool(this._config, "show_window");
    const showHumidity = pfBool(this._config, "show_humidity");
    const showCooling = pfBool(this._config, "show_cooling");
    const showRooms = pfBool(this._config, "show_rooms");

    this.shadowRoot.innerHTML = `
      <ha-card class="pf-card large-card ${layout.width} ${a.classes} ${data.shouldOpen ? "is-open" : "is-closed"}" style="${a.style}">
        <div class="hero">
          <div class="topbar">
            <div class="headline">
              ${this._titleHtml(data)}
              ${this._adviceHtml(data)}
            </div>
            ${showOutdoor ? `<div class="outside-pill"><span class="weather-icon">${data.weatherIcon}</span><div><strong>${esc(data.t.outdoor)}</strong><span>${esc(data.outdoorValues || "–")}</span></div></div>` : ""}
          </div>
          ${(showWindow || showOutdoor) ? `<div class="scene">
            ${showOutdoor ? `<div class="outside-copy"><span>${esc(data.tempLabel)}</span>${data.moistureLabel ? `<span>💧 ${esc(data.moistureLabel)}</span>` : ""}${showDew ? `<span>${esc(data.t.dewPoint)} ${esc(data.dewValue)}</span>` : ""}</div>` : ""}
            ${showWindow ? `<div class="window-wrap ${data.shouldOpen ? "open" : "closed"}" aria-label="${esc(data.advice)}">${this._windowHtml()}</div>` : ""}
          </div>` : ""}
        </div>
        ${((showHumidity || showCooling) || showRooms) ? `<div class="content">
          ${(showHumidity || showCooling) ? `<div class="status-grid ${showHumidity && showCooling ? "two" : "one"}">
            ${showHumidity ? this._statusTile(data.t.humidity, "💧", data.humOn, data.hum, "humidity", data.t) : ""}
            ${showCooling ? this._statusTile(data.t.cooling, "🌡️", data.coolOn, data.cool, "cooling", data.t) : ""}
          </div>` : ""}
          ${showRooms ? `<div class="rooms"><div class="rooms-label">${esc(data.t.rooms)}</div><div class="chips">${data.rooms.length ? data.rooms.map((room) => `<span class="chip">${esc(room)}</span>`).join("") : `<span class="chip muted">${esc(data.t.noNeed)}</span>`}</div></div>` : ""}
        </div>` : ""}
      </ha-card><style>${this._styles()}</style>`;

    this._bindStatusClicks(data);
  }

  _bindStatusClicks(data) {
    this.shadowRoot.querySelector('[data-kind="humidity"]')?.addEventListener("click", () => this._moreInfo(data.hum?.entity_id));
    this.shadowRoot.querySelector('[data-kind="cooling"]')?.addEventListener("click", () => this._moreInfo(data.cool?.entity_id));
  }

  _windowHtml() {
    return `<div class="window-frame"><div class="pane left"><span class="handle"></span></div><div class="pane right"><span class="handle"></span></div><div class="breeze"><i></i><i></i><i></i></div></div>`;
  }

  _mediumStatus(label, icon, active, entity, kind, t) {
    return `<button class="medium-status ${active ? "active" : "inactive"}" data-kind="${kind}" ${entity ? "" : "disabled"}><span class="medium-status-icon">${icon}</span><span><strong>${esc(label)}</strong><small>${active ? esc(t.ventilate) : esc(t.off)}</small></span><i></i></button>`;
  }

  _statusTile(label, icon, active, entity, kind, t) {
    const showReason = kind === "humidity" ? pfBool(this._config, "show_humidity_reason") : pfBool(this._config, "show_cooling_reason");
    const reason = showReason ? (entity?.attributes?.recommendation || "") : "";
    const stateText = pfBool(this._config, "show_status_state") ? `<span>${active ? esc(t.ventilate) : esc(t.off)}</span>` : "";
    return `<button class="status ${active ? "active" : "inactive"}" data-kind="${kind}" ${entity ? "" : "disabled"}><div class="status-icon">${icon}</div><div class="status-copy"><strong>${esc(label)}</strong>${stateText}${reason ? `<small>${esc(reason)}</small>` : ""}</div><div class="dot"></div></button>`;
  }

  _styles() {
    return `
      :host { display:block; height:100%; }
      ha-card.pf-card { height:100%; box-sizing:border-box; overflow:hidden; border-radius:var(--ha-card-border-radius,16px); }
      .empty { padding:20px; color:var(--secondary-text-color); }

      /* Color modes */
      .color-auto { color:#fff; --pf-accent:#fff; }
      .color-auto.status-both { background:linear-gradient(135deg,#0f766e,#047857 55%,#065f46); }
      .color-auto.status-cooling { background:linear-gradient(135deg,#0369a1,#075985 55%,#0c4a6e); }
      .color-auto.status-humidity { background:linear-gradient(135deg,#15803d,#047857 55%,#065f46); }
      .color-auto.status-warm { background:linear-gradient(135deg,#c2410c,#b45309 55%,#9a3412); }
      .color-auto.status-neutral { background:linear-gradient(135deg,#475569,#334155 55%,#1e293b); }
      .color-custom { color:var(--pf-fg); background:linear-gradient(135deg,color-mix(in srgb,var(--pf-bg) 86%,#000),var(--pf-bg) 55%,color-mix(in srgb,var(--pf-bg) 76%,#000)); }
      .color-theme { color:var(--primary-text-color); background:var(--card-background-color); --pf-accent:var(--primary-color); }
      .pf-card:not(.color-theme) .hero, .pf-card:not(.color-theme) .medium-hero { color:inherit; }
      .color-theme .hero, .color-theme .medium-hero { background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color)); }
      .color-custom .hero, .color-custom .medium-hero { background:transparent; }
      .color-auto .hero, .color-auto .medium-hero { background:transparent; }

      /* Modular medium/large layout */
      .modular-card { padding:0; }
      .pf-modules { height:100%; box-sizing:border-box; padding:10px; display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); grid-auto-flow:row dense; align-content:start; gap:8px; overflow:hidden; }
      .pf-module { box-sizing:border-box; min-width:0; border-radius:12px; }
      .pf-title-module { grid-column:span 12; padding:5px 8px 0; font-size:14px; }
      .pf-advice-module { grid-column:span 7; min-height:52px; display:flex; align-items:center; gap:8px; padding:10px 12px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.14); }
      .pf-advice-module strong { min-width:0; font-size:13px; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .pf-kicker { flex:0 0 auto; width:24px; height:24px; display:grid; place-items:center; border-radius:8px; background:rgba(255,255,255,.16); }
      .pf-outdoor-module,.pf-dew-module { grid-column:span 5; min-height:52px; display:flex; align-items:center; gap:8px; padding:9px 11px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.14); }
      .pf-outdoor-module div,.pf-dew-module div { min-width:0; display:grid; }
      .pf-outdoor-module small,.pf-dew-module small,.pf-rooms-module>small { font-size:10px; opacity:.82; }
      .pf-outdoor-module strong,.pf-dew-module strong { font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .pf-weather-icon { font-size:20px; }
      .pf-window-module { grid-column:span 5; grid-row:span 2; min-height:116px; display:grid; place-items:center; padding:6px; background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.12); }
      .modular-window { width:112px; height:86px; }
      .pf-status-module { appearance:none; grid-column:span 6; min-height:68px; padding:9px 10px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:start; gap:8px; border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); text-align:left; cursor:pointer; font:inherit; }
      .pf-status-module>div { min-width:0; display:grid; gap:1px; }
      .pf-status-module strong { font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .pf-status-module span:not(.pf-status-icon) { font-size:10px; color:var(--secondary-text-color); }
      .pf-status-module small { margin-top:3px; font-size:9.5px; line-height:1.2; color:var(--secondary-text-color); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .pf-status-icon { font-size:18px; }
      .pf-status-module>i { width:8px; height:8px; margin-top:3px; border-radius:50%; background:var(--disabled-text-color); }
      .pf-status-module.active>i { background:var(--success-color,#43a047); }
      .pf-rooms-module { grid-column:span 12; padding:9px 10px; background:var(--card-background-color); color:var(--primary-text-color); border:1px solid var(--divider-color); }
      .pf-rooms-module .chips { margin-top:5px; }
      .color-theme .pf-advice-module,.color-theme .pf-outdoor-module,.color-theme .pf-dew-module,.color-theme .pf-window-module { background:color-mix(in srgb,var(--primary-color) 8%,var(--card-background-color)); border-color:var(--divider-color); }
      .color-custom .pf-status-module,.color-custom .pf-rooms-module,.color-auto .pf-status-module,.color-auto .pf-rooms-module { color:var(--primary-text-color); }
      .modular-card.medium .pf-modules { padding:8px; gap:7px; }
      .modular-card.medium .pf-title-module { display:none; }
      .modular-card.medium .pf-advice-module { grid-column:span 7; min-height:45px; padding:7px 9px; }
      .modular-card.medium .pf-outdoor-module,.modular-card.medium .pf-dew-module { min-height:45px; padding:7px 9px; }
      .modular-card.medium .pf-window-module { grid-column:span 5; grid-row:span 2; min-height:94px; }
      .modular-card.medium .modular-window { width:78px; height:60px; }
      .modular-card.medium .pf-status-module { min-height:53px; padding:7px 8px; }
      .modular-card.medium .pf-status-module small { display:none; }
      .modular-card.half .pf-modules { grid-template-columns:repeat(6,minmax(0,1fr)); gap:6px; padding:7px; }
      .modular-card.half .pf-title-module { grid-column:span 6; }
      .modular-card.half .pf-advice-module { grid-column:span 6; }
      .modular-card.half .pf-outdoor-module,.modular-card.half .pf-dew-module { grid-column:span 3; }
      .modular-card.half .pf-window-module { grid-column:span 3; min-height:86px; }
      .modular-card.half .pf-status-module { grid-column:span 3; min-height:53px; }
      .modular-card.half .pf-rooms-module { grid-column:span 6; }
      .modular-card.half.medium .pf-window-module { min-height:65px; }
      .modular-card.half.medium .modular-window { width:58px; height:45px; }
      .modular-card.half.medium .pf-outdoor-module,.modular-card.half.medium .pf-dew-module { min-height:38px; }
      .modular-card.half.medium .pf-advice-module { min-height:38px; }
      .modular-card.half.medium .pf-status-module { min-height:44px; }

      /* Free-position medium/large layout */
      .positioned-card { position:relative; }
      .pf-free-stage { position:relative; width:100%; height:100%; min-height:100%; overflow:hidden; }
      .pf-free { position:absolute; transform:translate(-50%,-50%); z-index:1; box-sizing:border-box; min-width:0; }
      .pf-free-title { max-width:42%; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .pf-free-advice { width:min(36%,270px); min-height:44px; display:flex; align-items:center; gap:8px; padding:9px 11px; border-radius:12px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.14); }
      .pf-free-advice strong { min-width:0; font-size:12px; line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .pf-free-outdoor,.pf-free-dew { width:min(28%,220px); min-height:46px; display:flex; align-items:center; gap:7px; padding:8px 10px; border-radius:12px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.14); }
      .pf-free-outdoor>div,.pf-free-dew>div { min-width:0; display:grid; }
      .pf-free-outdoor small,.pf-free-dew small,.pf-free-rooms>small { font-size:9px; opacity:.82; }
      .pf-free-outdoor strong,.pf-free-dew strong { font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .pf-free-window { width:170px; height:130px; display:grid; place-items:center; }
      .free-window { width:150px; height:114px; }
      .pf-free-status { width:min(30%,230px); }
      .pf-free-status .pf-status-module { width:100%; min-height:58px; }
      .pf-free-rooms { width:min(38%,300px); padding:9px 10px; border-radius:12px; background:var(--card-background-color); color:var(--primary-text-color); border:1px solid var(--divider-color); }
      .pf-free-rooms .chips { margin-top:5px; }
      .color-theme .pf-free-advice,.color-theme .pf-free-outdoor,.color-theme .pf-free-dew { background:color-mix(in srgb,var(--primary-color) 8%,var(--card-background-color)); border-color:var(--divider-color); }
      .positioned-card.half .pf-free-title { max-width:48%; }
      .positioned-card.half .pf-free-advice { width:42%; padding:7px 8px; }
      .positioned-card.half .pf-free-outdoor,.positioned-card.half .pf-free-dew { width:38%; padding:7px 8px; }
      .positioned-card.half .pf-free-window { width:118px; height:94px; }
      .positioned-card.half .free-window { width:104px; height:80px; }
      .positioned-card.half .pf-free-status { width:42%; }
      .positioned-card.half .pf-free-rooms { width:78%; }
      .positioned-card.medium .pf-free-window { width:110px; height:86px; }
      .positioned-card.medium .free-window { width:94px; height:72px; }
      .positioned-card.medium .pf-free-status .pf-status-module { min-height:48px; padding:7px 8px; }
      .positioned-card.medium .pf-status-module small { -webkit-line-clamp:1; }
      .positioned-card.medium .pf-free-advice strong { -webkit-line-clamp:2; }
      .positioned-card.medium .pf-free-rooms { padding:6px 8px; }
      .positioned-card.medium .chip { font-size:9px; padding:3px 6px; }

      /* Compact */
      .compact-row { min-height:56px; height:100%; padding:7px 12px; box-sizing:border-box; display:flex; align-items:center; gap:10px; }
      .compact-title { font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
      .compact-weather { display:flex; gap:6px; align-items:center; white-space:nowrap; font-size:12px; }
      .compact-title + .compact-weather { margin-left:4px; }
      .compact-row > .compact-weather:first-child { margin-left:0; }
      .compact-flags { display:flex; gap:4px; margin-left:auto; }
      .mini-flag { width:23px; height:23px; display:grid; place-items:center; border-radius:7px; background:rgba(255,255,255,.12); opacity:.55; font-size:13px; }
      .color-theme .mini-flag { background:var(--secondary-background-color); }
      .mini-flag.active { opacity:1; background:rgba(255,255,255,.27); box-shadow:inset 0 0 0 1px rgba(255,255,255,.22); }
      .color-theme .mini-flag.active { background:color-mix(in srgb,var(--primary-color) 18%,var(--card-background-color)); }
      .compact-action { margin-left:auto; min-width:0; display:flex; gap:6px; align-items:center; padding:6px 9px; border-radius:10px; background:rgba(255,255,255,.16); }
      .color-theme .compact-action { background:var(--secondary-background-color); }
      .compact-action strong { font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .compact-action.active { background:rgba(255,255,255,.27); box-shadow:inset 0 0 0 1px rgba(255,255,255,.2); }
      .compact-card.half .compact-title { max-width:70px; }
      .compact-card.half .compact-flags { display:none; }
      .compact-card.half .compact-action strong { max-width:130px; }

      /* Medium */
      .medium-card { display:grid; grid-template-rows:minmax(0,1fr) auto; }
      .medium-hero { min-height:108px; padding:12px 15px 7px; display:flex; box-sizing:border-box; align-items:center; justify-content:space-between; gap:14px; }
      .medium-copy { min-width:0; display:grid; gap:4px; }
      .medium-title { font-size:14px; font-weight:700; }
      .advice { font-size:14px; font-weight:700; line-height:1.25; }
      .medium-copy .advice { font-size:13px; }
      .medium-weather { display:flex; gap:6px; align-items:center; font-size:11px; opacity:.94; }
      .medium-window { width:92px !important; height:70px !important; flex:0 0 auto; }
      .medium-status-grid { background:var(--card-background-color); color:var(--primary-text-color); padding:8px 10px 10px; display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:7px; }
      .medium-status { appearance:none; border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); border-radius:10px; min-height:46px; padding:7px 9px; display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:7px; text-align:left; cursor:pointer; font:inherit; }
      .medium-status-icon { font-size:17px; }
      .medium-status > span:nth-child(2) { min-width:0; display:grid; }
      .medium-status strong { font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .medium-status small { font-size:10px; color:var(--secondary-text-color); }
      .medium-status i { width:8px; height:8px; border-radius:50%; background:var(--disabled-text-color); }
      .medium-status.active i { background:var(--success-color,#43a047); }
      .medium-card.half .medium-hero { padding-inline:11px; gap:8px; }
      .medium-card.half .medium-window { width:72px !important; height:57px !important; }
      .medium-card.half .medium-copy .advice { font-size:12px; }

      /* Large */
      .hero { position:relative; padding:20px; overflow:hidden; }
      .hero::after { content:""; position:absolute; inset:0; background:radial-gradient(circle at 78% 16%,rgba(255,255,255,.16),transparent 36%); pointer-events:none; }
      .color-theme .hero::after { opacity:.25; }
      .topbar { position:relative; z-index:2; display:flex; justify-content:space-between; align-items:flex-start; gap:14px; }
      .headline { min-width:0; display:grid; gap:5px; }
      .title { font-size:15px; font-weight:700; }
      .outside-pill { display:flex; gap:9px; align-items:center; border-radius:14px; padding:9px 11px; white-space:nowrap; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.2); }
      .color-theme .outside-pill { background:var(--card-background-color); border-color:var(--divider-color); }
      .outside-pill div { display:grid; font-size:11px; line-height:1.25; }
      .outside-pill span { opacity:.92; }
      .weather-icon { font-size:22px; }
      .scene { position:relative; z-index:1; min-height:172px; display:flex; align-items:center; justify-content:center; }
      .outside-copy { position:absolute; left:0; top:50%; transform:translateY(-50%); max-width:145px; display:grid; gap:6px; font-size:11px; opacity:.92; }

      /* Window */
      .window-wrap { width:180px; height:138px; perspective:700px; }
      .window-frame { position:relative; width:100%; height:100%; border:7px solid rgba(255,255,255,.92); border-radius:5px; box-sizing:border-box; box-shadow:0 12px 28px rgba(0,0,0,.18); background:linear-gradient(#bae6fd,#e0f2fe 58%,#bbf7d0 59%,#86efac); overflow:visible; }
      .color-theme .window-frame { border-color:color-mix(in srgb,var(--primary-text-color) 70%,transparent); }
      .pane { position:absolute; top:0; bottom:0; width:50%; background:rgba(186,230,253,.28); border:2px solid rgba(255,255,255,.85); box-sizing:border-box; transition:transform .55s cubic-bezier(.2,.8,.2,1); transform-style:preserve-3d; }
      .left { left:0; transform-origin:left center; } .right { right:0; transform-origin:right center; }
      .window-wrap.open .pane.left { transform:rotateY(-58deg); box-shadow:8px 5px 15px rgba(0,0,0,.18); }
      .window-wrap.open .pane.right { transform:rotateY(58deg); box-shadow:-8px 5px 15px rgba(0,0,0,.18); }
      .handle { position:absolute; top:48%; width:3px; height:18px; border-radius:3px; background:rgba(255,255,255,.95); }
      .left .handle { right:7px; } .right .handle { left:7px; }
      .medium-window .handle { width:2px; height:10px; }
      .medium-window .left .handle { right:4px; } .medium-window .right .handle { left:4px; }
      .breeze { position:absolute; inset:18px 12px; z-index:2; opacity:0; transition:opacity .3s ease; overflow:hidden; }
      .medium-window .breeze { inset:8px 6px; }
      .window-wrap.open .breeze { opacity:1; }
      .breeze i { position:absolute; left:-55px; width:70px; height:15px; border-top:2px solid rgba(255,255,255,.78); border-radius:50%; animation:pf-breeze 2.3s linear infinite; }
      .breeze i:nth-child(1) { top:17px; }
      .breeze i:nth-child(2) { top:45px; animation-delay:.7s; width:52px; }
      .breeze i:nth-child(3) { top:73px; animation-delay:1.3s; width:62px; }
      .medium-window .breeze i { width:38px; height:8px; }
      .medium-window .breeze i:nth-child(1) { top:7px; }
      .medium-window .breeze i:nth-child(2) { top:22px; width:30px; }
      .medium-window .breeze i:nth-child(3) { top:37px; width:34px; }
      @keyframes pf-breeze { from { transform:translateX(0); opacity:0; } 25% { opacity:1; } to { transform:translateX(190px); opacity:0; } }
      @media (prefers-reduced-motion:reduce) { .pane,.breeze i { transition:none !important; animation:none !important; } }

      /* Content */
      .content { background:var(--card-background-color); color:var(--primary-text-color); padding:14px 16px 16px; display:grid; gap:14px; }
      .status-grid { display:grid; gap:10px; }
      .status-grid.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .status-grid.one { grid-template-columns:1fr; }
      .status { appearance:none; border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); border-radius:13px; padding:12px; display:grid; grid-template-columns:auto 1fr auto; align-items:start; gap:10px; text-align:left; cursor:pointer; font:inherit; }
      .status:hover,.medium-status:hover { background:color-mix(in srgb,var(--card-background-color) 92%,var(--primary-color)); }
      .status:disabled,.medium-status:disabled { cursor:default; opacity:.5; }
      .status.active { border-color:color-mix(in srgb,var(--success-color,#2e7d32) 55%,var(--divider-color)); }
      .status-icon { font-size:21px; }
      .status-copy { min-width:0; display:grid; gap:2px; }
      .status-copy strong { font-size:13px; }
      .status-copy span { font-size:12px; color:var(--secondary-text-color); }
      .status-copy small { margin-top:4px; font-size:10px; line-height:1.25; color:var(--secondary-text-color); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .dot { width:9px; height:9px; border-radius:50%; margin-top:4px; background:var(--disabled-text-color); }
      .active .dot { background:var(--success-color,#43a047); box-shadow:0 0 0 4px color-mix(in srgb,var(--success-color,#43a047) 18%,transparent); }
      .rooms { display:grid; gap:7px; }
      .rooms-label { font-size:11px; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.05em; }
      .chips { display:flex; gap:6px; flex-wrap:wrap; }
      .chip { font-size:11px; padding:5px 9px; border-radius:999px; background:color-mix(in srgb,var(--primary-color) 12%,var(--card-background-color)); color:var(--primary-text-color); }
      .chip.muted { background:var(--secondary-background-color); color:var(--secondary-text-color); }

      .large-card.half .hero { padding:16px; }
      .large-card.half .scene { min-height:154px; }
      .large-card.half .window-wrap { width:132px; height:102px; }
      .large-card.half .outside-copy { max-width:105px; }
      .large-card.half .content { padding:10px 12px 12px; gap:10px; }

      @media (max-width:430px) {
        .compact-row { gap:7px; padding-inline:9px; }
        .compact-title { max-width:70px; }
        .compact-flags { display:none; }
        .compact-action strong { max-width:120px; }
        .hero { padding:16px; }
        .topbar { gap:8px; }
        .outside-pill { padding:7px 8px; }
        .scene { min-height:150px; }
        .outside-copy { max-width:105px; }
        .status-grid.two { grid-template-columns:1fr; }
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
    this._renderSignature = null;
    this._hasRendered = false;
  }

  _structureSignature(hass = this._hass) {
    if (!hass) return "";
    const language = pfLanguage(hass);
    const instances = findPenguFreshInstances(hass)
      .map((item) => [item.id, item.name, item.humidity || "", item.cooling || ""].join("|"))
      .sort().join(";");
    return `${language}::${instances}`;
  }

  set hass(hass) {
    this._hass = hass;
    const signature = this._structureSignature(hass);
    if (!this._hasRendered || signature !== this._renderSignature) {
      this._renderSignature = signature;
      this._render();
    }
  }

  setConfig(config) {
    const nextConfig = { type: "custom:pengufresh-card", ...config };
    const changed = JSON.stringify(nextConfig) !== JSON.stringify(this._config);
    this._config = nextConfig;
    if (changed || !this._hasRendered) this._render();
  }

  _fireConfigChanged(config) {
    const nextConfig = { type: "custom:pengufresh-card", ...config };
    this._config = nextConfig;
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: nextConfig };
    this.dispatchEvent(event);
  }

  _toggle(key, label) {
    return `<label class="toggle"><input type="checkbox" data-setting="${key}" ${pfBool(this._config, key) ? "checked" : ""}><span>${esc(label)}</span></label>`;
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const t = PF_I18N[pfLanguage(this._hass)];
    const instances = findPenguFreshInstances(this._hass);
    const currentEntry =
      this._hass.states[this._config.humidity_entity]?.attributes?.pengufresh_entry_id ||
      this._hass.states[this._config.cooling_entity]?.attributes?.pengufresh_entry_id || "";
    const currentLayout = pfLayoutKey(this._config);
    const colorMode = pfValue(this._config, "color_mode");

    this.shadowRoot.innerHTML = `
      <div class="editor">
        <label class="field"><span>${esc(t.editorTitle)}</span><select id="instance" ${instances.length ? "" : "disabled"}>${instances.length ? instances.map((item) => `<option value="${esc(item.id)}" ${item.id === currentEntry ? "selected" : ""}>${esc(pfCleanInstanceName(item.name) || item.name)}</option>`).join("") : `<option>${esc(t.noInstance)}</option>`}</select></label>
        <label class="field"><span>${esc(t.layout)}</span><select id="layout">${pfLayoutOptions(t).map(([value,label]) => `<option value="${value}" ${value === currentLayout ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label>
        <div class="hint">${esc(t.layoutHint)}</div>

        <section><h3>${esc(t.content)}</h3><div class="toggles">
          ${this._toggle("show_title", t.showTitle)}
          ${this._toggle("show_advice", t.showAdvice)}
          ${this._toggle("show_outdoor", t.showOutdoor)}
          ${this._toggle("show_dew_point", t.showDewPoint)}
          ${this._toggle("show_window", t.showWindow)}
          ${this._toggle("show_humidity", t.showHumidity)}
          ${this._toggle("show_cooling", t.showCooling)}
          ${this._toggle("show_rooms", t.showRooms)}
          ${this._toggle("show_status_state", t.showStatusState)}
          ${this._toggle("show_humidity_reason", t.showHumidityReason)}
          ${this._toggle("show_cooling_reason", t.showCoolingReason)}
        </div></section>

        <label class="field"><span>${esc(t.customTitle)}</span><input id="title" type="text" value="${esc(this._config.title || "")}" placeholder="${esc(pfCleanInstanceName(instances.find((x) => x.id === currentEntry)?.name || "Wohnung"))}"></label>

        <section><h3>${esc(t.texts)}</h3><div class="text-grid">
          ${this._textField("text_open_both", t.textOpenBoth, t.openBoth)}
          ${this._textField("text_open_humidity", t.textOpenHumidity, t.openHumidity)}
          ${this._textField("text_open_cooling", t.textOpenCooling, t.openCooling)}
          ${this._textField("text_keep_closed", t.textKeepClosed, t.keepClosed)}
          ${this._textField("text_outdoor", t.textOutdoor, t.outdoor)}
          ${this._textField("text_dew_point", t.textDewPoint, t.dewPoint)}
          ${this._textField("text_humidity", t.textHumidity, t.humidity)}
          ${this._textField("text_cooling", t.textCooling, t.cooling)}
          ${this._textField("text_rooms", t.textRooms, t.rooms)}
          ${this._textField("text_ventilate", t.textVentilate, t.ventilate)}
          ${this._textField("text_off", t.textOff, t.off)}
        </div><div class="hint">${esc(t.textsHint)}</div></section>

        <section><h3>${esc(t.colors)}</h3>
          <label class="field"><span>${esc(t.colorMode)}</span><select id="color-mode">
            <option value="auto" ${colorMode === "auto" ? "selected" : ""}>${esc(t.colorAuto)}</option>
            <option value="theme" ${colorMode === "theme" ? "selected" : ""}>${esc(t.colorTheme)}</option>
            <option value="custom" ${colorMode === "custom" ? "selected" : ""}>${esc(t.colorCustom)}</option>
          </select></label>
          ${colorMode === "auto" ? `<div class="hint">${esc(t.autoColorHint)}</div>` : ""}
          ${colorMode === "custom" ? `<div class="color-grid">
            ${this._colorField("background_color", t.backgroundColor, pfValue(this._config,"background_color"))}
            ${this._colorField("text_color", t.textColor, pfValue(this._config,"text_color"))}
            ${this._colorField("accent_color", t.accentColor, pfValue(this._config,"accent_color"))}
          </div>` : ""}
        </section>

        <section><div class="section-head"><h3>${esc(t.arrangement)}</h3><button type="button" id="reset-positions" class="text-button">${esc(t.resetArrangement)}</button></div>
          <div id="position-stage" class="position-stage ${currentLayout.startsWith("half_") ? "half" : "full"}">${this._positionBuilder(t, currentLayout)}</div>
          <div class="hint">${esc(t.arrangementHint)}</div>
        </section>
      </div>
      <style>
        .editor { display:grid; gap:16px; padding:8px 0; color:var(--primary-text-color); }
        .field { display:grid; gap:6px; }
        .field > span { font-size:12px; color:var(--secondary-text-color); }
        select,input[type="text"] { box-sizing:border-box; width:100%; min-height:44px; padding:0 12px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; }
        section { display:grid; gap:10px; padding-top:2px; }
        h3 { margin:0; font-size:13px; }
        .toggles { display:grid; gap:4px; border:1px solid var(--divider-color); border-radius:10px; padding:5px 10px; }
        .toggle { min-height:34px; display:flex; align-items:center; gap:9px; font-size:13px; cursor:pointer; }
        .toggle input { width:17px; height:17px; accent-color:var(--primary-color); }
        .hint { font-size:12px; color:var(--secondary-text-color); line-height:1.4; }
        .color-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
        .text-grid { display:grid; gap:8px; }
        .text-field { display:grid; gap:4px; }
        .text-field span { font-size:11px; color:var(--secondary-text-color); }
        .text-field input { min-height:40px; }
        .section-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .text-button { appearance:none; border:0; background:none; color:var(--primary-color); font:inherit; font-size:12px; cursor:pointer; padding:4px 0; }
        .position-stage { position:relative; height:250px; overflow:hidden; border:1px dashed var(--divider-color); border-radius:12px; background-color:var(--secondary-background-color); background-image:linear-gradient(to right,color-mix(in srgb,var(--divider-color) 55%,transparent) 1px,transparent 1px),linear-gradient(to bottom,color-mix(in srgb,var(--divider-color) 55%,transparent) 1px,transparent 1px); background-size:24px 24px; touch-action:none; }
        .position-stage.half { max-width:330px; margin-inline:auto; }
        .position-label { position:absolute; transform:translate(-50%,-50%); user-select:none; touch-action:none; cursor:grab; padding:7px 11px; border-radius:999px; border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); box-shadow:0 2px 6px rgba(0,0,0,.08); font-size:11px; font-weight:600; white-space:nowrap; }
        .position-label:active { cursor:grabbing; box-shadow:0 4px 12px rgba(0,0,0,.14); }
        .position-empty { position:absolute; inset:0; display:grid; place-items:center; color:var(--secondary-text-color); font-size:18px; }
        .color-field { display:grid; gap:5px; font-size:11px; color:var(--secondary-text-color); }
        input[type="color"] { width:100%; height:40px; padding:3px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); cursor:pointer; }
      </style>`;

    this._hasRendered = true;
    this._renderSignature = this._structureSignature();

    if (instances.length && !currentEntry) {
      const first = instances[0];
      queueMicrotask(() => this._fireConfigChanged({ ...this._config, humidity_entity:first.humidity, cooling_entity:first.cooling }));
    }

    this.shadowRoot.querySelector("#instance")?.addEventListener("change", (event) => {
      const item = instances.find((instance) => instance.id === event.target.value);
      if (!item) return;
      this._fireConfigChanged({ ...this._config, humidity_entity:item.humidity, cooling_entity:item.cooling });
    });

    this.shadowRoot.querySelector("#layout")?.addEventListener("change", (event) => {
      const layout = event.target.value;
      const preset = PF_LAYOUTS[layout] || PF_LAYOUTS[PF_DEFAULT_LAYOUT];
      this._fireConfigChanged({ ...this._config, layout, grid_options:{ columns:preset.columns, rows:preset.rows } });
    });

    this.shadowRoot.querySelectorAll("[data-setting]").forEach((input) => {
      input.addEventListener("change", (event) => {
        this._fireConfigChanged({ ...this._config, [event.target.dataset.setting]:event.target.checked });
      });
    });

    this.shadowRoot.querySelector("#title")?.addEventListener("change", (event) => {
      const value = event.target.value.trim();
      const next = { ...this._config };
      if (value) next.title = value; else delete next.title;
      this._fireConfigChanged(next);
    });

    this.shadowRoot.querySelector("#color-mode")?.addEventListener("change", (event) => {
      this._fireConfigChanged({ ...this._config, color_mode:event.target.value });
    });

    this.shadowRoot.querySelectorAll("[data-color]").forEach((input) => {
      input.addEventListener("change", (event) => {
        this._fireConfigChanged({ ...this._config, [event.target.dataset.color]:event.target.value });
      });
    });

    this.shadowRoot.querySelectorAll("[data-text-setting]").forEach((input) => {
      input.addEventListener("change", (event) => {
        const key = event.target.dataset.textSetting;
        const value = event.target.value.trim();
        const next = { ...this._config };
        if (value) next[key] = value; else delete next[key];
        this._fireConfigChanged(next);
      });
    });

    this._bindPositionDrag(currentLayout);
    this.shadowRoot.querySelector("#reset-positions")?.addEventListener("click", () => {
      const positions = { ...(this._config.positions || {}) };
      delete positions[currentLayout];
      const next = { ...this._config, positions };
      if (!Object.keys(positions).length) delete next.positions;
      this._fireConfigChanged(next);
    });
  }

  _textField(key, label, placeholder) {
    return `<label class="text-field"><span>${esc(label)}</span><input type="text" data-text-setting="${key}" value="${esc(this._config[key] || "")}" placeholder="${esc(placeholder)}"></label>`;
  }

  _positionBuilder(t, layoutKey) {
    const labels = { title:t.blockTitle, advice:t.blockAdvice, outdoor:t.blockOutdoor, dew:t.blockDew, window:t.blockWindow, humidity:t.blockHumidity, cooling:t.blockCooling, rooms:t.blockRooms };
    const visible = {
      title:pfBool(this._config,"show_title"),
      advice:pfBool(this._config,"show_advice"),
      outdoor:pfBool(this._config,"show_outdoor"),
      dew:pfBool(this._config,"show_dew_point") && pfBool(this._config,"show_outdoor"),
      window:pfBool(this._config,"show_window"),
      humidity:pfBool(this._config,"show_humidity"),
      cooling:pfBool(this._config,"show_cooling"),
      rooms:pfBool(this._config,"show_rooms"),
    };
    const positions = pfPositionMap(this._config, layoutKey);
    const activeBlocks = PF_BLOCKS.filter((key) => visible[key]);
    if (!activeBlocks.length) {
      return `<div class="position-empty">–</div>`;
    }
    return activeBlocks
      .map((key) => `<div class="position-label" data-block="${key}" style="${pfPositionStyle(positions[key])}">${esc(labels[key])}</div>`)
      .join("");
  }

  _bindPositionDrag(layoutKey) {
    const stage = this.shadowRoot.querySelector("#position-stage");
    if (!stage) return;

    let activeItem = null;
    let activePointerId = null;
    let latestPosition = null;

    const updatePosition = (event) => {
      if (!activeItem || event.pointerId !== activePointerId) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(3, Math.min(97, ((event.clientY - rect.top) / rect.height) * 100));
      latestPosition = { x, y };
      activeItem.style.left = `${x}%`;
      activeItem.style.top = `${y}%`;
    };

    const finishDrag = (event) => {
      if (!activeItem || event.pointerId !== activePointerId) return;
      const item = activeItem;
      const block = item.dataset.block;
      const pointerId = activePointerId;
      activeItem = null;
      activePointerId = null;
      try { stage.releasePointerCapture?.(pointerId); } catch (_) {}

      if (!latestPosition || !block) {
        latestPosition = null;
        return;
      }

      const base = pfPositionMap(this._config, layoutKey);
      base[block] = {
        x:Number(latestPosition.x.toFixed(2)),
        y:Number(latestPosition.y.toFixed(2)),
      };
      latestPosition = null;
      const positions = { ...(this._config.positions || {}), [layoutKey]:base };
      this._fireConfigChanged({ ...this._config, positions });
    };

    stage.addEventListener("pointerdown", (event) => {
      const item = event.target.closest?.(".position-label");
      if (!item || !stage.contains(item)) return;
      event.preventDefault();
      activeItem = item;
      activePointerId = event.pointerId;
      latestPosition = null;
      try { stage.setPointerCapture?.(event.pointerId); } catch (_) {}
      updatePosition(event);
    });
    stage.addEventListener("pointermove", updatePosition);
    stage.addEventListener("pointerup", finishDrag);
    stage.addEventListener("pointercancel", finishDrag);
  }

  _colorField(key, label, value) {
    return `<label class="color-field"><span>${esc(label)}</span><input type="color" data-color="${key}" value="${esc(pfSafeColor(value,PF_DEFAULTS[key]))}"></label>`;
  }
}

customElements.define("pengufresh-card", PenguFreshCard);
customElements.define("pengufresh-card-editor", PenguFreshCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "pengufresh-card")) {
  window.customCards.push({
    type: "pengufresh-card",
    name: "PenguFresh",
    description: "Configurable ventilation recommendation card with adaptive layouts and animated window.",
    preview: true,
    getEntitySuggestion: (hass, entityId) => {
      const pair = pairForEntity(hass, entityId);
      if (!pair) return null;
      const preset = PF_LAYOUTS[PF_DEFAULT_LAYOUT];
      return { config:{ type:"custom:pengufresh-card", humidity_entity:pair.humidity, cooling_entity:pair.cooling, layout:PF_DEFAULT_LAYOUT, grid_options:{ columns:preset.columns, rows:preset.rows } } };
    },
  });
}

console.info(`%c PenguFresh Card %c ${PENGUFRESH_CARD_VERSION} `, "color:#fff;background:#0f766e;font-weight:700", "color:#0f766e;background:#e6fffb");
