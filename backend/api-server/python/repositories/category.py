from typing import Optional, List
from sqlalchemy.orm import Session
from models.category import Category
from .base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """
    Concrete repository for Category entities.
    Inherits all CRUD from BaseRepository and adds category-specific queries.
    """

    def __init__(self, db: Session) -> None:
        super().__init__(db, Category)

    def exists(self, entity_id: int) -> bool:
        return self._db.query(Category.id).filter(Category.id == entity_id).scalar() is not None

    def find_all_by_user(self, user_id: int) -> List[Category]:
        return self._db.query(Category).filter(Category.user_id == user_id).order_by(Category.name).all()

    def find_by_name_and_user(self, name: str, user_id: int) -> Optional[Category]:
        return self._db.query(Category).filter(
            Category.name == name, Category.user_id == user_id
        ).first()

    def count_tasks(self, category_id: int) -> int:
        from models.task import Task
        return self._db.query(Task).filter(Task.category_id == category_id).count()
