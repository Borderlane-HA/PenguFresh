"""PenguFresh integration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS
from .coordinator import PenguFreshCoordinator

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
CARD_FILE = FRONTEND_DIR / "pengufresh-card.js"
CARD_URL = "/pengufresh/pengufresh-card.js"
CARD_VERSION = "0.2.0"

type PenguFreshConfigEntry = ConfigEntry[PenguFreshCoordinator]


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up PenguFresh and register the bundled dashboard card."""
    if not CARD_FILE.exists():
        _LOGGER.warning("PenguFresh dashboard card was not found at %s", CARD_FILE)
        return True

    data = hass.data.setdefault(DOMAIN, {})
    if data.get("frontend_registered"):
        return True

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL, str(CARD_FILE), True)]
        )
        add_extra_js_url(hass, f"{CARD_URL}?v={CARD_VERSION}")
        data["frontend_registered"] = True
    except (AttributeError, RuntimeError):
        # Keep the helper functional even in installations without the frontend.
        _LOGGER.debug("Home Assistant frontend is unavailable; dashboard card not registered")

    return True


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
