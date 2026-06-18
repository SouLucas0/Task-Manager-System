from typing import Optional
from sqlalchemy.orm import Session
from models.user import User
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Concrete repository for User entities.
    Extends BaseRepository with email-based lookup.
    """

    def __init__(self, db: Session) -> None:
        super().__init__(db, User)

    def exists(self, entity_id: int) -> bool:
        return self._db.query(User.id).filter(User.id == entity_id).scalar() is not None

    def find_by_email(self, email: str) -> Optional[User]:
        return self._db.query(User).filter(User.email == email).first()

    def email_exists(self, email: str) -> bool:
        return self._db.query(User.id).filter(User.email == email).scalar() is not None
