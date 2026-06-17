from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import BaseEntity


class Bug(BaseEntity):
    """
    Bug model — extends BaseEntity.
    Represents a reported bug with status lifecycle and reproducibility info.
    Demonstrates inheritance from BaseEntity (same as Task and Category).
    """
    __tablename__ = "bugs"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    steps_to_reproduce: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    environment: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )

    user: Mapped[Optional["User"]] = relationship(  # type: ignore[name-defined]
        "User",
        back_populates="bugs",
    )

    def to_dict(self) -> dict:
        return self._to_dict()
