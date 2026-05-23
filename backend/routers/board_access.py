from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Board, Team, TeamMember, User
from schemas import BoardPreviewOut

router = APIRouter(prefix="/boards", tags=["Board Access"])


@router.get("/{board_id}/preview", response_model=BoardPreviewOut)
def preview_board(board_id: int, db: Session = Depends(get_db)):
    """Public endpoint — returns board title and team name so a recipient of a
    shared link can see what they are about to join (no auth required)."""
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    team = db.get(Team, board.team_id)
    return BoardPreviewOut(
        id=board.id,
        title=board.title,
        team_id=board.team_id,
        team_name=team.name,
    )


@router.post("/{board_id}/join", status_code=status.HTTP_200_OK)
def join_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Adds the authenticated user as a member of the team that owns this board."""
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    existing = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == board.team_id, TeamMember.user_id == current_user.id)
        .first()
    )
    if existing:
        return {"ok": True, "already_member": True}

    db.add(TeamMember(team_id=board.team_id, user_id=current_user.id, role="member"))
    db.commit()
    return {"ok": True, "already_member": False}
