from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.task import Task
from repositories.task import TaskRepository
from schemas.task import TaskInputSchema, TaskUpdateSchema, TaskSummarySchema


class TaskService:
    """
    Service layer encapsulating all task business logic.
    Mediates between routes and the TaskRepository — keeps routes thin.

    Demonstrates:
    - Encapsulation (repository is a private dependency)
    - Single-responsibility (only task-related logic lives here)
    """

    def __init__(self, db: Session) -> None:
        self._repo = TaskRepository(db)

    def list_tasks(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category_id: Optional[int] = None,
    ) -> List[dict]:
        tasks = self._repo.find_all(status=status, priority=priority, category_id=category_id)
        return [t.to_dict() for t in tasks]

    def get_task(self, task_id: int) -> dict:
        task = self._repo.find_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task.to_dict()

    def create_task(self, data: TaskInputSchema) -> dict:
        task = Task(
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            due_date=data.due_date,
            category_id=data.category_id,
        )
        saved = self._repo.save(task)
        return saved.to_dict()

    def update_task(self, task_id: int, data: TaskUpdateSchema) -> dict:
        task = self._repo.find_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        updates = data.model_dump(exclude_none=True)
        for field, value in updates.items():
            setattr(task, field, value)
        saved = self._repo.save(task)
        return saved.to_dict()

    def delete_task(self, task_id: int) -> None:
        task = self._repo.find_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        self._repo.delete(task)

    def get_summary(self) -> TaskSummarySchema:
        return TaskSummarySchema(
            total=self._repo.total_count(),
            overdue=self._repo.count_overdue(),
            by_status={
                "todo": self._repo.count_by_status("todo"),
                "in_progress": self._repo.count_by_status("in_progress"),
                "done": self._repo.count_by_status("done"),
            },
            by_priority={
                "low": self._repo.count_by_priority("low"),
                "medium": self._repo.count_by_priority("medium"),
                "high": self._repo.count_by_priority("high"),
            },
        )
