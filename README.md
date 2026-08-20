<p align="center">
  <img src="https://raw.githubusercontent.com/Borderlane-HA/PenguFresh/main/docs/images/pengufresh-banner.png" alt="PenguFresh – smart ventilation recommendations for Home Assistant" width="100%">
</p>

# PenguFresh

**PenguFresh** is a Home Assistant integration for clear **ventilate / do not ventilate** recommendations. It combines indoor and outdoor **temperature**, **relative humidity**, **absolute humidity** and **dew point** instead of exposing separate competing recommendations.

| 🪟 One clear decision | 🌡️ Cooling | 💧 Dehumidifying | 🏠 Profiles |
|---|---|---|---|
| One ventilation status per room | Uses useful indoor/outdoor temperature difference | Verifies that outdoor air can really remove moisture | Apartment, Basement, Garage and Room |

Each configured room creates its own **Ventilate** binary sensor. Every PenguFresh instance also creates one **overall Ventilate** sensor that turns on when at least one room should be ventilated. The reason is available as entity attributes, for example **Cooling**, **Dehumidifying**, or **Cooling and dehumidifying**.

The default desired relative humidity in 0.4 is **50 %**. This is only the indoor target: PenguFresh still checks absolute humidity before recommending ventilation for moisture control.

## Installation via HACS

1. Open **HACS** in Home Assistant.
2. Open **⋮ → Custom repositories**.
3. Add `https://github.com/Borderlane-HA/PenguFresh` and select **Integration**.
4. Install **PenguFresh** and restart Home Assistant.
5. Go to **Settings → Devices & services → Integrations → Add integration**.
6. Search for **PenguFresh** and complete the setup.

## Configuration

Starting with **0.4.0**, PenguFresh is managed as a normal Home Assistant integration:

**Settings → Devices & services → Integrations → PenguFresh → Configure**

From there you can edit outdoor sensors and limits, add/edit/remove indoor rooms, and change the profile without searching through the Helpers view.

## Dashboard card

PenguFresh includes its own dashboard card:

**Edit dashboard → Add card → PenguFresh**

Choose the PenguFresh instance, then choose either **Overall** or a specific room. Two fixed card sizes are available:

- **Small – 6 columns × 1 row**
- **Large – 6 columns × 2 rows**

The window icon opens when ventilation is recommended and closes when it is not. A **green status** means ventilate, a **red status** means keep the windows closed. Small reason icons show whether the recommendation comes from **cooling**, **dehumidifying**, or both.

## Upgrade from 0.3.x

Existing PenguFresh instances are migrated automatically. The previous separate **Ventilate for temperature** and **Ventilate for humidity** entities are replaced by the new combined room and overall ventilation entities. Old profile-default humidity values are migrated to the new **50 %** target; non-default custom humidity values are preserved.

---

<p align="center">
  <strong>PenguFresh</strong> · Smart ventilation decisions for Home Assistant<br>
  <a href="https://github.com/Borderlane-HA/PenguFresh">GitHub repository</a> · <a href="https://github.com/Borderlane-HA/PenguFresh/issues">Issues</a>
</p>
