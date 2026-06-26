import os

import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Card, Column, TeamMember, User

router = APIRouter(prefix="/boards", tags=["Summarize"])


def _require_board_access(board_id: int, user: User, db: Session) -> Board:
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == board.team_id, TeamMember.user_id == user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    return board


@router.get("/{board_id}/summarize")
def summarize_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = _require_board_access(board_id, current_user, db)

    columns = (
        db.query(Column)
        .filter(Column.board_id == board_id)
        .order_by(Column.position)
        .all()
    )

    sections = []
    for col in columns:
        cards = db.query(Card).filter(Card.column_id == col.id).all()
        if not cards:
            continue
        items = "\n".join(f"  - {c.body}" for c in cards)
        sections.append(f"**{col.title}**\n{items}")

    if not sections:
        return {"summary": "The board has no cards yet — nothing to summarise."}

    board_text = "\n\n".join(sections)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI summarisation is not configured. Set the GEMINI_API_KEY environment variable.",
        )

    genai.configure(api_key=api_key)

    prompt = (
        f"You are a helpful scrum master assistant. Below is the content of a "
        f"retrospective board titled \"{board.title}\".\n\n"
        f"{board_text}\n\n"
        "Please provide a concise summary (3-5 sentences) of the key themes and "
        "sentiments from the retrospective, followed by a short numbered action plan "
        "based on the action items on the board. Format your response with a "
        "\"Summary\" section and an \"Action Plan\" section."
    )

    try:
        model = genai.GenerativeModel("gemini-3.5-flash")
        response = model.generate_content(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")
    return {"summary": response.text.strip()}
