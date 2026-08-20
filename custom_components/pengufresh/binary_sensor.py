"""Binary sensors for PenguFresh."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .calculations import celsius_to_unit, delta_c_to_unit
from .const import (
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_ROOMS,
    DOMAIN,
    LANG_AUTO,
)
from .coordinator import PenguFreshCoordinator, merged_config


TEXT = {
    "de": {
        "ventilate": "Lüften",
        "do_not_ventilate": "Nicht lüften",
        "overall": "Lüften",
        "room_suffix": "Lüften",
        "profiles": {
            "apartment": "Wohnung",
            "basement": "Keller",
            "garage": "Garage",
            "room": "Raum / Allgemein",
        },
        "reasons": {
            "cooling": "Abkühlen",
            "dehumidifying": "Entfeuchten",
            "cooling_and_dehumidifying": "Abkühlen und Entfeuchten",
            "blocked_by_moisture_guard": "Feuchteschutz blockiert das Lüften",
            "outside_not_dry_enough": "Außenluft ist nicht trocken genug",
            "outside_not_cool_enough": "Außenluft ist nicht kühl genug",
            "targets_reached": "Temperatur und Feuchtigkeit im Zielbereich",
            "no_humidity_benefit": "Kein ausreichender Feuchtigkeitsvorteil",
            "no_ventilation_benefit": "Aktuell kein ausreichender Lüftungsvorteil",
            "sensor_unavailable": "Raumsensor nicht verfügbar",
        },
    },
    "en": {
        "ventilate": "Ventilate",
        "do_not_ventilate": "Do not ventilate",
        "overall": "Ventilate",
        "room_suffix": "Ventilate",
        "profiles": {
            "apartment": "Apartment",
            "basement": "Basement",
            "garage": "Garage",
            "room": "Room / General",
        },
        "reasons": {
            "cooling": "Cooling",
            "dehumidifying": "Dehumidifying",
            "cooling_and_dehumidifying": "Cooling and dehumidifying",
            "blocked_by_moisture_guard": "Moisture guard blocks ventilation",
            "outside_not_dry_enough": "Outdoor air is not dry enough",
            "outside_not_cool_enough": "Outdoor air is not cool enough",
            "targets_reached": "Temperature and humidity are within target",
            "no_humidity_benefit": "No sufficient humidity benefit",
            "no_ventilation_benefit": "No sufficient ventilation benefit right now",
            "sensor_unavailable": "Room sensor unavailable",
        },
    },
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the binary sensors."""
    coordinator: PenguFreshCoordinator = entry.runtime_data
    config = merged_config(entry)
    entities: list[PenguFreshBinarySensor] = [OverallVentilationBinarySensor(coordinator, entry)]
    valid_unique_ids = {f"{entry.entry_id}_ventilation"}
    for room in config.get(CONF_ROOMS, []):
        room_id = str(room[CONF_ROOM_ID])
        valid_unique_ids.add(f"{entry.entry_id}_room_{room_id}_ventilation")
        entities.append(
            RoomVentilationBinarySensor(
                coordinator,
                entry,
                room_id,
                str(room[CONF_ROOM_NAME]),
            )
        )

    # Clean up room entities that were removed from the configuration.
    registry = er.async_get(hass)
    for registry_entry in er.async_entries_for_config_entry(registry, entry.entry_id):
        if (
            registry_entry.domain == "binary_sensor"
            and registry_entry.platform == DOMAIN
            and registry_entry.unique_id.startswith(f"{entry.entry_id}_room_")
            and registry_entry.unique_id not in valid_unique_ids
        ):
            registry.async_remove(registry_entry.entity_id)

    async_add_entities(entities)


