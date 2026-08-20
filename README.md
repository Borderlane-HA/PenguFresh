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
