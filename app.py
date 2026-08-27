import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database.database import ensure_indexes
from backend.keepalive import start_keepalive, stop_keepalive
from backend.routes import album, auth, health

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("birthday-album")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await ensure_indexes()
        logger.info("Mongo indexes ready.")
    except Exception as exc:  # noqa: BLE001
        logger.error("Could not create Mongo indexes at startup: %s", exc)
    start_keepalive()
    yield
    stop_keepalive()


app = FastAPI(title="Birthday Wish Album API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(album.router)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
STATIC_DIR = FRONTEND_DIR / "static"
TEMPLATES_DIR = FRONTEND_DIR / "templates"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
else:
    logger.warning("Static directory not found at %s", STATIC_DIR)

if TEMPLATES_DIR.exists():
    PAGES = {
        "/": "index.html",
        "/dashboard": "dashboard.html",
        "/create": "create.html",
        "/album": "album.html",
    }

    def _make_page_route(filename: str):
        async def _serve():
            return FileResponse(str(TEMPLATES_DIR / filename))

        return _serve

    for path, filename in PAGES.items():
        app.add_api_route(
            path, _make_page_route(filename), methods=["GET"], include_in_schema=False
        )
else:
    logger.warning(
        "Frontend templates directory not found at %s - API-only mode.", TEMPLATES_DIR
    )
