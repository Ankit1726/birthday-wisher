import logging

from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

logger = logging.getLogger("birthday-album.db")
client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        client = AsyncIOMotorClient(
            settings.mongo_uri_without_database, serverSelectionTimeoutMS=8000
        )
    return client


def get_db():
    return get_client()[settings.database_name]


async def ping_db() -> bool:
    """Used by /health to prove the cloud DB connection is actually alive."""
    try:
        await get_client().admin.command("ping")
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Mongo ping failed: %s", exc)
        return False


async def ensure_indexes():
    db = get_db()
    await db.users.create_index("username", unique=True)
    await db.albums.create_index("owner_id")
    await db.albums.create_index("slug", unique=True)