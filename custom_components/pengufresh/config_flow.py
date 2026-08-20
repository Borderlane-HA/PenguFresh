"""Config flow for PenguFresh."""

from __future__ import annotations

from copy import deepcopy
from typing import Any
from uuid import uuid4

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigFlowResult, OptionsFlowWithReload
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    TextSelector,
)

from .calculations import (
    celsius_to_unit,
    delta_c_to_unit,
    delta_unit_to_c,
    temperature_to_celsius,
)
from .const import (
    CONF_ABSOLUTE_HUMIDITY_HYSTERESIS,
    CONF_APPLY_PROFILE_DEFAULTS,
    CONF_HUMIDITY_HYSTERESIS,
    CONF_LANGUAGE,
    CONF_MAX_RELATIVE_HUMIDITY,
    CONF_MIN_ABSOLUTE_HUMIDITY_DELTA,
    CONF_MIN_TEMPERATURE_DELTA_C,
    CONF_NAME,
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
    LANGUAGES,
    MAX_UPDATE_INTERVAL,
    MIN_UPDATE_INTERVAL,
    OBJECT_APARTMENT,
    OBJECT_TYPES,
    PROFILE_DEFAULTS,
)

CONF_ADD_ANOTHER = "add_another"
CONF_ROOM_SELECTION = "room_selection"


def _display_unit(hass) -> str:
    return str(hass.config.units.temperature_unit)


def _entity_selector(device_class: str) -> EntitySelector:
    return EntitySelector(EntitySelectorConfig(domain="sensor", device_class=device_class))


def _object_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(options=OBJECT_TYPES, translation_key="object_type")
    )


def _language_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(options=LANGUAGES, translation_key="language")
    )


def _number(minimum: float, maximum: float, step: float, unit: str | None = None) -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=minimum,
            max=maximum,
            step=step,
            unit_of_measurement=unit,
        )
    )


def _room_schema(room: dict[str, Any] | None = None, include_add_another: bool = False) -> vol.Schema:
    room = room or {}
    schema: dict[Any, Any] = {
        vol.Required(CONF_ROOM_NAME, default=room.get(CONF_ROOM_NAME, "")): TextSelector(),
    }
    if CONF_ROOM_TEMPERATURE in room:
        schema[vol.Required(CONF_ROOM_TEMPERATURE, default=room[CONF_ROOM_TEMPERATURE])] = _entity_selector("temperature")
    else:
        schema[vol.Required(CONF_ROOM_TEMPERATURE)] = _entity_selector("temperature")
    if CONF_ROOM_HUMIDITY in room:
        schema[vol.Required(CONF_ROOM_HUMIDITY, default=room[CONF_ROOM_HUMIDITY])] = _entity_selector("humidity")
    else:
        schema[vol.Required(CONF_ROOM_HUMIDITY)] = _entity_selector("humidity")
    if include_add_another:
        schema[vol.Optional(CONF_ADD_ANOTHER, default=False)] = BooleanSelector()
    return vol.Schema(schema)


