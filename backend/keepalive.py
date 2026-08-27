import logging
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from backend.config import settings

logger = logging.getLogger("birthday-album.keepalive")
scheduler = AsyncIOScheduler()


async def _ping_self():
    if not settings.keepalive_url:
        return
    url = settings.keepalive_url + "/health"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            logger.info("Keep-alive ping -> %s [%s]", url, resp.status_code)
    except Exception as exc:  # noqa: BLE001
        # Never let a failed ping crash the app - just log and try again next cycle.
        logger.warning("Keep-alive ping failed: %s", exc)


def start_keepalive():
    if not settings.keepalive_enabled or not settings.keepalive_url:
        logger.info("Keep-alive disabled (set SELF_URL + KEEPALIVE_ENABLED=true to enable).")
        return
    scheduler.add_job(
        _ping_self,
        "interval",
        minutes=settings.keepalive_interval_minutes,
        id="self_ping",
        replace_existing=True,
        next_run_time=None,  # first run after one interval, not instantly
    )
    scheduler.start()
    logger.info(
        "Keep-alive started: pinging %s every %s minute(s).",
        settings.keepalive_url,
        settings.keepalive_interval_minutes,
    )


def stop_keepalive():
    if scheduler.running:
        scheduler.shutdown(wait=False)
