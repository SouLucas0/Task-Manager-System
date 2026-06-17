"""
TaskFlow — Python OOP backend
Implements a task management REST API using:
  - Inheritance    : BaseEntity → Task, Category; BaseRepository → TaskRepository, CategoryRepository
  - Encapsulation  : Services hide repository access; _to_dict() is protected on models
  - Abstraction    : BaseRepository (ABC) defines the interface; concrete classes implement it
  - Polymorphism   : find_all() is overridden in TaskRepository with filtering behaviour
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routes import health_router, tasks_router, categories_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
