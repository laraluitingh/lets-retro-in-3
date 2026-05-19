from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Team, TeamMember, User
from schemas import InviteMemberRequest, TeamCreate, TeamMemberOut, TeamOut

router = APIRouter(prefix="/teams", tags=["Teams"])


def _require_membership(team_id: int, user: User, db: Session) -> TeamMember:
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    return member


@router.post("/", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    body: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = Team(name=body.name)
    db.add(team)
    db.flush()
    db.add(TeamMember(team_id=team.id, user_id=current_user.id, role="owner"))
    db.commit()
    db.refresh(team)
    return team


@router.get("/", response_model=list[TeamOut])
def list_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [m.team for m in current_user.memberships]


@router.get("/{team_id}", response_model=TeamOut)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(team_id, current_user, db)
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.get("/{team_id}/members", response_model=list[TeamMemberOut])
def list_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(team_id, current_user, db)
    return db.query(TeamMember).filter(TeamMember.team_id == team_id).all()


@router.post("/{team_id}/members", response_model=TeamMemberOut, status_code=status.HTTP_201_CREATED)
def invite_member(
    team_id: int,
    body: InviteMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = _require_membership(team_id, current_user, db)
    if membership.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can invite members")

    invitee = db.query(User).filter(User.email == body.email).first()
    if not invitee:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == invitee.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")

    new_member = TeamMember(team_id=team_id, user_id=invitee.id, role="member")
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = _require_membership(team_id, current_user, db)
    if membership.role != "owner" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    target = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(target)
    db.commit()
