"""Basic tests for the pure calculation functions."""

from custom_components.pengufresh.calculations import (
    absolute_humidity_gm3,
    celsius_to_unit,
    delta_c_to_unit,
    delta_unit_to_c,
    dew_point_c,
    temperature_to_celsius,
)


def test_temperature_round_trip() -> None:
    assert round(celsius_to_unit(20.0, "°F"), 1) == 68.0
    assert round(temperature_to_celsius(68.0, "°F"), 1) == 20.0


def test_delta_round_trip() -> None:
    assert round(delta_c_to_unit(2.0, "°F"), 1) == 3.6
    assert round(delta_unit_to_c(3.6, "°F"), 1) == 2.0


def test_humidity_calculations_are_plausible() -> None:
    ah = absolute_humidity_gm3(20.0, 50.0)
    dp = dew_point_c(20.0, 50.0)
    assert 8.0 < ah < 9.0
    assert 9.0 < dp < 10.0
