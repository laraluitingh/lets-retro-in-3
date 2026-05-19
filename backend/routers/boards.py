from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Column, TeamMember, User
from schemas import BoardCreate, BoardOut, ColumnOut

router = APIRouter(prefix="/teams/{team_id}/boards", tags=["Boards"])

DEFAULT_COLUMNS = ["What Went Well", "What We Can Improve", "Action Items"]


def _require_membership(team_id: int, user: User, db: Session) -> TeamMember:
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    return member


@router.post("/", response_model=BoardOut, status_code=status.HTTP_201_CREATED)
def create_board(
    team_id: int,
    body: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(team_id, current_user, db)
    board = Board(team_id=team_id, title=body.title, created_by=current_user.id)
    db.add(board)
    db.flush()
    for i, title in enumerate(DEFAULT_COLUMNS):
        db.add(Column(board_id=board.id, title=title, position=i))
    db.commit()
    db.refresh(board)
    return board


@router.get("/", response_model=list[BoardOut])
def list_boards(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(team_id, current_user, db)
    return db.query(Board).filter(Board.team_id == team_id).all()


@router.get("/{board_id}", response_model=BoardOut)
def get_board(
    team_id: int,
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(team_id, current_user, db)
    board = db.query(Board).filter(Board.id == board_id, Board.team_id == team_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    team_id: int,
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = _require_membership(team_id, current_user, db)
    board = db.query(Board).filter(Board.id == board_id, Board.team_id == team_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board.created_by != current_user.id and membership.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized to delete this board")
    db.delete(board)
    db.commit()
