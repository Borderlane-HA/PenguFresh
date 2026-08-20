"""Constants for PenguFresh."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "pengufresh"
PLATFORMS: Final = ["binary_sensor"]

CONF_NAME: Final = "name"
CONF_OBJECT_TYPE: Final = "object_type"
CONF_OUTDOOR_TEMPERATURE: Final = "outdoor_temperature"
CONF_OUTDOOR_HUMIDITY: Final = "outdoor_humidity"
CONF_ROOMS: Final = "rooms"
CONF_ROOM_ID: Final = "id"
CONF_ROOM_NAME: Final = "room_name"
CONF_ROOM_TEMPERATURE: Final = "temperature"
CONF_ROOM_HUMIDITY: Final = "humidity"
CONF_UPDATE_INTERVAL: Final = "update_interval"
CONF_LANGUAGE: Final = "language"
CONF_TARGET_TEMPERATURE_C: Final = "target_temperature_c"
# Kept for backwards compatibility with 0.3.x configuration data. In 0.4+
# this value is presented to the user as the desired/target relative humidity.
CONF_MAX_RELATIVE_HUMIDITY: Final = "max_relative_humidity"
CONF_MIN_TEMPERATURE_DELTA_C: Final = "min_temperature_delta_c"
CONF_MIN_ABSOLUTE_HUMIDITY_DELTA: Final = "min_absolute_humidity_delta"
CONF_TEMPERATURE_HYSTERESIS_C: Final = "temperature_hysteresis_c"
CONF_HUMIDITY_HYSTERESIS: Final = "humidity_hysteresis"
CONF_ABSOLUTE_HUMIDITY_HYSTERESIS: Final = "absolute_humidity_hysteresis"
CONF_TEMPERATURE_MOISTURE_GUARD: Final = "temperature_moisture_guard"
CONF_APPLY_PROFILE_DEFAULTS: Final = "apply_profile_defaults"

OBJECT_APARTMENT: Final = "apartment"
OBJECT_BASEMENT: Final = "basement"
OBJECT_GARAGE: Final = "garage"
OBJECT_ROOM: Final = "room"
OBJECT_TYPES: Final = [OBJECT_APARTMENT, OBJECT_BASEMENT, OBJECT_GARAGE, OBJECT_ROOM]

LANG_AUTO: Final = "auto"
LANG_DE: Final = "de"
LANG_EN: Final = "en"
LANGUAGES: Final = [LANG_AUTO, LANG_DE, LANG_EN]

DEFAULT_UPDATE_INTERVAL: Final = 15
MIN_UPDATE_INTERVAL: Final = 1
MAX_UPDATE_INTERVAL: Final = 180

# 0.4.0 changes the default desired humidity to 50 %. The physical decision
# still uses absolute humidity to verify that opening the windows can actually
# remove moisture.
PROFILE_DEFAULTS: Final = {
    OBJECT_APARTMENT: {
        CONF_TARGET_TEMPERATURE_C: 23.0,
        CONF_MAX_RELATIVE_HUMIDITY: 50.0,
        CONF_MIN_TEMPERATURE_DELTA_C: 2.0,
        CONF_MIN_ABSOLUTE_HUMIDITY_DELTA: 0.8,
        CONF_TEMPERATURE_HYSTERESIS_C: 0.5,
        CONF_HUMIDITY_HYSTERESIS: 3.0,
        CONF_ABSOLUTE_HUMIDITY_HYSTERESIS: 0.2,
        CONF_TEMPERATURE_MOISTURE_GUARD: False,
    },
    OBJECT_BASEMENT: {
        CONF_TARGET_TEMPERATURE_C: 20.0,
        CONF_MAX_RELATIVE_HUMIDITY: 50.0,
        CONF_MIN_TEMPERATURE_DELTA_C: 2.0,
        CONF_MIN_ABSOLUTE_HUMIDITY_DELTA: 0.5,
        CONF_TEMPERATURE_HYSTERESIS_C: 0.5,
        CONF_HUMIDITY_HYSTERESIS: 3.0,
        CONF_ABSOLUTE_HUMIDITY_HYSTERESIS: 0.2,
        CONF_TEMPERATURE_MOISTURE_GUARD: True,
    },
    OBJECT_GARAGE: {
        CONF_TARGET_TEMPERATURE_C: 26.0,
        CONF_MAX_RELATIVE_HUMIDITY: 50.0,
        CONF_MIN_TEMPERATURE_DELTA_C: 3.0,
        CONF_MIN_ABSOLUTE_HUMIDITY_DELTA: 1.0,
        CONF_TEMPERATURE_HYSTERESIS_C: 1.0,
        CONF_HUMIDITY_HYSTERESIS: 5.0,
        CONF_ABSOLUTE_HUMIDITY_HYSTERESIS: 0.3,
        CONF_TEMPERATURE_MOISTURE_GUARD: False,
    },
    OBJECT_ROOM: {
        CONF_TARGET_TEMPERATURE_C: 24.0,
        CONF_MAX_RELATIVE_HUMIDITY: 50.0,
        CONF_MIN_TEMPERATURE_DELTA_C: 2.0,
        CONF_MIN_ABSOLUTE_HUMIDITY_DELTA: 0.8,
        CONF_TEMPERATURE_HYSTERESIS_C: 0.5,
        CONF_HUMIDITY_HYSTERESIS: 3.0,
        CONF_ABSOLUTE_HUMIDITY_HYSTERESIS: 0.2,
        CONF_TEMPERATURE_MOISTURE_GUARD: False,
    },
}

LEGACY_PROFILE_HUMIDITY_DEFAULTS: Final = {
    OBJECT_APARTMENT: 60.0,
    OBJECT_BASEMENT: 65.0,
    OBJECT_GARAGE: 70.0,
    OBJECT_ROOM: 60.0,
}
