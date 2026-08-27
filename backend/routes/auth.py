from fastapi import APIRouter, HTTPException, status

from backend.auth.auth import create_access_token, hash_password, verify_password
from backend.database.database import get_db
from backend.database.models import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(payload: RegisterRequest):
    db = get_db()
    username = payload.username.lower().strip()
    existing = await db.users.find_one({"username": username})
    if existing:
        raise HTTPException(status_code=409, detail="That username is already taken.")

    doc = {"name": payload.name.strip(), "username": username, "password_hash": hash_password(payload.password)}
    result = await db.users.insert_one(doc)
    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token, username=doc["username"], name=doc["name"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_db()
    user = await db.users.find_one(
        {
            "username": payload.username.lower().strip(),
        }
    )
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")

    token = create_access_token(str(user["_id"]))
    return TokenResponse(
        access_token=token, username=user["username"], name=user.get("name", user["username"])
    )