class PenguFreshBinarySensor(CoordinatorEntity[PenguFreshCoordinator], BinarySensorEntity):
    """Base binary sensor."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: PenguFreshCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self.entry = entry

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self.entry.entry_id)},
            entry_type=DeviceEntryType.SERVICE,
            name=self.entry.title,
            manufacturer="PenguFresh",
            model="Ventilation advisor",
            sw_version="0.4.0",
            configuration_url="homeassistant://config/integrations/integration/pengufresh",
        )

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

    def _reason_text(self, reason_code: str) -> str:
        language = self._language()
        return TEXT[language]["reasons"].get(reason_code, reason_code)

    def _common_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        outdoor = data["outdoor"]
        settings = data["settings"]
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
            "target_temperature": round(celsius_to_unit(settings["target_temperature_c"], unit), 1),
            "target_relative_humidity": round(settings["target_relative_humidity"], 1),
            "minimum_temperature_advantage": round(delta_c_to_unit(settings["min_temperature_delta_c"], unit), 1),
            "minimum_absolute_humidity_advantage_g_m3": round(settings["min_absolute_humidity_delta"], 2),
            "temperature_moisture_guard": settings["moisture_guard"],
            "unavailable_rooms": data.get("unavailable_rooms", []),
        }


class OverallVentilationBinarySensor(PenguFreshBinarySensor):
    """Combined recommendation for the complete PenguFresh instance."""

    def __init__(self, coordinator: PenguFreshCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_ventilation"
        self._attr_translation_key = "ventilation"

    @property
    def is_on(self) -> bool | None:
        if not self.coordinator.last_update_success:
            return None
        return bool(self.coordinator.data["overall"]["recommend"])

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        overall = data["overall"]
        attrs = self._common_attributes()
        attrs.update(
            {
                "pengufresh_kind": "overall",
                "recommendation": TEXT[self._language()]["ventilate" if overall["recommend"] else "do_not_ventilate"],
                "reason_code": overall["reason_code"],
                "reason": self._reason_text(overall["reason_code"]),
                "reasons": list(overall.get("reasons", [])),
                "recommended_rooms": list(overall.get("recommended_rooms", [])),
                "room_count": len(data.get("rooms", [])),
            }
        )
        return attrs


class RoomVentilationBinarySensor(PenguFreshBinarySensor):
    """One clear ventilation recommendation for one configured room."""

    def __init__(
        self,
        coordinator: PenguFreshCoordinator,
        entry: ConfigEntry,
        room_id: str,
        room_name: str,
    ) -> None:
        super().__init__(coordinator, entry)
        self.room_id = room_id
        self.room_name = room_name
        self._attr_unique_id = f"{entry.entry_id}_room_{room_id}_ventilation"
        language = "de" if str(getattr(coordinator.hass.config, "language", "en")).lower().startswith("de") else "en"
        self._attr_name = f"{room_name} – {TEXT[language]['room_suffix']}"

    def _room(self) -> dict[str, Any] | None:
        return next(
            (room for room in self.coordinator.data.get("rooms", []) if str(room.get("id")) == self.room_id),
            None,
        )

    @property
    def available(self) -> bool:
        room = self._room()
        return bool(super().available and room and room.get("available", False))

    @property
    def is_on(self) -> bool | None:
        room = self._room()
        if room is None or not room.get("available", False):
            return None
        return bool(room["recommend"])

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        room = self._room()
        attrs = self._common_attributes()
        attrs.update(
            {
                "pengufresh_kind": "room",
                "pengufresh_room_id": self.room_id,
                "pengufresh_room": self.room_name,
            }
        )
        if room is None:
            return attrs

        attrs.update(
            {
                "recommendation": TEXT[self._language()]["ventilate" if room.get("recommend") else "do_not_ventilate"],
                "reason_code": room.get("reason_code"),
                "reason": self._reason_text(str(room.get("reason_code", ""))),
                "reasons": list(room.get("reasons", [])),
            }
        )
        if not room.get("available", False):
            return attrs

        unit = self._temperature_unit()
        attrs.update(
            {
                "indoor_temperature": round(celsius_to_unit(room["temperature_c"], unit), 1),
                "indoor_relative_humidity": round(room["relative_humidity"], 1),
                "indoor_absolute_humidity_g_m3": round(room["absolute_humidity"], 2),
                "indoor_dew_point": round(celsius_to_unit(room["dew_point_c"], unit), 1),
                "temperature_advantage": round(delta_c_to_unit(room["temperature_advantage_c"], unit), 1),
                "absolute_humidity_advantage_g_m3": round(room["absolute_humidity_advantage"], 2),
                "cooling_recommended": room["cooling_recommend"],
                "dehumidifying_recommended": room["humidity_recommend"],
                "moisture_guard_ok": room["moisture_guard_ok"],
            }
        )
        return attrs
