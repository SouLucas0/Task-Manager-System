from pydantic import BaseModel


class HealthStatusSchema(BaseModel):
    status: str
