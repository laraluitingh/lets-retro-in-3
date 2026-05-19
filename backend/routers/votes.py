from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Card, Column, TeamMember, User, Vote
from schemas import VoteOut

router = APIRouter(prefix="/cards/{card_id}/vote", tags=["Votes"])


def _require_card_access(card_id: int, user: User, db: Session) -> Card:
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    col = db.get(Column, card.column_id)
    board = db.get(Board, col.board_id)
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == board.team_id, TeamMember.user_id == user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    return card


@router.post("/", response_model=VoteOut)
def toggle_vote(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = _require_card_access(card_id, current_user, db)
    existing = (
        db.query(Vote)
        .filter(Vote.card_id == card_id, Vote.user_id == current_user.id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        db.refresh(card)
        return VoteOut(card_id=card_id, voted=False, vote_count=len(card.votes))

    vote = Vote(card_id=card_id, user_id=current_user.id)
    db.add(vote)
    db.commit()
    db.refresh(card)
    return VoteOut(card_id=card_id, voted=True, vote_count=len(card.votes))
