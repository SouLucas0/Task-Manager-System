from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.category import Category
from repositories.category import CategoryRepository
from schemas.category import CategoryInputSchema


class CategoryService:
    """
    Service layer for category business logic.
    Encapsulates validation and delegation to the CategoryRepository.
    """

    def __init__(self, db: Session) -> None:
        self._repo = CategoryRepository(db)

    def list_categories(self) -> List[dict]:
        categories = self._repo.find_all()
        return [c.to_dict() for c in categories]

    def create_category(self, data: CategoryInputSchema) -> dict:
        existing = self._repo.find_by_name(data.name)
        if existing:
            raise HTTPException(status_code=409, detail="Category with this name already exists")
        category = Category(name=data.name, color=data.color)
        saved = self._repo.save(category)
        return saved.to_dict()

    def delete_category(self, category_id: int) -> None:
        category = self._repo.find_by_id(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        self._repo.delete(category)
