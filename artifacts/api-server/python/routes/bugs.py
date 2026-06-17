from typing import Optional, List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.bug_service import BugService
from schemas.bug import BugSchema, BugInputSchema, BugUpdateSchema, BugSummarySchema
from .deps import get_current_user

router = APIRouter(prefix="/bugs", tags=["bugs"])


@router.get("/summary", response_model=BugSummarySchema)
def get_bugs_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BugService(db).get_summary(user_id=current_user.id)


@router.get("", response_model=List[BugSchema])
def list_bugs(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BugService(db).list_bugs(user_id=current_user.id, status=status, priority=priority)


@router.post("", response_model=BugSchema, status_code=201)
def create_bug(
    payload: BugInputSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BugService(db).create_bug(payload, user_id=current_user.id)


@router.get("/{bug_id}", response_model=BugSchema)
def get_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BugService(db).get_bug(bug_id, user_id=current_user.id)


@router.patch("/{bug_id}", response_model=BugSchema)
def update_bug(
    bug_id: int,
    payload: BugUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BugService(db).update_bug(bug_id, payload, user_id=current_user.id)


@router.delete("/{bug_id}", status_code=204)
def delete_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    BugService(db).delete_bug(bug_id, user_id=current_user.id)
    return Response(status_code=204)
