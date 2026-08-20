# PenguFresh

**PenguFresh** is a Home Assistant helper for smart ventilation recommendations. It compares indoor and outdoor temperature and humidity and uses absolute humidity and dew point to decide whether opening the windows is useful for dehumidifying or cooling. Apartment, Basement, Garage and Room profiles, multiple indoor rooms, multiple instances and °C/°F are supported.

Each instance creates two binary sensors:

- **Ventilate for humidity**
- **Ventilate for cooling**

They can be used in dashboards, automations, conditions and templates.

## Installation via HACS

1. Open **HACS** in Home Assistant.
2. Open **⋮ → Custom repositories**.
3. Add `https://github.com/Borderlane-HA/PenguFresh` and select **Integration**.
4. Install **PenguFresh** and restart Home Assistant.
5. Go to **Settings → Devices & services → Helpers → Create helper**.
6. Select **PenguFresh** and complete the setup.

## Where PenguFresh is managed

PenguFresh is a **helper integration**. Its instances are created, edited and removed under:

**Settings → Devices & services → Helpers**

Because Home Assistant separates helper integrations from regular integrations, PenguFresh does **not** appear as a normal integration card under **Settings → Devices & services → Integrations**. This is expected.

Each PenguFresh instance is additionally represented as a logical PenguFresh service under **Settings → Devices & services → Devices**, with its two binary sensors attached. Configuration remains under **Helpers**.

## Dashboard card

PenguFresh includes its own dashboard card. After installation and a Home Assistant restart, open a dashboard and select:

**Edit dashboard → Add card → PenguFresh**

Choose a PenguFresh instance in the card editor. The card shows the outdoor climate, recommended rooms, humidity/cooling status and an animated window that opens or closes according to the current ventilation recommendation.

The card editor also provides six layout presets for Sections dashboards:

- Full width: Compact (1 row), Medium (3 rows), Large (6 rows)
- Half width: Compact (6 columns × 1 row), Medium (6 columns × 3 rows), Large (6 columns × 6 rows)

Smaller layouts intentionally show fewer details. Manual card resizing is still possible; PenguFresh adapts its information density to the selected grid size.

The visual card editor also lets you choose which elements are shown (title, recommendation, outdoor values, dew point, animated window, humidity/cooling status, recommended rooms and detailed reasons). The PenguFresh branding is hidden in the dashboard card by default; an optional room/instance title can be enabled.

From version **0.2.7**, medium and large cards use a **free-position editor**. Recommendation, outdoor values, dew point, window, humidity, cooling and rooms appear as draggable labels on a layout surface and can be placed freely for each card size. Positions are stored separately for each layout preset. Compact 1-row layouts continue to use their optimized automatic arrangement.

Detailed humidity and cooling reasons are **hidden by default** and can be enabled separately. The short `Ventilate / not needed` status can also be hidden. The **Texts** section allows recommendation messages and short labels/status texts to be overridden per dashboard card. Empty fields use PenguFresh's automatic German/English translations.

Three color modes are available: **automatic status colors**, **Home Assistant theme**, or **custom colors** using color pickers for background, text and accent. Automatic mode changes the card color depending on the current recommendation, for example cooling, dehumidifying, both, or keeping the windows closed because outdoor air is too warm.

The card editor does not refresh its controls on normal Home Assistant state updates, so open dropdowns remain stable while sensor values update in the background.

### If the card was installed before 0.2.2

After updating, restart Home Assistant and perform a full browser reload. The card configuration must contain `type: custom:pengufresh-card`; PenguFresh adds this automatically from 0.2.2 onward.
