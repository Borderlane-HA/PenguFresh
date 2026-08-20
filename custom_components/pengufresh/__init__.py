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
from homeassistant.helpers import entity_registry as er

from .const import (
    CONF_MAX_RELATIVE_HUMIDITY,
    CONF_OBJECT_TYPE,
    DOMAIN,
    LEGACY_PROFILE_HUMIDITY_DEFAULTS,
    PLATFORMS,
)
from .coordinator import PenguFreshCoordinator

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
CARD_FILE = FRONTEND_DIR / "pengufresh-card.js"
CARD_URL = "/pengufresh/pengufresh-card.js"
CARD_VERSION = "0.4.0"


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

    if isinstance(resources, ResourceStorageCollection):
        await resources.async_get_info()
        for item in resources.async_items():
            existing_url = str(item.get("url", ""))
            if not existing_url.startswith(CARD_URL):
                continue
            if existing_url != resource_url or item.get("type") != "module":
                await resources.async_update_item(
                    item["id"],
                    {"res_type": "module", "url": resource_url},
                )
            data["frontend_registered"] = True
            return
        await resources.async_create_item({"res_type": "module", "url": resource_url})
    else:
        add_extra_js_url(hass, resource_url)

    data["frontend_registered"] = True


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up PenguFresh."""
    try:
        await _async_register_dashboard_card(hass)
    except Exception:  # noqa: BLE001
        _LOGGER.exception("PenguFresh loaded, but its dashboard card could not be registered")
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate 0.3.x helper entries to the 0.4 service model."""
    if entry.version >= 2:
        return True

    data = dict(entry.data)
    options = dict(entry.options)
    object_type = str(options.get(CONF_OBJECT_TYPE, data.get(CONF_OBJECT_TYPE, "apartment")))
    old_default = LEGACY_PROFILE_HUMIDITY_DEFAULTS.get(object_type)

    # Preserve custom humidity settings, but migrate the old profile default to
    # the new 50 % desired humidity default.
    for target in (data, options):
        if CONF_MAX_RELATIVE_HUMIDITY not in target or old_default is None:
            continue
        try:
            current = float(target[CONF_MAX_RELATIVE_HUMIDITY])
        except (TypeError, ValueError):
            continue
        if abs(current - old_default) < 0.001:
            target[CONF_MAX_RELATIVE_HUMIDITY] = 50.0

    hass.config_entries.async_update_entry(
        entry,
        data=data,
        options=options,
        version=2,
    )

    # Remove the two legacy entity registry entries. 0.4 creates one combined
    # status per room plus one overall status instead.
    registry = er.async_get(hass)
    for unique_id in (
        f"{entry.entry_id}_humidity_ventilation",
        f"{entry.entry_id}_temperature_ventilation",
    ):
        entity_id = registry.async_get_entity_id("binary_sensor", DOMAIN, unique_id)
        if entity_id:
            registry.async_remove(entity_id)

    _LOGGER.info("Migrated PenguFresh config entry %s to version 2", entry.entry_id)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: PenguFreshConfigEntry) -> bool:
    """Set up PenguFresh from a config entry."""
    if not hass.data.get(DOMAIN, {}).get("frontend_registered"):
        try:
            await _async_register_dashboard_card(hass)
        except Exception:  # noqa: BLE001
            _LOGGER.exception("PenguFresh instance loaded, but the dashboard card could not be registered")

    coordinator = PenguFreshCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: PenguFreshConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
