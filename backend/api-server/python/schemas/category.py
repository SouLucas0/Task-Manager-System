from pydantic import BaseModel, Field


class CategorySchema(BaseModel):
    id: int
    name: str
    color: str
    created_at: str

    model_config = {"from_attributes": True}


class CategoryInputSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#6366f1")
