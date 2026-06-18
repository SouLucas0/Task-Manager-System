from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List, Type
from sqlalchemy.orm import Session
from models.base import BaseEntity

T = TypeVar("T", bound=BaseEntity)


class BaseRepository(ABC, Generic[T]):
    """
    Abstract base repository — defines the contract for all data-access classes.
    Concrete repositories inherit this and get CRUD for free.

    Demonstrates:
    - Abstraction via ABC
    - Generics for type safety
    - Template Method pattern (find_all can be overridden)
    """

    def __init__(self, db: Session, model: Type[T]) -> None:
        self._db = db
        self._model = model

    def find_by_id(self, entity_id: int) -> Optional[T]:
        return self._db.get(self._model, entity_id)

    def find_all(self) -> List[T]:
        return self._db.query(self._model).all()

    def save(self, entity: T) -> T:
        self._db.add(entity)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self._db.delete(entity)
        self._db.commit()

    @abstractmethod
    def exists(self, entity_id: int) -> bool:
        """Subclasses must implement an existence check."""
        ...
