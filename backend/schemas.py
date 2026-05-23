from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Teams ─────────────────────────────────────────────────────────────────────

class TeamCreate(BaseModel):
    name: str

class TeamOut(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}

class TeamMemberOut(BaseModel):
    user: UserOut
    role: str
    joined_at: datetime

    model_config = {"from_attributes": True}

class InviteMemberRequest(BaseModel):
    email: str


# ── Boards ────────────────────────────────────────────────────────────────────

class BoardCreate(BaseModel):
    title: str

class BoardOut(BaseModel):
    id: int
    team_id: int
    title: str
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}

class BoardPreviewOut(BaseModel):
    id: int
    title: str
    team_id: int
    team_name: str


# ── Columns ───────────────────────────────────────────────────────────────────

class ColumnCreate(BaseModel):
    title: str
    position: int = 0

class ColumnUpdate(BaseModel):
    title: str | None = None
    position: int | None = None

class ColumnOut(BaseModel):
    id: int
    board_id: int
    title: str
    position: int

    model_config = {"from_attributes": True}


# ── Cards ─────────────────────────────────────────────────────────────────────

class CardCreate(BaseModel):
    body: str

class CardUpdate(BaseModel):
    body: str

class CardOut(BaseModel):
    id: int
    column_id: int
    body: str
    done: bool
    author_id: int
    author_name: str
    vote_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ActionItemOut(BaseModel):
    id: int
    body: str
    done: bool
    author_id: int
    author_name: str
    vote_count: int
    board_id: int
    board_title: str
    column_id: int
    created_at: datetime


# ── Votes ─────────────────────────────────────────────────────────────────────

class VoteOut(BaseModel):
    card_id: int
    voted: bool
    vote_count: int
