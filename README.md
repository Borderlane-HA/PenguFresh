# PenguFresh

**PenguFresh** is a Home Assistant custom integration that helps determine when ventilation is useful for **humidity control** or **cooling**.

It compares indoor and outdoor temperature and humidity, uses absolute humidity and dew point for moisture decisions, supports Apartment, Basement, Garage and Room profiles, multiple indoor sensors, multiple instances, and automatic °C/°F handling.

Each instance provides two binary sensors that can be used directly in dashboards and automations:

- **Ventilate for humidity**
- **Ventilate for cooling**

## Installation via HACS

1. Open **HACS** in Home Assistant.
2. Open the **⋮** menu and select **Custom repositories**.
3. Add the URL of this GitHub repository.
4. Select **Integration** as the repository type.
5. Search for **PenguFresh** and install it.
6. Restart Home Assistant.
7. Go to **Settings → Devices & services → Add integration**.
8. Search for **PenguFresh** and complete the setup.

Configuration can be changed later via **Settings → Devices & services → PenguFresh → Configure**.
