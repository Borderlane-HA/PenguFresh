"""PenguFresh integration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS
from .coordinator import PenguFreshCoordinator

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
CARD_FILE = FRONTEND_DIR / "pengufresh-card.js"
CARD_URL = "/pengufresh/pengufresh-card.js"
CARD_VERSION = "0.3.5"


type PenguFreshConfigEntry = ConfigEntry[PenguFreshCoordinator]


async def _async_register_dashboard_card(hass: HomeAssistant) -> None:
    """Serve and register the bundled PenguFresh dashboard card."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get("frontend_registered"):
        return

    if not CARD_FILE.exists():
        _LOGGER.warning("PenguFresh dashboard card was not found at %s", CARD_FILE)
        return

    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(CARD_FILE), False)]
    )

    resource_url = f"{CARD_URL}?v={CARD_VERSION}"
    lovelace_data = hass.data.get("lovelace")
    resources = getattr(lovelace_data, "resources", None)

    # Storage-mode dashboards: register a real Lovelace resource. Resources are
    # awaited by the dashboard frontend and therefore load more reliably than
    # an extra JS URL during frontend startup.
    if isinstance(resources, ResourceStorageCollection):
        await resources.async_get_info()  # Ensure existing resources are loaded.

        for item in resources.async_items():
            existing_url = str(item.get("url", ""))
            if not existing_url.startswith(CARD_URL):
                continue

            if existing_url != resource_url or item.get("type") != "module":
                await resources.async_update_item(
                    item["id"],
                    {"res_type": "module", "url": resource_url},
                )
                _LOGGER.info("Updated PenguFresh dashboard resource to %s", resource_url)
            data["frontend_registered"] = True
            return

        await resources.async_create_item(
            {"res_type": "module", "url": resource_url}
        )
        _LOGGER.info("Registered PenguFresh dashboard resource %s", resource_url)
    else:
        # YAML resource mode cannot be modified by an integration. Fall back to
        # Home Assistant's supported extra-module mechanism.
        add_extra_js_url(hass, resource_url)
        _LOGGER.info("Registered PenguFresh dashboard module %s", resource_url)

    data["frontend_registered"] = True


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up PenguFresh."""
    try:
        await _async_register_dashboard_card(hass)
    except Exception:  # noqa: BLE001 - dashboard card must never break the helper
        _LOGGER.exception(
            "PenguFresh helper loaded, but the bundled dashboard card could not be registered"
        )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: PenguFreshConfigEntry) -> bool:
    """Set up PenguFresh from a config entry."""
    # Also try here. This makes upgrades more robust when the integration is
    # reloaded without a full Home Assistant restart.
    if not hass.data.get(DOMAIN, {}).get("frontend_registered"):
        try:
            await _async_register_dashboard_card(hass)
        except Exception:  # noqa: BLE001
            _LOGGER.exception(
                "PenguFresh instance loaded, but the dashboard card could not be registered"
            )

    coordinator = PenguFreshCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: PenguFreshConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
