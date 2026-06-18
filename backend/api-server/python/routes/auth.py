from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import AuthService
from schemas.auth import RegisterInputSchema, LoginInputSchema, AuthResponseSchema, UserSchema
from .deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponseSchema, status_code=201)
def register(payload: RegisterInputSchema, db: Session = Depends(get_db)):
    return AuthService(db).register(payload)


@router.post("/login", response_model=AuthResponseSchema)
def login(payload: LoginInputSchema, db: Session = Depends(get_db)):
    return AuthService(db).login(payload)


@router.get("/me", response_model=UserSchema)
def me(current_user: User = Depends(get_current_user)):
    return UserSchema(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
    )
