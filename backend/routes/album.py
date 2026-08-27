import base64
import ipaddress
import re
import secrets
import socket
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from backend.auth.auth import get_current_user
from backend.config import settings
from backend.database.database import get_db
from backend.database.models import AlbumCreate, AlbumOut, AlbumUpdate, FetchSongRequest, Song

router = APIRouter(prefix="/api", tags=["album"])


def slugify(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "album"
    return f"{base}-{secrets.token_hex(3)}"


def to_out(doc: dict) -> AlbumOut:
    return AlbumOut(
        id=str(doc["_id"]),
        slug=doc["slug"],
        owner_id=doc["owner_id"],
        creator_name=doc["creator_name"],
        recipient_name=doc["recipient_name"],
        wish_message=doc.get("wish_message", ""),
        theme=doc.get("theme", "rose"),
        animations=doc.get("animations", ["cake", "confetti"]),
        photo_id=doc.get("photo_id"),
        songs=[Song(title=s.get("title", ""), singer=s.get("singer", s.get("artist", "")), url=s.get("url", "")) for s in doc.get("songs", [])],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        birthday=doc.get("birthday"),
    )


# ---------- Album CRUD ----------


@router.post("/albums", response_model=AlbumOut, status_code=status.HTTP_201_CREATED)
async def create_album(payload: AlbumCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "slug": slugify(payload.recipient_name),
        "owner_id": user["id"],
        "creator_name": user.get("name", user["username"]),
        "birthday": payload.birthday.isoformat(),
        "recipient_name": payload.recipient_name.strip(),
        "wish_message": payload.wish_message,
        "theme": payload.theme,
        "animations": payload.animations,
        "photo_id": None,
        "songs": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.albums.insert_one(doc)
    doc["_id"] = result.inserted_id
    return to_out(doc)


@router.get("/albums/mine", response_model=list[AlbumOut])
async def my_albums(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.albums.find({"owner_id": user["id"]}).sort("created_at", -1)
    return [to_out(d) async for d in cursor]


@router.get("/albums/{slug}", response_model=AlbumOut)
async def get_album(slug: str):
    db = get_db()
    doc = await db.albums.find_one({"slug": slug})
    if not doc:
        raise HTTPException(
            status_code=404, detail="This birthday album doesn't exist."
        )
    return to_out(doc)


@router.patch("/albums/{slug}", response_model=AlbumOut)
async def update_album(
    slug: str, payload: AlbumUpdate, user: dict = Depends(get_current_user)
):
    db = get_db()
    doc = await db.albums.find_one({"slug": slug})
    if not doc:
        raise HTTPException(
            status_code=404, detail="This birthday album doesn't exist."
        )
    if doc["owner_id"] != user["id"]:
        raise HTTPException(
            status_code=403, detail="You can only edit albums you created."
        )

    updates = {
        k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None
    }
    if "birthday" in updates:
        updates["birthday"] = updates["birthday"].isoformat()
    if "songs" in updates:
        updates["songs"] = [
            s if isinstance(s, dict) else s.model_dump() for s in updates["songs"]
        ]
    updates["updated_at"] = datetime.now(timezone.utc)
    await db.albums.update_one({"_id": doc["_id"]}, {"$set": updates})
    doc = await db.albums.find_one({"_id": doc["_id"]})
    return to_out(doc)


@router.delete("/albums/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_album(slug: str, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.albums.find_one({"slug": slug})
    if not doc:
        raise HTTPException(
            status_code=404, detail="This birthday album doesn't exist."
        )
    if doc["owner_id"] != user["id"]:
        raise HTTPException(
            status_code=403, detail="You can only delete albums you created."
        )
    await db.albums.delete_one({"_id": doc["_id"]})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- Media (photo / song file) stored in MongoDB cloud DB ----------


@router.post("/media/photo")
async def upload_photo(
    file: UploadFile = File(...), user: dict = Depends(get_current_user)
):
    data = await file.read()
    max_bytes = settings.max_image_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413, detail=f"Photo must be under {settings.max_image_mb}MB."
        )
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    db = get_db()
    media_id = uuid.uuid4().hex
    await db.media.insert_one(
        {
            "_id": media_id,
            "owner_id": user["id"],
            "content_type": file.content_type,
            "data": base64.b64encode(data).decode("ascii"),
            "kind": "photo",
        }
    )
    return {"media_id": media_id}


@router.post("/media/song")
async def upload_song(
    file: UploadFile = File(...), user: dict = Depends(get_current_user)
):
    data = await file.read()
    max_bytes = settings.max_audio_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Song file must be under {settings.max_audio_mb}MB.",
        )
    if not (file.content_type or "").startswith("audio/"):
        raise HTTPException(status_code=400, detail="Only audio files are allowed.")

    db = get_db()
    media_id = uuid.uuid4().hex
    await db.media.insert_one(
        {
            "_id": media_id,
            "owner_id": user["id"],
            "content_type": file.content_type,
            "data": base64.b64encode(data).decode("ascii"),
            "kind": "song",
        }
    )
    return {"media_id": media_id, "url": f"/api/media/{media_id}"}


def _public_http_url(value: str) -> str:
    parsed = urlparse(value.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(status_code=400, detail="Use a direct http(s) audio URL.")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(parsed.hostname, None)}
        if any(not ipaddress.ip_address(address).is_global for address in addresses):
            raise HTTPException(status_code=400, detail="That audio host is not publicly reachable.")
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="The audio host could not be resolved.") from exc
    return value.strip()


@router.post("/media/song/fetch")
async def fetch_song(payload: FetchSongRequest, user: dict = Depends(get_current_user)):
    url = _public_http_url(payload.url)
    max_bytes = settings.max_audio_mb * 1024 * 1024
    try:
        async with httpx.AsyncClient(follow_redirects=False, timeout=20) as client:
            for _ in range(4):
                async with client.stream("GET", url, headers={"Accept": "audio/*"}) as response:
                    if response.is_redirect:
                        location = response.headers.get("location")
                        if not location:
                            raise HTTPException(status_code=400, detail="The audio URL redirect is invalid.")
                        url = _public_http_url(str(httpx.URL(url).join(location)))
                        continue
                if response.status_code != 200:
                    raise HTTPException(status_code=400, detail="The audio URL could not be downloaded.")
                content_type = (response.headers.get("content-type") or "").split(";", 1)[0].lower()
                looks_like_audio = bool(re.search(r"\.(mp3|wav|ogg|m4a|aac|flac)(?:$|[?#])", url, re.I))
                if not content_type.startswith("audio/") and content_type != "application/octet-stream" and not looks_like_audio:
                    raise HTTPException(status_code=400, detail="URL must point directly to an audio file.")
                content_length = int(response.headers.get("content-length", "0") or 0)
                if content_length > max_bytes:
                    raise HTTPException(status_code=413, detail=f"Song file must be under {settings.max_audio_mb}MB.")
                chunks = []
                total = 0
                async for chunk in response.aiter_bytes():
                    total += len(chunk)
                    if total > max_bytes:
                        raise HTTPException(status_code=413, detail=f"Song file must be under {settings.max_audio_mb}MB.")
                    chunks.append(chunk)
                break
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="The audio URL could not be downloaded.") from exc

    media_id = uuid.uuid4().hex
    await get_db().media.insert_one({"_id": media_id, "owner_id": user["id"], "content_type": content_type, "data": base64.b64encode(b"".join(chunks)).decode("ascii"), "kind": "song"})
    return {"media_id": media_id, "url": f"/api/media/{media_id}"}


@router.get("/media/{media_id}")
async def get_media(media_id: str):
    db = get_db()
    doc = await db.media.find_one({"_id": media_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Media not found.")
    raw = base64.b64decode(doc["data"])
    return Response(content=raw, media_type=doc["content_type"])
