import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import action_items, auth, board_access, boards, cards, columns, teams, votes

app = FastAPI(title="Lets Retro In 3 API")

_frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(action_items.router)
app.include_router(boards.router)
app.include_router(board_access.router)
app.include_router(columns.router)
app.include_router(cards.router)
app.include_router(votes.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Lets Retro In 3 API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
