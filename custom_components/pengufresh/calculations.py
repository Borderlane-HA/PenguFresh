"""Pure calculation helpers for PenguFresh."""

from __future__ import annotations

import math


def saturation_vapor_pressure_hpa(temperature_c: float) -> float:
    """Return saturation vapor pressure in hPa using Magnus formula."""
    return 6.112 * math.exp((17.62 * temperature_c) / (243.12 + temperature_c))


def absolute_humidity_gm3(temperature_c: float, relative_humidity: float) -> float:
    """Return absolute humidity in g/m³."""
    vapor_pressure = saturation_vapor_pressure_hpa(temperature_c) * (relative_humidity / 100.0)
    return 216.7 * (vapor_pressure / (temperature_c + 273.15))


def dew_point_c(temperature_c: float, relative_humidity: float) -> float:
    """Return dew point in °C using Magnus approximation."""
    rh = min(max(relative_humidity, 0.1), 100.0)
    gamma = math.log(rh / 100.0) + (17.62 * temperature_c) / (243.12 + temperature_c)
    return 243.12 * gamma / (17.62 - gamma)


def temperature_to_celsius(value: float, unit: str | None) -> float:
    """Convert common HA temperature units to °C."""
    if not unit or unit in {"°C", "C", "celsius"}:
        return value
    if unit in {"°F", "F", "fahrenheit"}:
        return (value - 32.0) * 5.0 / 9.0
    if unit in {"K", "kelvin"}:
        return value - 273.15
    raise ValueError(f"Unsupported temperature unit: {unit}")


def celsius_to_unit(value_c: float, unit: str | None) -> float:
    """Convert °C to a display unit."""
    if not unit or unit in {"°C", "C", "celsius"}:
        return value_c
    if unit in {"°F", "F", "fahrenheit"}:
        return value_c * 9.0 / 5.0 + 32.0
    if unit in {"K", "kelvin"}:
        return value_c + 273.15
    return value_c


def delta_c_to_unit(delta_c: float, unit: str | None) -> float:
    """Convert a temperature difference from °C/K to the display scale."""
    if unit in {"°F", "F", "fahrenheit"}:
        return delta_c * 9.0 / 5.0
    return delta_c


def delta_unit_to_c(delta: float, unit: str | None) -> float:
    """Convert a temperature difference from display scale to °C/K."""
    if unit in {"°F", "F", "fahrenheit"}:
        return delta * 5.0 / 9.0
    return delta
