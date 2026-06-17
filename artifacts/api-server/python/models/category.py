from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import BaseEntity


class Category(BaseEntity):
    """
    Category model — extends BaseEntity.
    Groups tasks together with a label and a display color.
    """
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="#6366f1")

    tasks: Mapped[list["Task"]] = relationship(  # type: ignore[name-defined]
        "Task",
        back_populates="category",
        cascade="save-update, merge",
        lazy="select",
    )

    def to_dict(self) -> dict:
        return self._to_dict()
