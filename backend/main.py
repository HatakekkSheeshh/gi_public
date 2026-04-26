from pathlib import Path
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = BASE_DIR / "users.json"

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


def load_users() -> list[dict[str, str]]:
    with USERS_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


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

    return {"ok": True, "redirectUrl": user.get("redirectUrl")}
