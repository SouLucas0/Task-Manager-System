from typing import Optional
from pydantic import BaseModel, Field


class TaskSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class TaskInputSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="todo", pattern="^(todo|in_progress|done)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    due_date: Optional[str] = None
    category_id: Optional[int] = None


class TaskUpdateSchema(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(todo|in_progress|done)$")
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high)$")
    due_date: Optional[str] = None
    category_id: Optional[int] = None


class StatusCountSchema(BaseModel):
    todo: int
    in_progress: int
    done: int


class PriorityCountSchema(BaseModel):
    low: int
    medium: int
    high: int


class TaskSummarySchema(BaseModel):
    total: int
    overdue: int
    by_status: StatusCountSchema
    by_priority: PriorityCountSchema
