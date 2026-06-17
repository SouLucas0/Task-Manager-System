from typing import Optional
from pydantic import BaseModel, Field


class BugSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    steps_to_reproduce: Optional[str] = None
    environment: Optional[str] = None
    version: Optional[str] = None
    user_id: Optional[int] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class BugInputSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="open", pattern="^(open|in_progress|resolved|closed)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    steps_to_reproduce: Optional[str] = None
    environment: Optional[str] = Field(default=None, max_length=255)
    version: Optional[str] = Field(default=None, max_length=100)


class BugUpdateSchema(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(open|in_progress|resolved|closed)$")
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high|critical)$")
    steps_to_reproduce: Optional[str] = None
    environment: Optional[str] = Field(default=None, max_length=255)
    version: Optional[str] = Field(default=None, max_length=100)


class BugCountByStatusSchema(BaseModel):
    open: int
    in_progress: int
    resolved: int
    closed: int


class BugCountByPrioritySchema(BaseModel):
    low: int
    medium: int
    high: int
    critical: int


class BugSummarySchema(BaseModel):
    total: int
    by_status: BugCountByStatusSchema
    by_priority: BugCountByPrioritySchema
