from pathlib import Path
import base64
import binascii
import hashlib
import hmac
import json
import os
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = BASE_DIR / "users.json"
AUTH_SECRET = os.environ.get("AUTH_SECRET", "change-this-dev-secret")
SESSION_TTL_SECONDS = int(os.environ.get("SESSION_TTL_SECONDS", "86400"))
DISPLAY_NAMES = {
    "bach": "Bách",
    "han": "Hân",
    "hieu": "Hiệu",
    "huy": "Huy",
    "khang": "Khang",
    "minh": "Minh",
    "ngan": "Ngân",
    "nguyen": "Nguyên",
    "nhi": "Nhi",
    "phuc_anh": "Phúc Anh",
    "quan": "Quân",
    "quynh_anh": "Quỳnh Anh",
    "thu": "Thư",
}

app = FastAPI(title="Login Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class SessionRequest(BaseModel):
    token: str
    path: str


def load_users() -> list[dict[str, str]]:
    with USERS_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def encode_part(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def decode_part(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def sign_payload(payload: str) -> str:
    signature = hmac.new(AUTH_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256)
    return encode_part(signature.digest())


def create_session_token(user: dict[str, str]) -> str:
    payload = {
        "displayName": DISPLAY_NAMES.get(user["username"], user["username"]),
        "exp": int(time.time()) + SESSION_TTL_SECONDS,
        "redirectUrl": user.get("redirectUrl"),
        "username": user["username"],
    }
    encoded_payload = encode_part(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    return f"{encoded_payload}.{sign_payload(encoded_payload)}"


def verify_session_token(token: str, path: str) -> dict[str, str]:
    try:
        encoded_payload, signature = token.split(".", 1)
        expected_signature = sign_payload(encoded_payload)

        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError

        payload = json.loads(decode_part(encoded_payload))
    except (binascii.Error, ValueError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Invalid session")

    if not isinstance(payload, dict):
        raise HTTPException(status_code=401, detail="Invalid session")

    try:
        expires_at = int(payload.get("exp", 0))
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid session")

    if expires_at < int(time.time()):
        raise HTTPException(status_code=401, detail="Session expired")

    redirect_url = payload.get("redirectUrl")

    if path != redirect_url:
        raise HTTPException(status_code=403, detail="Route is not allowed for this session")

    user_exists = any(
        user["username"] == payload.get("username") and user.get("redirectUrl") == redirect_url
        for user in load_users()
    )

    if not user_exists:
        raise HTTPException(status_code=401, detail="Session user no longer exists")

    return payload


@app.post("/api/login")
def login(payload: LoginRequest) -> dict[str, bool | str | None]:
    users = load_users()
    user = next(
        (
            item
            for item in users
            if item["username"] == payload.username and item["password"] == payload.password
        ),
        None,
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "displayName": DISPLAY_NAMES.get(user["username"], user["username"]),
        "ok": True,
        "redirectUrl": user.get("redirectUrl"),
        "token": create_session_token(user),
    }


@app.post("/api/session")
def verify_session(payload: SessionRequest) -> dict[str, bool | str | None]:
    session = verify_session_token(payload.token, payload.path)

    return {
        "displayName": session.get("displayName"),
        "ok": True,
        "redirectUrl": session.get("redirectUrl"),
    }
