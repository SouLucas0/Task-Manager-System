from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import BaseEntity

if TYPE_CHECKING:
    from .task import Task
    from .category import Category


class User(BaseEntity):
    """
    User model — extends BaseEntity.
    Stores authentication credentials and links to owned tasks/categories.
    Demonstrates inheritance from BaseEntity.
    """
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="user", lazy="dynamic")
    categories: Mapped[list["Category"]] = relationship("Category", back_populates="user", lazy="dynamic")

    def to_dict(self) -> dict:
        data = self._to_dict()
        data.pop("password_hash", None)
        return data
