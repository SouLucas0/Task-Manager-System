import threading
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.bug import Bug
from repositories.bug import BugRepository
from schemas.bug import BugInputSchema, BugUpdateSchema, BugSummarySchema
from email_service import send_bug_report_email


class BugService:
    """
    Service layer for bug business logic.
    Encapsulates repository access — routes stay thin.
    Demonstrates encapsulation and single-responsibility.
    """

    def __init__(self, db: Session) -> None:
        self._repo = BugRepository(db)

    def list_bugs(
        self,
        user_id: int,
        status: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> List[dict]:
        bugs = self._repo.find_all(user_id=user_id, status=status, priority=priority)
        return [b.to_dict() for b in bugs]

    def get_bug(self, bug_id: int, user_id: int) -> dict:
        bug = self._repo.find_by_id(bug_id)
        if not bug or bug.user_id != user_id:
            raise HTTPException(status_code=404, detail="Bug not found")
        return bug.to_dict()

    def create_bug(self, data: BugInputSchema, user_id: int) -> dict:
        bug = Bug(
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            steps_to_reproduce=data.steps_to_reproduce,
            environment=data.environment,
            version=data.version,
            user_id=user_id,
        )
        saved = self._repo.save(bug)
        bug_dict = saved.to_dict()

        threading.Thread(
            target=send_bug_report_email,
            args=(bug_dict,),
            daemon=True,
        ).start()

        return bug_dict

    def update_bug(self, bug_id: int, data: BugUpdateSchema, user_id: int) -> dict:
        bug = self._repo.find_by_id(bug_id)
        if not bug or bug.user_id != user_id:
            raise HTTPException(status_code=404, detail="Bug not found")
        updates = data.model_dump(exclude_none=True)
        for field, value in updates.items():
            setattr(bug, field, value)
        saved = self._repo.save(bug)
        return saved.to_dict()

    def delete_bug(self, bug_id: int, user_id: int) -> None:
        bug = self._repo.find_by_id(bug_id)
        if not bug or bug.user_id != user_id:
            raise HTTPException(status_code=404, detail="Bug not found")
        self._repo.delete(bug)

    def get_summary(self, user_id: int) -> BugSummarySchema:
        return BugSummarySchema(
            total=self._repo.total_count(user_id),
            by_status={
                "open": self._repo.count_by_status("open", user_id),
                "in_progress": self._repo.count_by_status("in_progress", user_id),
                "resolved": self._repo.count_by_status("resolved", user_id),
                "closed": self._repo.count_by_status("closed", user_id),
            },
            by_priority={
                "low": self._repo.count_by_priority("low", user_id),
                "medium": self._repo.count_by_priority("medium", user_id),
                "high": self._repo.count_by_priority("high", user_id),
                "critical": self._repo.count_by_priority("critical", user_id),
            },
        )
