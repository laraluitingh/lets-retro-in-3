from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Column, TeamMember, User
from schemas import ColumnCreate, ColumnOut, ColumnUpdate

router = APIRouter(prefix="/boards/{board_id}/columns", tags=["Columns"])


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


@router.get("/", response_model=list[ColumnOut])
def list_columns(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_board_access(board_id, current_user, db)
    return db.query(Column).filter(Column.board_id == board_id).order_by(Column.position).all()


@router.post("/", response_model=ColumnOut, status_code=status.HTTP_201_CREATED)
def create_column(
    board_id: int,
    body: ColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_board_access(board_id, current_user, db)
    col = Column(board_id=board_id, title=body.title, position=body.position)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.patch("/{column_id}", response_model=ColumnOut)
def update_column(
    board_id: int,
    column_id: int,
    body: ColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_board_access(board_id, current_user, db)
    col = db.query(Column).filter(Column.id == column_id, Column.board_id == board_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    if body.title is not None:
        col.title = body.title
    if body.position is not None:
        col.position = body.position
    db.commit()
    db.refresh(col)
    return col


@router.delete("/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_column(
    board_id: int,
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_board_access(board_id, current_user, db)
    col = db.query(Column).filter(Column.id == column_id, Column.board_id == board_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    db.delete(col)
    db.commit()
