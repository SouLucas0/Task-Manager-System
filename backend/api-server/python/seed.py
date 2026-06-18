"""
Seed script — populates initial categories and tasks for demo purposes.
Run once: python backend/api-server/python/seed.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
from models import Base, Category, Task

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    if db.query(Category).count() == 0:
        categories = [
            Category(name="Trabalho", color="#6366f1"),
            Category(name="Pessoal", color="#10b981"),
            Category(name="Estudos", color="#f59e0b"),
        ]
        db.add_all(categories)
        db.commit()
        for c in categories:
            db.refresh(c)
        print("Categories seeded.")
    else:
        categories = db.query(Category).all()
        print("Categories already exist.")

    cat_map = {c.name: c.id for c in categories}

    if db.query(Task).count() == 0:
        tasks = [
            Task(title="Revisar relatório trimestral", description="Analisar métricas do Q2 e preparar apresentação.", status="in_progress", priority="high", due_date="2026-06-20", category_id=cat_map.get("Trabalho")),
            Task(title="Reunião de planejamento", description="Definir metas para o próximo sprint.", status="todo", priority="medium", due_date="2026-06-18", category_id=cat_map.get("Trabalho")),
            Task(title="Estudar Programação Orientada a Objetos", description="Revisar conceitos de herança, polimorfismo e encapsulamento.", status="in_progress", priority="high", category_id=cat_map.get("Estudos")),
            Task(title="Fazer academia", status="todo", priority="low", category_id=cat_map.get("Pessoal")),
            Task(title="Ler livro de Python", description="Avançar até o capítulo 10.", status="todo", priority="medium", due_date="2026-06-30", category_id=cat_map.get("Estudos")),
            Task(title="Enviar proposta ao cliente", status="done", priority="high", category_id=cat_map.get("Trabalho")),
        ]
        db.add_all(tasks)
        db.commit()
        print("Tasks seeded.")
    else:
        print("Tasks already exist.")

finally:
    db.close()

print("Seed complete.")
