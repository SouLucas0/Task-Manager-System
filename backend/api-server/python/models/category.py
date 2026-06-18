from typing import Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import BaseEntity


class Category(BaseEntity):
    """
    Category model — extends BaseEntity.
    Groups tasks together with a label and a display color.
    Belongs to a User (owner).
    """
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="#6366f1")
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )

    tasks: Mapped[list["Task"]] = relationship(  # type: ignore[name-defined]
        "Task",
        back_populates="category",
        cascade="save-update, merge",
        lazy="select",
    )
    user: Mapped[Optional["User"]] = relationship(  # type: ignore[name-defined]
        "User",
        back_populates="categories",
    )

    def to_dict(self) -> dict:
        return self._to_dict()
