"""PenguFresh integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS
from .coordinator import PenguFreshCoordinator


type PenguFreshConfigEntry = ConfigEntry[PenguFreshCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: PenguFreshConfigEntry) -> bool:
    """Set up PenguFresh from a config entry."""
    coordinator = PenguFreshCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: PenguFreshConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
