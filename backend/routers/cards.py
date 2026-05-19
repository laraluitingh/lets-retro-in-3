from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Card, Column, TeamMember, User
from schemas import CardCreate, CardOut, CardUpdate

router = APIRouter(prefix="/columns/{column_id}/cards", tags=["Cards"])


def _require_column_access(column_id: int, user: User, db: Session) -> Column:
    col = db.get(Column, column_id)
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    board = db.get(Board, col.board_id)
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == board.team_id, TeamMember.user_id == user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    return col


def _card_out(card: Card) -> CardOut:
    return CardOut(
        id=card.id,
        column_id=card.column_id,
        body=card.body,
        author_id=card.author_id,
        author_name=card.author.name,
        vote_count=len(card.votes),
        created_at=card.created_at,
        updated_at=card.updated_at,
    )


@router.get("/", response_model=list[CardOut])
def list_cards(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_column_access(column_id, current_user, db)
    cards = db.query(Card).filter(Card.column_id == column_id).all()
    return [_card_out(c) for c in cards]


@router.post("/", response_model=CardOut, status_code=status.HTTP_201_CREATED)
def create_card(
    column_id: int,
    body: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_column_access(column_id, current_user, db)
    card = Card(column_id=column_id, author_id=current_user.id, body=body.body)
    db.add(card)
    db.commit()
    db.refresh(card)
    return _card_out(card)


@router.patch("/{card_id}", response_model=CardOut)
def update_card(
    column_id: int,
    card_id: int,
    body: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_column_access(column_id, current_user, db)
    card = db.query(Card).filter(Card.id == card_id, Card.column_id == column_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own cards")
    card.body = body.body
    db.commit()
    db.refresh(card)
    return _card_out(card)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    column_id: int,
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = _require_column_access(column_id, current_user, db)
    card = db.query(Card).filter(Card.id == card_id, Card.column_id == column_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    board = db.get(Board, col.board_id)
    is_board_owner = board.created_by == current_user.id
    if card.author_id != current_user.id and not is_board_owner:
        raise HTTPException(status_code=403, detail="Not authorized to delete this card")

    db.delete(card)
    db.commit()
