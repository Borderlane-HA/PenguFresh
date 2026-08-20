# PenguFresh

**PenguFresh** is a Home Assistant helper for smart ventilation recommendations. It compares indoor and outdoor temperature and humidity and uses absolute humidity and dew point to decide whether opening the windows is useful for **dehumidifying** or **cooling**. Apartment, Basement, Garage and Room profiles, multiple indoor rooms, multiple instances and °C/°F are supported.

Each PenguFresh instance creates two binary sensors:

- **Ventilate for humidity**
- **Ventilate for cooling**

They can be used in dashboards, automations, conditions and templates.

## Installation via HACS

1. Open **HACS** in Home Assistant.
2. Open **⋮ → Custom repositories**.
3. Add this GitHub repository and select **Integration**.
4. Install **PenguFresh** and restart Home Assistant.
5. Go to **Settings → Devices & services → Helpers → Create helper**.
6. Select **PenguFresh** and complete the setup.

## Where PenguFresh is managed

PenguFresh is a **helper integration**, so its instances are created, edited and removed under:

**Settings → Devices & services → Helpers**

It therefore does **not** appear like a normal hardware integration card under **Settings → Devices & services → Integrations**. This is intentional and follows Home Assistant's helper model.

For a clearer overview, each PenguFresh instance is also exposed as a **logical service device** under **Settings → Devices & services → Devices**. The two PenguFresh binary sensors are attached to that device. Configuration still remains under **Helpers**.

## PenguFresh dashboard card

The integration includes a custom dashboard card automatically. No separate frontend repository or manual resource entry is required.

In a dashboard, select **Add card → PenguFresh** and choose the PenguFresh instance in the graphical card editor. The card shows the outdoor temperature and humidity, the recommended rooms and whether the windows should be opened or kept closed. The window graphic animates when ventilation is recommended.
