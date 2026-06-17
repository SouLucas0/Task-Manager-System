from typing import Optional, List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.task_service import TaskService
from schemas.task import TaskSchema, TaskInputSchema, TaskUpdateSchema, TaskSummarySchema
from .deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/summary", response_model=TaskSummarySchema)
def get_tasks_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).get_summary(user_id=current_user.id)


@router.get("", response_model=List[TaskSchema])
def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).list_tasks(
        status=status, priority=priority, category_id=category_id, user_id=current_user.id
    )


@router.post("", response_model=TaskSchema, status_code=201)
def create_task(
    payload: TaskInputSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).create_task(payload, user_id=current_user.id)


@router.get("/{task_id}", response_model=TaskSchema)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).get_task(task_id, user_id=current_user.id)


@router.patch("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: int,
    payload: TaskUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).update_task(task_id, payload, user_id=current_user.id)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    TaskService(db).delete_task(task_id, user_id=current_user.id)
    return Response(status_code=204)
