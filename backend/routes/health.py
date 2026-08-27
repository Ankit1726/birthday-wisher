from datetime import datetime, timezone
from fastapi import APIRouter
from backend.database.database import ping_db

router = APIRouter(tags=["health"])
@router.get("/health")
async def health():
    db_ok = await ping_db()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "time": datetime.now(timezone.utc).isoformat(),
    }
