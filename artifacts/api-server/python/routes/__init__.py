from .health import router as health_router
from .tasks import router as tasks_router
from .categories import router as categories_router
from .auth import router as auth_router

__all__ = ["health_router", "tasks_router", "categories_router", "auth_router"]
