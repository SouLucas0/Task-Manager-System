from fastapi import APIRouter
from schemas.health import HealthStatusSchema

router = APIRouter(tags=["health"])


@router.get("/healthz", response_model=HealthStatusSchema)
def health_check() -> HealthStatusSchema:
    return HealthStatusSchema(status="ok")
