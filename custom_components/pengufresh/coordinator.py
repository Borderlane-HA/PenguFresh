"""Coordinator for PenguFresh."""

from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .calculations import absolute_humidity_gm3, dew_point_c, temperature_to_celsius
from .const import (
    CONF_ABSOLUTE_HUMIDITY_HYSTERESIS,
    CONF_HUMIDITY_HYSTERESIS,
    CONF_LANGUAGE,
    CONF_MAX_RELATIVE_HUMIDITY,
    CONF_MIN_ABSOLUTE_HUMIDITY_DELTA,
    CONF_MIN_TEMPERATURE_DELTA_C,
    CONF_OBJECT_TYPE,
    CONF_OUTDOOR_HUMIDITY,
    CONF_OUTDOOR_TEMPERATURE,
    CONF_ROOM_HUMIDITY,
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_ROOM_TEMPERATURE,
    CONF_ROOMS,
    CONF_TARGET_TEMPERATURE_C,
    CONF_TEMPERATURE_HYSTERESIS_C,
    CONF_TEMPERATURE_MOISTURE_GUARD,
    CONF_UPDATE_INTERVAL,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    LANG_AUTO,
    OBJECT_BASEMENT,
    PROFILE_DEFAULTS,
)

_LOGGER = logging.getLogger(__name__)


def merged_config(entry: ConfigEntry) -> dict[str, Any]:
    """Return entry data with options taking precedence."""
    data = dict(entry.data)
    data.update(entry.options)
    return data


class PenguFreshCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Calculate ventilation recommendations at a fixed interval."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.entry = entry
        self.config = merged_config(entry)
        interval = int(self.config.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL))
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_{entry.entry_id}",
            update_interval=timedelta(minutes=interval),
        )
        self._humidity_active: dict[str, bool] = {}
        self._temperature_active: dict[str, bool] = {}

    def _state_float(self, entity_id: str) -> tuple[float, str | None]:
        state = self.hass.states.get(entity_id)
        if state is None or state.state in {"unknown", "unavailable", "none", ""}:
            raise ValueError(f"Entity {entity_id} is unavailable")
        try:
            value = float(state.state)
        except (TypeError, ValueError) as err:
            raise ValueError(f"Entity {entity_id} is not numeric") from err
        return value, state.attributes.get("unit_of_measurement")

    async def _async_update_data(self) -> dict[str, Any]:
        config = self.config = merged_config(self.entry)
        profile = PROFILE_DEFAULTS[config[CONF_OBJECT_TYPE]]

        try:
            out_temp_raw, out_temp_unit = self._state_float(config[CONF_OUTDOOR_TEMPERATURE])
            out_temp_c = temperature_to_celsius(out_temp_raw, out_temp_unit)
            out_rh, _ = self._state_float(config[CONF_OUTDOOR_HUMIDITY])
        except ValueError as err:
            raise UpdateFailed(str(err)) from err

        if not 0.0 <= out_rh <= 100.0:
            raise UpdateFailed("Outdoor humidity is outside 0..100 %")

        out_ah = absolute_humidity_gm3(out_temp_c, out_rh)
        out_dew_c = dew_point_c(out_temp_c, out_rh)

        max_rh = float(config.get(CONF_MAX_RELATIVE_HUMIDITY, profile[CONF_MAX_RELATIVE_HUMIDITY]))
        min_ah_delta = float(
            config.get(CONF_MIN_ABSOLUTE_HUMIDITY_DELTA, profile[CONF_MIN_ABSOLUTE_HUMIDITY_DELTA])
        )
        rh_hysteresis = float(config.get(CONF_HUMIDITY_HYSTERESIS, profile[CONF_HUMIDITY_HYSTERESIS]))
        ah_hysteresis = float(
            config.get(CONF_ABSOLUTE_HUMIDITY_HYSTERESIS, profile[CONF_ABSOLUTE_HUMIDITY_HYSTERESIS])
        )
        target_temp_c = float(config.get(CONF_TARGET_TEMPERATURE_C, profile[CONF_TARGET_TEMPERATURE_C]))
        min_temp_delta_c = float(
            config.get(CONF_MIN_TEMPERATURE_DELTA_C, profile[CONF_MIN_TEMPERATURE_DELTA_C])
        )
        temp_hysteresis_c = float(
            config.get(CONF_TEMPERATURE_HYSTERESIS_C, profile[CONF_TEMPERATURE_HYSTERESIS_C])
        )
        moisture_guard = bool(
            config.get(CONF_TEMPERATURE_MOISTURE_GUARD, profile[CONF_TEMPERATURE_MOISTURE_GUARD])
        )

        humidity_rooms: list[dict[str, Any]] = []
        temperature_rooms: list[dict[str, Any]] = []
        unavailable_rooms: list[str] = []

        for room in config.get(CONF_ROOMS, []):
            room_id = str(room[CONF_ROOM_ID])
            room_name = str(room[CONF_ROOM_NAME])
            try:
                temp_raw, temp_unit = self._state_float(room[CONF_ROOM_TEMPERATURE])
                temp_c = temperature_to_celsius(temp_raw, temp_unit)
                rh, _ = self._state_float(room[CONF_ROOM_HUMIDITY])
            except ValueError:
                unavailable_rooms.append(room_name)
                self._humidity_active[room_id] = False
                self._temperature_active[room_id] = False
                continue

            if not 0.0 <= rh <= 100.0:
                unavailable_rooms.append(room_name)
                self._humidity_active[room_id] = False
                self._temperature_active[room_id] = False
                continue

            indoor_ah = absolute_humidity_gm3(temp_c, rh)
            indoor_dew_c = dew_point_c(temp_c, rh)
            ah_advantage = indoor_ah - out_ah
            temp_advantage = temp_c - out_temp_c

            was_humidity_active = self._humidity_active.get(room_id, False)
            if was_humidity_active:
                humidity_active = (
                    rh >= max(0.0, max_rh - rh_hysteresis)
                    and ah_advantage >= max(0.0, min_ah_delta - ah_hysteresis)
                )
            else:
                humidity_active = rh >= max_rh and ah_advantage >= min_ah_delta
            self._humidity_active[room_id] = humidity_active

            if humidity_active:
                humidity_reason = "outside_air_drier"
            elif rh < max_rh:
                humidity_reason = "humidity_below_threshold"
            elif ah_advantage < min_ah_delta:
                humidity_reason = "outside_not_dry_enough"
            else:
                humidity_reason = "no_humidity_benefit"

            # The basement profile deliberately defaults to a moisture guard for cooling.
            # Without a wall/surface temperature sensor, absolute humidity is the safest
            # generally available proxy for avoiding humid summer air in a cool cellar.
            guard_margin = 0.15 if self._temperature_active.get(room_id, False) else 0.0
            guard_ok = (not moisture_guard) or (out_ah <= indoor_ah + guard_margin)

            was_temp_active = self._temperature_active.get(room_id, False)
            if was_temp_active:
                temperature_active = (
                    temp_c >= target_temp_c - temp_hysteresis_c
                    and temp_advantage >= max(0.1, min_temp_delta_c - temp_hysteresis_c)
                    and guard_ok
                )
            else:
                temperature_active = (
                    temp_c >= target_temp_c
                    and temp_advantage >= min_temp_delta_c
                    and guard_ok
                )
            self._temperature_active[room_id] = temperature_active

            if temperature_active:
                temperature_reason = "outside_air_cooler"
            elif not guard_ok:
                temperature_reason = "blocked_by_moisture_guard"
            elif temp_c < target_temp_c:
                temperature_reason = "temperature_below_target"
            elif temp_advantage < min_temp_delta_c:
                temperature_reason = "outside_not_cool_enough"
            else:
                temperature_reason = "no_temperature_benefit"

            humidity_rooms.append(
                {
                    "id": room_id,
                    "name": room_name,
                    "recommend": humidity_active,
                    "reason_code": humidity_reason,
                    "temperature_c": temp_c,
                    "relative_humidity": rh,
                    "absolute_humidity": indoor_ah,
                    "dew_point_c": indoor_dew_c,
                    "absolute_humidity_advantage": ah_advantage,
                }
            )
            temperature_rooms.append(
                {
                    "id": room_id,
                    "name": room_name,
                    "recommend": temperature_active,
                    "reason_code": temperature_reason,
                    "temperature_c": temp_c,
                    "relative_humidity": rh,
                    "absolute_humidity": indoor_ah,
                    "temperature_advantage_c": temp_advantage,
                    "moisture_guard_ok": guard_ok,
                }
            )

        return {
            "profile": config[CONF_OBJECT_TYPE],
            "language": config.get(CONF_LANGUAGE, LANG_AUTO),
            "update_interval": int(config.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL)),
            "outdoor": {
                "temperature_c": out_temp_c,
                "relative_humidity": out_rh,
                "absolute_humidity": out_ah,
                "dew_point_c": out_dew_c,
            },
            "humidity": {
                "recommend": any(room["recommend"] for room in humidity_rooms),
                "rooms": humidity_rooms,
                "max_relative_humidity": max_rh,
                "min_absolute_humidity_delta": min_ah_delta,
            },
            "temperature": {
                "recommend": any(room["recommend"] for room in temperature_rooms),
                "rooms": temperature_rooms,
                "target_temperature_c": target_temp_c,
                "min_temperature_delta_c": min_temp_delta_c,
                "moisture_guard": moisture_guard,
            },
            "unavailable_rooms": unavailable_rooms,
            "basement_protection": config[CONF_OBJECT_TYPE] == OBJECT_BASEMENT and moisture_guard,
        }
