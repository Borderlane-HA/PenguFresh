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
    """Calculate one clear ventilation recommendation per room."""

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
        self._room_active: dict[str, bool] = {}
        self._humidity_active: dict[str, bool] = {}
        self._cooling_active: dict[str, bool] = {}

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

        target_rh = float(config.get(CONF_MAX_RELATIVE_HUMIDITY, profile[CONF_MAX_RELATIVE_HUMIDITY]))
        min_ah_delta = float(config.get(CONF_MIN_ABSOLUTE_HUMIDITY_DELTA, profile[CONF_MIN_ABSOLUTE_HUMIDITY_DELTA]))
        rh_hysteresis = float(config.get(CONF_HUMIDITY_HYSTERESIS, profile[CONF_HUMIDITY_HYSTERESIS]))
        ah_hysteresis = float(config.get(CONF_ABSOLUTE_HUMIDITY_HYSTERESIS, profile[CONF_ABSOLUTE_HUMIDITY_HYSTERESIS]))
        target_temp_c = float(config.get(CONF_TARGET_TEMPERATURE_C, profile[CONF_TARGET_TEMPERATURE_C]))
        min_temp_delta_c = float(config.get(CONF_MIN_TEMPERATURE_DELTA_C, profile[CONF_MIN_TEMPERATURE_DELTA_C]))
        temp_hysteresis_c = float(config.get(CONF_TEMPERATURE_HYSTERESIS_C, profile[CONF_TEMPERATURE_HYSTERESIS_C]))
        moisture_guard = bool(config.get(CONF_TEMPERATURE_MOISTURE_GUARD, profile[CONF_TEMPERATURE_MOISTURE_GUARD]))

        rooms: list[dict[str, Any]] = []
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
                self._room_active[room_id] = False
                self._humidity_active[room_id] = False
                self._cooling_active[room_id] = False
                rooms.append({
                    "id": room_id,
                    "name": room_name,
                    "available": False,
                    "recommend": False,
                    "reason_code": "sensor_unavailable",
                    "reasons": [],
                })
                continue

            if not 0.0 <= rh <= 100.0:
                unavailable_rooms.append(room_name)
                rooms.append({
                    "id": room_id,
                    "name": room_name,
                    "available": False,
                    "recommend": False,
                    "reason_code": "sensor_unavailable",
                    "reasons": [],
                })
                continue

            indoor_ah = absolute_humidity_gm3(temp_c, rh)
            indoor_dew_c = dew_point_c(temp_c, rh)
            ah_advantage = indoor_ah - out_ah
            temp_advantage = temp_c - out_temp_c

            # Humidity is a *reason* for the final recommendation. Relative
            # humidity tells us whether the room needs drying; absolute humidity
            # verifies that outdoor air can actually remove water.
            was_humidity = self._humidity_active.get(room_id, False)
            if was_humidity:
                humidity_need = rh > max(0.0, target_rh - rh_hysteresis)
                humidity_advantage_ok = ah_advantage >= max(0.0, min_ah_delta - ah_hysteresis)
            else:
                humidity_need = rh > target_rh
                humidity_advantage_ok = ah_advantage >= min_ah_delta
            humidity_recommend = humidity_need and humidity_advantage_ok
            self._humidity_active[room_id] = humidity_recommend

            # Cooling is the second possible reason. For basement-style profiles
            # a moisture guard can veto cooling if outside air would add water.
            was_cooling = self._cooling_active.get(room_id, False)
            guard_margin = 0.15 if was_cooling else 0.0
            moisture_guard_ok = (not moisture_guard) or (out_ah <= indoor_ah + guard_margin)
            if was_cooling:
                cooling_need = temp_c >= target_temp_c - temp_hysteresis_c
                cooling_advantage_ok = temp_advantage >= max(0.1, min_temp_delta_c - temp_hysteresis_c)
            else:
                cooling_need = temp_c >= target_temp_c
                cooling_advantage_ok = temp_advantage >= min_temp_delta_c
            cooling_recommend = cooling_need and cooling_advantage_ok and moisture_guard_ok
            self._cooling_active[room_id] = cooling_recommend

            recommend = humidity_recommend or cooling_recommend
            reasons: list[str] = []
            if cooling_recommend:
                reasons.append("cooling")
            if humidity_recommend:
                reasons.append("dehumidifying")

            if recommend:
                reason_code = "cooling_and_dehumidifying" if len(reasons) == 2 else reasons[0]
            elif cooling_need and cooling_advantage_ok and not moisture_guard_ok:
                reason_code = "blocked_by_moisture_guard"
            elif humidity_need and not humidity_advantage_ok:
                reason_code = "outside_not_dry_enough"
            elif cooling_need and not cooling_advantage_ok:
                reason_code = "outside_not_cool_enough"
            elif not cooling_need and not humidity_need:
                reason_code = "targets_reached"
            elif humidity_need:
                reason_code = "no_humidity_benefit"
            else:
                reason_code = "no_ventilation_benefit"

            self._room_active[room_id] = recommend
            rooms.append(
                {
                    "id": room_id,
                    "name": room_name,
                    "available": True,
                    "recommend": recommend,
                    "reason_code": reason_code,
                    "reasons": reasons,
                    "temperature_c": temp_c,
                    "relative_humidity": rh,
                    "absolute_humidity": indoor_ah,
                    "dew_point_c": indoor_dew_c,
                    "temperature_advantage_c": temp_advantage,
                    "absolute_humidity_advantage": ah_advantage,
                    "cooling_need": cooling_need,
                    "cooling_advantage_ok": cooling_advantage_ok,
                    "cooling_recommend": cooling_recommend,
                    "humidity_need": humidity_need,
                    "humidity_advantage_ok": humidity_advantage_ok,
                    "humidity_recommend": humidity_recommend,
                    "moisture_guard_ok": moisture_guard_ok,
                }
            )

        available_rooms = [room for room in rooms if room.get("available")]
        recommended_rooms = [room for room in available_rooms if room["recommend"]]
        overall_reasons: list[str] = []
        if any("cooling" in room.get("reasons", []) for room in recommended_rooms):
            overall_reasons.append("cooling")
        if any("dehumidifying" in room.get("reasons", []) for room in recommended_rooms):
            overall_reasons.append("dehumidifying")

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
            "settings": {
                "target_temperature_c": target_temp_c,
                "target_relative_humidity": target_rh,
                "min_temperature_delta_c": min_temp_delta_c,
                "min_absolute_humidity_delta": min_ah_delta,
                "moisture_guard": moisture_guard,
            },
            "rooms": rooms,
            "overall": {
                "recommend": bool(recommended_rooms),
                "recommended_rooms": [room["name"] for room in recommended_rooms],
                "reasons": overall_reasons,
                "reason_code": (
                    "cooling_and_dehumidifying"
                    if len(overall_reasons) == 2
                    else overall_reasons[0]
                    if overall_reasons
                    else "no_ventilation_benefit"
                ),
            },
            "unavailable_rooms": unavailable_rooms,
            "basement_protection": config[CONF_OBJECT_TYPE] == OBJECT_BASEMENT and moisture_guard,
        }
