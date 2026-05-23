from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Card, Column, TeamMember, User
from schemas import ActionItemOut

router = APIRouter(prefix="/teams/{team_id}", tags=["Action Items"])

ACTION_ITEMS_COLUMN = "Action Items"


def _require_membership(team_id: int, user: User, db: Session) -> TeamMember:
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    return member


def _build_action_item(card: Card, board: Board, column: Column) -> ActionItemOut:
    return ActionItemOut(
        id=card.id,
        body=card.body,
        done=card.done,
        author_id=card.author_id,
        author_name=card.author.name,
        vote_count=len(card.votes),
        board_id=board.id,
        board_title=board.title,
        column_id=column.id,
        created_at=card.created_at,
    )


@router.get("/action-items", response_model=list[ActionItemOut])
def list_action_items(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all cards from 'Action Items' columns across every board in the team."""
    _require_membership(team_id, current_user, db)

    results = (
        db.query(Card, Board, Column)
        .join(Column, Card.column_id == Column.id)
        .join(Board, Column.board_id == Board.id)
        .filter(
            Board.team_id == team_id,
            Column.title == ACTION_ITEMS_COLUMN,
        )
        .order_by(Card.done, Card.created_at.desc())
        .all()
    )

    return [_build_action_item(card, board, col) for card, board, col in results]


@router.patch("/action-items/{card_id}/toggle-done", response_model=ActionItemOut)
def toggle_action_item_done(
    team_id: int,
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(team_id, current_user, db)

    result = (
        db.query(Card, Board, Column)
        .join(Column, Card.column_id == Column.id)
        .join(Board, Column.board_id == Board.id)
        .filter(
            Card.id == card_id,
            Board.team_id == team_id,
            Column.title == ACTION_ITEMS_COLUMN,
        )
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Action item not found")

    card, board, col = result
    card.done = not card.done
    db.commit()
    db.refresh(card)
    return _build_action_item(card, board, col)
