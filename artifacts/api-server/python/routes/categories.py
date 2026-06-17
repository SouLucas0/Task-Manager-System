from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
from services.category_service import CategoryService
from schemas.category import CategorySchema, CategoryInputSchema

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategorySchema])
def list_categories(db: Session = Depends(get_db)):
    return CategoryService(db).list_categories()


@router.post("", response_model=CategorySchema, status_code=201)
def create_category(payload: CategoryInputSchema, db: Session = Depends(get_db)):
    return CategoryService(db).create_category(payload)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    CategoryService(db).delete_category(category_id)
    return Response(status_code=204)
