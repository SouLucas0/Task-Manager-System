from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class BaseEntity(Base):
    """
    Abstract base entity that all domain models inherit from.
    Implements common fields (id, created_at, updated_at) and
    a shared __repr__ method — demonstrating inheritance and encapsulation.
    """
    __abstract__ = True

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.id}>"

    def _to_dict(self) -> dict:
        """
        Serialize the entity's columns to a plain dict.
        Protected method — subclasses can override or extend.
        """
        result = {}
        for col in self.__table__.columns:
            val = getattr(self, col.name)
            if isinstance(val, datetime):
                val = val.isoformat()
            result[col.name] = val
        return result
