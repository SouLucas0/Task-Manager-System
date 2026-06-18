from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.bug import Bug
from .base import BaseRepository


class BugRepository(BaseRepository[Bug]):
    """
    Concrete repository for Bug entities.
    Extends BaseRepository with status/priority filtering and summary queries.
    Demonstrates polymorphism — find_all overridden with user scoping and filtering.
    """

    def __init__(self, db: Session) -> None:
        super().__init__(db, Bug)

    def exists(self, entity_id: int) -> bool:
        return self._db.query(Bug.id).filter(Bug.id == entity_id).scalar() is not None

    def find_all(  # type: ignore[override]
        self,
        user_id: int,
        status: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> List[Bug]:
        query = self._db.query(Bug).filter(Bug.user_id == user_id)
        if status:
            query = query.filter(Bug.status == status)
        if priority:
            query = query.filter(Bug.priority == priority)
        return query.order_by(Bug.created_at.desc()).all()

    def count_by_status(self, status: str, user_id: int) -> int:
        return (
            self._db.query(func.count(Bug.id))
            .filter(Bug.status == status, Bug.user_id == user_id)
            .scalar() or 0
        )

    def count_by_priority(self, priority: str, user_id: int) -> int:
        return (
            self._db.query(func.count(Bug.id))
            .filter(Bug.priority == priority, Bug.user_id == user_id)
            .scalar() or 0
        )

    def total_count(self, user_id: int) -> int:
        return (
            self._db.query(func.count(Bug.id))
            .filter(Bug.user_id == user_id)
            .scalar() or 0
        )
