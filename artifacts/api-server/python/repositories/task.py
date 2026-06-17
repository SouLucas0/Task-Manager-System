from datetime import date
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.task import Task
from .base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    """
    Concrete repository for Task entities.
    Extends BaseRepository with filtering and summary queries.
    """

    def __init__(self, db: Session) -> None:
        super().__init__(db, Task)

    def exists(self, entity_id: int) -> bool:
        return self._db.query(Task.id).filter(Task.id == entity_id).scalar() is not None

    def find_all(self, status: Optional[str] = None, priority: Optional[str] = None, category_id: Optional[int] = None) -> List[Task]:  # type: ignore[override]
        query = self._db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if category_id is not None:
            query = query.filter(Task.category_id == category_id)
        return query.order_by(Task.created_at.desc()).all()

    def count_by_status(self, status: str) -> int:
        return self._db.query(func.count(Task.id)).filter(Task.status == status).scalar() or 0

    def count_by_priority(self, priority: str) -> int:
        return self._db.query(func.count(Task.id)).filter(Task.priority == priority).scalar() or 0

    def count_overdue(self) -> int:
        today = date.today().isoformat()
        return (
            self._db.query(func.count(Task.id))
            .filter(Task.due_date != None, Task.due_date < today, Task.status != "done")  # noqa: E711
            .scalar() or 0
        )

    def total_count(self) -> int:
        return self._db.query(func.count(Task.id)).scalar() or 0
