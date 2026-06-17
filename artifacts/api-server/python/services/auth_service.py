import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from models.user import User
from repositories.user import UserRepository
from schemas.auth import RegisterInputSchema, LoginInputSchema, UserSchema, AuthResponseSchema

SECRET_KEY = os.environ.get("SECRET_KEY", "taskflow-dev-secret-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """
    Service handling user registration, login, and token validation.
    Encapsulates password hashing and JWT logic away from routes.
    Demonstrates encapsulation (private _repo and _pwd_context).
    """

    def __init__(self, db: Session) -> None:
        self._repo = UserRepository(db)

    def register(self, data: RegisterInputSchema) -> AuthResponseSchema:
        if self._repo.email_exists(data.email):
            raise HTTPException(status_code=409, detail="Email already registered")
        hashed = _pwd_context.hash(data.password)
        user = User(name=data.name, email=data.email, password_hash=hashed)
        saved = self._repo.save(user)
        token = self._create_token(saved.id)
        return AuthResponseSchema(
            access_token=token,
            user=UserSchema(
                id=saved.id,
                name=saved.name,
                email=saved.email,
                is_active=saved.is_active,
                created_at=saved.created_at.isoformat(),
            ),
        )

    def login(self, data: LoginInputSchema) -> AuthResponseSchema:
        user = self._repo.find_by_email(data.email)
        if not user or not _pwd_context.verify(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is inactive")
        token = self._create_token(user.id)
        return AuthResponseSchema(
            access_token=token,
            user=UserSchema(
                id=user.id,
                name=user.name,
                email=user.email,
                is_active=user.is_active,
                created_at=user.created_at.isoformat(),
            ),
        )

    def get_current_user(self, token: str) -> User:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: Optional[int] = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        user = self._repo.find_by_id(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    def _create_token(self, user_id: int) -> str:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
