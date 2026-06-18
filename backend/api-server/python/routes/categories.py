from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.category_service import CategoryService
from schemas.category import CategorySchema, CategoryInputSchema
from .deps import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategorySchema])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CategoryService(db).list_categories(user_id=current_user.id)


@router.post("", response_model=CategorySchema, status_code=201)
def create_category(
    payload: CategoryInputSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CategoryService(db).create_category(payload, user_id=current_user.id)


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    CategoryService(db).delete_category(category_id, user_id=current_user.id)
    return Response(status_code=204)
