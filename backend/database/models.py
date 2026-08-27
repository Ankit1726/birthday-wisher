from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

ThemeVariant = Literal["rose", "blush", "magenta", "lavender"]
Animation = Literal["cake", "confetti", "hearts", "sparkles", "balloons"]


# ---------- Auth ----------


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8, max_length=100)


class LoginRequest(BaseModel):
    username: str
    password: str = Field(min_length=1, max_length=100)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    name: str


# ---------- Album ----------


class Song(BaseModel):
    title: str
    singer: Optional[str] = ""
    url: str  # external link OR "/api/media/{id}" for uploaded audio


class FetchSongRequest(BaseModel):
    url: str = Field(min_length=8, max_length=2048)


class AlbumCreate(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=60)
    birthday: date
    wish_message: str = Field(default="", max_length=2000)
    theme: ThemeVariant = "rose"
    animations: list[Animation] = Field(default_factory=lambda: ["cake", "confetti"])


class AlbumUpdate(BaseModel):
    recipient_name: Optional[str] = None
    birthday: Optional[date] = None
    wish_message: Optional[str] = None
    theme: Optional[ThemeVariant] = None
    animations: Optional[list[Animation]] = None
    photo_id: Optional[str] = None
    songs: Optional[list[Song]] = None


class AlbumOut(BaseModel):
    id: str
    slug: str
    owner_id: str
    creator_name: str
    recipient_name: str
    wish_message: str
    theme: ThemeVariant
    animations: list[Animation]
    photo_id: Optional[str] = None
    songs: list[Song] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    birthday: Optional[date] = None
