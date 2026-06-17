# TaskFlow — Gerenciador de Tarefas

Sistema web de gerenciamento de tarefas implementado com conceitos de POO em Python no backend e React no frontend.

## Run & Operate

- `cd /home/runner/workspace/artifacts/api-server/python && uvicorn main:app --host 0.0.0.0 --port 8080 --reload` — API Python
- `pnpm --filter @workspace/task-manager run dev` — frontend React
- `pnpm run typecheck` — typecheck completo
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks e schemas Zod
- `python artifacts/api-server/python/seed.py` — popular banco com dados iniciais
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Backend: Python + FastAPI + SQLAlchemy (OOP)**
- DB: PostgreSQL (via psycopg2-binary + SQLAlchemy)
- Frontend: React + Vite + TanStack Query
- API codegen: Orval (do spec OpenAPI)
- UI: shadcn/ui + Tailwind CSS

## Where things live

- `lib/api-spec/openapi.yaml` — contrato OpenAPI (fonte da verdade)
- `artifacts/api-server/python/` — backend Python
  - `models/` — SQLAlchemy ORM (BaseEntity, Task, Category)
  - `repositories/` — padrão Repository (BaseRepository abstrata)
  - `services/` — lógica de negócio (TaskService, CategoryService)
  - `schemas/` — validação Pydantic
  - `routes/` — rotas FastAPI
  - `main.py` — app FastAPI com tabelas criadas no startup
- `artifacts/task-manager/src/` — frontend React
- `lib/api-client-react/src/generated/` — hooks React Query gerados
- `lib/api-zod/src/generated/` — schemas Zod gerados

## Architecture decisions

- **Backend em Python puro**: substituiu o servidor Node.js para demonstrar POO com FastAPI e SQLAlchemy.
- **Padrão Repository**: `BaseRepository` (ABC genérico) → `TaskRepository`, `CategoryRepository` e `UserRepository` herdam CRUD e acrescentam queries específicas.
- **Camada de serviço**: `TaskService`, `CategoryService` e `AuthService` encapsulam regras de negócio e delegam ao repositório.
- **`BaseEntity` compartilhada**: `id`, `created_at`, `updated_at` e `_to_dict()` protegido numa classe base que todos os models herdam.
- **OpenAPI-first**: spec em YAML gera hooks TypeScript e schemas Zod via Orval, mantendo frontend e backend em sincronia.
- **Autenticação JWT**: `AuthService` emite tokens HS256 com validade de 7 dias; rotas protegidas via `get_current_user` dependency do FastAPI.
- **Isolamento por usuário**: tasks e categories têm `user_id` FK — cada usuário vê apenas seus próprios dados.

## Conceitos de POO demonstrados

- **Herança**: `BaseEntity → Task, Category`; `BaseRepository → TaskRepository, CategoryRepository`
- **Encapsulamento**: `_to_dict()` protegido nos models; repositório como dependência privada nos services
- **Abstração**: `BaseRepository` é uma ABC com método `exists()` abstrato
- **Polimorfismo**: `find_all()` sobrescrito em `TaskRepository` com filtragem adicional

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Auth

- JWT via `python-jose[cryptography]` + `passlib[bcrypt]`
- **bcrypt deve ficar em 4.x** (`bcrypt==4.0.1`) — bcrypt 5.x é incompatível com passlib 1.7.4 (raises ValueError > 72 bytes)
- Token armazenado em `localStorage` no frontend; `setAuthTokenGetter` do `@workspace/api-client-react` injeta o header `Authorization: Bearer` automaticamente
- Tarefas e categorias são isoladas por `user_id` — cada usuário vê apenas os próprios dados
- Chave JWT via env `SECRET_KEY` (fallback para dev hardcoded)
- `pydantic[email]` necessário para validação de `EmailStr` nas schemas de auth

## Gotchas

- O servidor Python roda de `artifacts/api-server/python/` — o `cd` para esse diretório é necessário pois os imports são relativos.
- Após mudar o schema, rodar `python seed.py` com o banco limpo para repopular.
- Não usar `--app-dir` do uvicorn — usar `cd` com caminho absoluto no run command.
- `bcrypt` deve ser versão `4.0.1` — versão 5.x quebra o passlib com `ValueError: password cannot be longer than 72 bytes`.
