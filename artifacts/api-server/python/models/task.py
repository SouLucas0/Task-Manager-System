from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import BaseEntity


class Task(BaseEntity):
    """
    Task model — extends BaseEntity.
    Represents a single unit of work with status, priority, and optional deadline.
    """
    __tablename__ = "tasks"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="todo")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    due_date: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )

    category: Mapped[Optional["Category"]] = relationship(  # type: ignore[name-defined]
        "Category",
        back_populates="tasks",
        lazy="joined",
    )

    def to_dict(self) -> dict:
        data = self._to_dict()
        data["category_name"] = self.category.name if self.category else None
        data["category_color"] = self.category.color if self.category else None
        return data