def _settings_schema(hass, data: dict[str, Any], defaults: dict[str, Any]) -> vol.Schema:
    unit = _display_unit(hass)
    target = celsius_to_unit(float(data.get(CONF_TARGET_TEMPERATURE_C, defaults[CONF_TARGET_TEMPERATURE_C])), unit)
    min_delta = delta_c_to_unit(float(data.get(CONF_MIN_TEMPERATURE_DELTA_C, defaults[CONF_MIN_TEMPERATURE_DELTA_C])), unit)
    temp_hyst = delta_c_to_unit(float(data.get(CONF_TEMPERATURE_HYSTERESIS_C, defaults[CONF_TEMPERATURE_HYSTERESIS_C])), unit)
    return vol.Schema(
        {
            vol.Required(CONF_TARGET_TEMPERATURE_C, default=round(target, 1)): _number(-40, 140, 0.5, unit),
            vol.Required(
                CONF_MAX_RELATIVE_HUMIDITY,
                default=float(data.get(CONF_MAX_RELATIVE_HUMIDITY, defaults[CONF_MAX_RELATIVE_HUMIDITY])),
            ): _number(20, 100, 1, "%"),
            vol.Required(CONF_MIN_TEMPERATURE_DELTA_C, default=round(min_delta, 1)): _number(0.1, 30, 0.1, unit),
            vol.Required(
                CONF_MIN_ABSOLUTE_HUMIDITY_DELTA,
                default=float(data.get(CONF_MIN_ABSOLUTE_HUMIDITY_DELTA, defaults[CONF_MIN_ABSOLUTE_HUMIDITY_DELTA])),
            ): _number(0.1, 10, 0.1, "g/m³"),
            vol.Required(CONF_TEMPERATURE_HYSTERESIS_C, default=round(temp_hyst, 1)): _number(0.0, 10, 0.1, unit),
            vol.Required(
                CONF_HUMIDITY_HYSTERESIS,
                default=float(data.get(CONF_HUMIDITY_HYSTERESIS, defaults[CONF_HUMIDITY_HYSTERESIS])),
            ): _number(0, 20, 1, "%"),
            vol.Required(
                CONF_ABSOLUTE_HUMIDITY_HYSTERESIS,
                default=float(data.get(CONF_ABSOLUTE_HUMIDITY_HYSTERESIS, defaults[CONF_ABSOLUTE_HUMIDITY_HYSTERESIS])),
            ): _number(0, 5, 0.1, "g/m³"),
            vol.Required(
                CONF_TEMPERATURE_MOISTURE_GUARD,
                default=bool(data.get(CONF_TEMPERATURE_MOISTURE_GUARD, defaults[CONF_TEMPERATURE_MOISTURE_GUARD])),
            ): BooleanSelector(),
            vol.Required(
                CONF_UPDATE_INTERVAL,
                default=int(data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL)),
            ): _number(MIN_UPDATE_INTERVAL, MAX_UPDATE_INTERVAL, 1, "min"),
            vol.Required(CONF_LANGUAGE, default=data.get(CONF_LANGUAGE, LANG_AUTO)): _language_selector(),
        }
    )


def _store_settings(hass, target: dict[str, Any], user_input: dict[str, Any]) -> None:
    unit = _display_unit(hass)
    target[CONF_TARGET_TEMPERATURE_C] = round(
        temperature_to_celsius(float(user_input[CONF_TARGET_TEMPERATURE_C]), unit), 4
    )
    target[CONF_MAX_RELATIVE_HUMIDITY] = float(user_input[CONF_MAX_RELATIVE_HUMIDITY])
    target[CONF_MIN_TEMPERATURE_DELTA_C] = round(
        delta_unit_to_c(float(user_input[CONF_MIN_TEMPERATURE_DELTA_C]), unit), 4
    )
    target[CONF_MIN_ABSOLUTE_HUMIDITY_DELTA] = float(user_input[CONF_MIN_ABSOLUTE_HUMIDITY_DELTA])
    target[CONF_TEMPERATURE_HYSTERESIS_C] = round(
        delta_unit_to_c(float(user_input[CONF_TEMPERATURE_HYSTERESIS_C]), unit), 4
    )
    target[CONF_HUMIDITY_HYSTERESIS] = float(user_input[CONF_HUMIDITY_HYSTERESIS])
    target[CONF_ABSOLUTE_HUMIDITY_HYSTERESIS] = float(user_input[CONF_ABSOLUTE_HUMIDITY_HYSTERESIS])
    target[CONF_TEMPERATURE_MOISTURE_GUARD] = bool(user_input[CONF_TEMPERATURE_MOISTURE_GUARD])
    target[CONF_UPDATE_INTERVAL] = int(user_input[CONF_UPDATE_INTERVAL])
    target[CONF_LANGUAGE] = str(user_input[CONF_LANGUAGE])


class PenguFreshConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for PenguFresh."""

    VERSION = 3

    def __init__(self) -> None:
        self._data: dict[str, Any] = {CONF_ROOMS: []}

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> "PenguFreshOptionsFlow":
        return PenguFreshOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data.update(user_input)
            return await self.async_step_outdoor()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default="PenguFresh"): TextSelector(),
                    vol.Required(CONF_OBJECT_TYPE, default=OBJECT_APARTMENT): _object_selector(),
                }
            ),
        )

    async def async_step_outdoor(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data.update(user_input)
            return await self.async_step_room()

        return self.async_show_form(
            step_id="outdoor",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_OUTDOOR_TEMPERATURE): _entity_selector("temperature"),
                    vol.Required(CONF_OUTDOOR_HUMIDITY): _entity_selector("humidity"),
                }
            ),
        )

    async def async_step_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            room = {
                CONF_ROOM_ID: uuid4().hex[:12],
                CONF_ROOM_NAME: str(user_input[CONF_ROOM_NAME]).strip(),
                CONF_ROOM_TEMPERATURE: user_input[CONF_ROOM_TEMPERATURE],
                CONF_ROOM_HUMIDITY: user_input[CONF_ROOM_HUMIDITY],
            }
            if not room[CONF_ROOM_NAME]:
                return self.async_show_form(step_id="room", data_schema=_room_schema(include_add_another=True), errors={"base": "room_name_required"})
            self._data[CONF_ROOMS].append(room)
            if user_input.get(CONF_ADD_ANOTHER, False):
                return await self.async_step_room()
            return await self.async_step_settings()

        return self.async_show_form(step_id="room", data_schema=_room_schema(include_add_another=True))

    async def async_step_settings(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        defaults = PROFILE_DEFAULTS[self._data[CONF_OBJECT_TYPE]]
        if user_input is not None:
            _store_settings(self.hass, self._data, user_input)
            return self.async_create_entry(title=self._data[CONF_NAME], data=self._data)

        return self.async_show_form(
            step_id="settings",
            data_schema=_settings_schema(self.hass, self._data, defaults),
        )


class PenguFreshOptionsFlow(OptionsFlowWithReload):
    """Allow every relevant setting to be edited after setup."""

    def __init__(self) -> None:
        self._data: dict[str, Any] | None = None
        self._editing_room_id: str | None = None

    def _ensure_data(self) -> dict[str, Any]:
        if self._data is None:
            merged = dict(self.config_entry.data)
            merged.update(self.config_entry.options)
            self._data = deepcopy(merged)
        return self._data

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self._ensure_data()
        return self.async_show_menu(
            step_id="init",
            menu_options=["general", "rooms", "save"],
        )

    async def async_step_general(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        data = self._ensure_data()
        if user_input is not None:
            object_type = str(user_input[CONF_OBJECT_TYPE])
            data[CONF_NAME] = str(user_input[CONF_NAME]).strip() or self.config_entry.title
            data[CONF_OBJECT_TYPE] = object_type
            data[CONF_OUTDOOR_TEMPERATURE] = user_input[CONF_OUTDOOR_TEMPERATURE]
            data[CONF_OUTDOOR_HUMIDITY] = user_input[CONF_OUTDOOR_HUMIDITY]

            if user_input.get(CONF_APPLY_PROFILE_DEFAULTS, False):
                defaults = PROFILE_DEFAULTS[object_type]
                for key, value in defaults.items():
                    data[key] = value
                data[CONF_UPDATE_INTERVAL] = int(user_input[CONF_UPDATE_INTERVAL])
                data[CONF_LANGUAGE] = str(user_input[CONF_LANGUAGE])
            else:
                _store_settings(self.hass, data, user_input)
            return await self.async_step_init()

        defaults = PROFILE_DEFAULTS[data[CONF_OBJECT_TYPE]]
        base_schema = {
            vol.Required(CONF_NAME, default=data.get(CONF_NAME, self.config_entry.title)): TextSelector(),
            vol.Required(CONF_OBJECT_TYPE, default=data[CONF_OBJECT_TYPE]): _object_selector(),
            vol.Required(CONF_OUTDOOR_TEMPERATURE, default=data[CONF_OUTDOOR_TEMPERATURE]): _entity_selector("temperature"),
            vol.Required(CONF_OUTDOOR_HUMIDITY, default=data[CONF_OUTDOOR_HUMIDITY]): _entity_selector("humidity"),
        }
        settings = _settings_schema(self.hass, data, defaults).schema
        base_schema.update(settings)
        base_schema[vol.Optional(CONF_APPLY_PROFILE_DEFAULTS, default=False)] = BooleanSelector()
        return self.async_show_form(step_id="general", data_schema=vol.Schema(base_schema))

    async def async_step_rooms(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self._ensure_data()
        return self.async_show_menu(
            step_id="rooms",
            menu_options=["add_room", "edit_room", "remove_room", "rooms_back"],
        )

    async def async_step_add_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        data = self._ensure_data()
        if user_input is not None:
            name = str(user_input[CONF_ROOM_NAME]).strip()
            if not name:
                return self.async_show_form(step_id="add_room", data_schema=_room_schema(), errors={"base": "room_name_required"})
            data[CONF_ROOMS].append(
                {
                    CONF_ROOM_ID: uuid4().hex[:12],
                    CONF_ROOM_NAME: name,
                    CONF_ROOM_TEMPERATURE: user_input[CONF_ROOM_TEMPERATURE],
                    CONF_ROOM_HUMIDITY: user_input[CONF_ROOM_HUMIDITY],
                }
            )
            return await self.async_step_rooms()
        return self.async_show_form(step_id="add_room", data_schema=_room_schema())

    def _room_options(self) -> list[SelectOptionDict]:
        data = self._ensure_data()
        return [
            SelectOptionDict(value=str(room[CONF_ROOM_ID]), label=str(room[CONF_ROOM_NAME]))
            for room in data[CONF_ROOMS]
        ]

    async def async_step_edit_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._editing_room_id = str(user_input[CONF_ROOM_SELECTION])
            return await self.async_step_edit_room_details()
        return self.async_show_form(
            step_id="edit_room",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_ROOM_SELECTION): SelectSelector(
                        SelectSelectorConfig(options=self._room_options())
                    )
                }
            ),
        )

    async def async_step_edit_room_details(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        data = self._ensure_data()
        room = next(room for room in data[CONF_ROOMS] if str(room[CONF_ROOM_ID]) == self._editing_room_id)
        if user_input is not None:
            name = str(user_input[CONF_ROOM_NAME]).strip()
            if not name:
                return self.async_show_form(step_id="edit_room_details", data_schema=_room_schema(room), errors={"base": "room_name_required"})
            room[CONF_ROOM_NAME] = name
            room[CONF_ROOM_TEMPERATURE] = user_input[CONF_ROOM_TEMPERATURE]
            room[CONF_ROOM_HUMIDITY] = user_input[CONF_ROOM_HUMIDITY]
            self._editing_room_id = None
            return await self.async_step_rooms()
        return self.async_show_form(step_id="edit_room_details", data_schema=_room_schema(room))

    async def async_step_remove_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        data = self._ensure_data()
        if len(data[CONF_ROOMS]) <= 1:
            return self.async_abort(reason="last_room")
        if user_input is not None:
            selected = str(user_input[CONF_ROOM_SELECTION])
            data[CONF_ROOMS] = [room for room in data[CONF_ROOMS] if str(room[CONF_ROOM_ID]) != selected]
            return await self.async_step_rooms()
        return self.async_show_form(
            step_id="remove_room",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_ROOM_SELECTION): SelectSelector(
                        SelectSelectorConfig(options=self._room_options())
                    )
                }
            ),
        )

    async def async_step_rooms_back(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return await self.async_step_init()

    async def async_step_save(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        data = self._ensure_data()
        self.hass.config_entries.async_update_entry(self.config_entry, title=str(data[CONF_NAME]))
        return self.async_create_entry(data=data)
