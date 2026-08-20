"""Binary sensors for PenguFresh."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .calculations import celsius_to_unit, delta_c_to_unit
from .const import DOMAIN, LANG_AUTO
from .coordinator import PenguFreshCoordinator


TEXT = {
    "de": {
        "humidity_on": "Lüften sinnvoll: Mindestens ein Innenraum ist feucht genug und die Außenluft kann Feuchtigkeit abführen.",
        "humidity_off": "Aktuell bringt Lüften für die Feuchteregulierung keinen ausreichenden Vorteil.",
        "temperature_on": "Lüften sinnvoll: Die Außenluft ist kühl genug, um mindestens einen Innenraum Richtung Zieltemperatur abzukühlen.",
        "temperature_off": "Aktuell bringt Lüften zum Abkühlen keinen ausreichenden Vorteil.",
        "temperature_guard": "Abkühlen wäre möglich, wird aber durch den Feuchteschutz blockiert, weil die Außenluft zu viel Feuchtigkeit eintragen würde.",
        "profiles": {"apartment": "Wohnung", "basement": "Keller", "garage": "Garage", "room": "Raum / Allgemein"},
    },
    "en": {
        "humidity_on": "Ventilation is useful: At least one indoor area is humid enough and outdoor air can remove moisture.",
        "humidity_off": "Ventilation currently provides too little benefit for humidity control.",
        "temperature_on": "Ventilation is useful: Outdoor air is cool enough to move at least one indoor area toward the target temperature.",
        "temperature_off": "Ventilation currently provides too little benefit for cooling.",
        "temperature_guard": "Cooling would otherwise be possible, but the moisture guard blocks it because outdoor air would add too much moisture.",
        "profiles": {"apartment": "Apartment", "basement": "Basement", "garage": "Garage", "room": "Room / General"},
    },
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the binary sensors."""
    coordinator: PenguFreshCoordinator = entry.runtime_data
    async_add_entities(
        [
            VentilationHumidityBinarySensor(coordinator, entry),
            VentilationTemperatureBinarySensor(coordinator, entry),
        ]
    )


class PenguFreshBinarySensor(CoordinatorEntity[PenguFreshCoordinator], BinarySensorEntity):
    """Base binary sensor."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: PenguFreshCoordinator, entry: ConfigEntry, data_key: str, translation_key: str) -> None:
        super().__init__(coordinator)
        self.entry = entry
        self.key = data_key
        self._attr_unique_id = f"{entry.entry_id}_{translation_key}"
        self._attr_translation_key = translation_key

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self.entry.entry_id)},
            entry_type=DeviceEntryType.SERVICE,
            name=self.entry.title,
            manufacturer="PenguFresh",
            model="Ventilation advisor",
            configuration_url="homeassistant://config/helpers",
        )

    @property
    def is_on(self) -> bool | None:
        if not self.coordinator.last_update_success:
            return None
        return bool(self.coordinator.data[self.key]["recommend"])

    @property
    def icon(self) -> str:
        return "mdi:window-open-variant" if self.is_on else "mdi:window-closed-variant"

    def _language(self) -> str:
        configured = self.coordinator.data.get("language", LANG_AUTO)
        if configured == LANG_AUTO:
            configured = getattr(self.hass.config, "language", "en") or "en"
        return "de" if str(configured).lower().startswith("de") else "en"

    def _temperature_unit(self) -> str:
        unit = str(self.hass.config.units.temperature_unit)
        return unit if unit else UnitOfTemperature.CELSIUS

    def _common_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        outdoor = data["outdoor"]
        unit = self._temperature_unit()
        language = self._language()
        return {
            "pengufresh_instance": self.entry.title,
            "pengufresh_entry_id": self.entry.entry_id,
            "profile": TEXT[language]["profiles"].get(data["profile"], data["profile"]),
            "profile_code": data["profile"],
            "update_interval_minutes": data["update_interval"],
            "outdoor_temperature": round(celsius_to_unit(outdoor["temperature_c"], unit), 1),
            "outdoor_temperature_unit": unit,
            "outdoor_relative_humidity": round(outdoor["relative_humidity"], 1),
            "outdoor_absolute_humidity_g_m3": round(outdoor["absolute_humidity"], 2),
            "outdoor_dew_point": round(celsius_to_unit(outdoor["dew_point_c"], unit), 1),
            "unavailable_rooms": data.get("unavailable_rooms", []),
        }


class VentilationHumidityBinarySensor(PenguFreshBinarySensor):
    """Humidity ventilation recommendation."""

    def __init__(self, coordinator: PenguFreshCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "humidity", "humidity_ventilation")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data["humidity"]
        unit = self._temperature_unit()
        language = self._language()
        rooms = []
        for room in data["rooms"]:
            rooms.append(
                {
                    "name": room["name"],
                    "recommend": room["recommend"],
                    "reason_code": room["reason_code"],
                    "temperature": round(celsius_to_unit(room["temperature_c"], unit), 1),
                    "relative_humidity": round(room["relative_humidity"], 1),
                    "absolute_humidity_g_m3": round(room["absolute_humidity"], 2),
                    "dew_point": round(celsius_to_unit(room["dew_point_c"], unit), 1),
                    "absolute_humidity_advantage_g_m3": round(room["absolute_humidity_advantage"], 2),
                }
            )
        attrs = self._common_attributes()
        attrs.update(
            {
                "recommendation": TEXT[language]["humidity_on" if data["recommend"] else "humidity_off"],
                "recommended_rooms": [room["name"] for room in data["rooms"] if room["recommend"]],
                "relative_humidity_threshold": data["max_relative_humidity"],
                "minimum_absolute_humidity_advantage_g_m3": data["min_absolute_humidity_delta"],
                "room_details": rooms,
            }
        )
        return attrs


class VentilationTemperatureBinarySensor(PenguFreshBinarySensor):
    """Cooling ventilation recommendation."""

    def __init__(self, coordinator: PenguFreshCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "temperature", "temperature_ventilation")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data["temperature"]
        unit = self._temperature_unit()
        language = self._language()
        rooms = []
        blocked = False
        for room in data["rooms"]:
            blocked = blocked or room["reason_code"] == "blocked_by_moisture_guard"
            rooms.append(
                {
                    "name": room["name"],
                    "recommend": room["recommend"],
                    "reason_code": room["reason_code"],
                    "temperature": round(celsius_to_unit(room["temperature_c"], unit), 1),
                    "relative_humidity": round(room["relative_humidity"], 1),
                    "temperature_advantage": round(delta_c_to_unit(room["temperature_advantage_c"], unit), 1),
                    "moisture_guard_ok": room["moisture_guard_ok"],
                }
            )
        if data["recommend"]:
            explanation = TEXT[language]["temperature_on"]
        elif blocked:
            explanation = TEXT[language]["temperature_guard"]
        else:
            explanation = TEXT[language]["temperature_off"]
        attrs = self._common_attributes()
        attrs.update(
            {
                "recommendation": explanation,
                "recommended_rooms": [room["name"] for room in data["rooms"] if room["recommend"]],
                "target_temperature": round(celsius_to_unit(data["target_temperature_c"], unit), 1),
                "minimum_temperature_advantage": round(delta_c_to_unit(data["min_temperature_delta_c"], unit), 1),
                "temperature_moisture_guard": data["moisture_guard"],
                "room_details": rooms,
            }
        )
        return attrs
