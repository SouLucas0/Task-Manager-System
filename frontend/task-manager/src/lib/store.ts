import { useSyncExternalStore } from "react";

// ── Types ─────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_color?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Bug {
  id: number;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  steps_to_reproduce: string | null;
  environment: string | null;
  version: string | null;
  url: string | null;
  user_agent: string | null;
  timestamp: string | null;
  issue_number: number | null;
  issue_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskSummary {
  total: number;
  by_status: { todo: number; in_progress: number; done: number };
  by_priority: { low: number; medium: number; high: number };
  overdue: number;
}

export interface BugSummary {
  total: number;
  by_status: { open: number; in_progress: number; resolved: number; closed: number };
  by_priority: { low: number; medium: number; high: number; critical: number };
}

// ── Auth helpers ────────────────────────────────────────────────────
const AUTH_KEY = "task-manager-auth";

export function getAuth(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { user: null, token: null };
}

export function setAuth(user: User, token: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
  emit();
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  emit();
}

// ── Store internals ─────────────────────────────────────────────────
const STORAGE_KEY = "task-manager-data";

interface Store {
  tasks: Task[];
  categories: Category[];
  bugs: Bug[];
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { tasks: [], categories: [], bugs: [] };
}

let _store: Store = loadStore();
let _listeners: Set<() => void> = new Set();

function saveStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_store));
  } catch { /* noop */ }
}

function emit() {
  _listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

function getSnapshot() {
  return JSON.stringify({ store: _store, auth: getAuth() });
}

// ── Public hook ─────────────────────────────────────────────────────
export function useStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  const { store, auth } = JSON.parse(snap);
  return {
    tasks: store.tasks as Task[],
    categories: store.categories as Category[],
    bugs: store.bugs as Bug[],
    user: auth.user as User | null,
  };
}

// ── Seed (runs once) ────────────────────────────────────────────────
export function seedData() {
  const cats: Category[] = [
    { id: 1, name: "Trabalho", color: "#6366f1", created_at: now(), updated_at: now() },
    { id: 2, name: "Pessoal", color: "#22c55e", created_at: now(), updated_at: now() },
    { id: 3, name: "Urgente", color: "#ef4444", created_at: now(), updated_at: now() },
  ];
  const tasks: Task[] = [
    { id: 1, title: "Revisar documenta\u00e7\u00e3o", description: "Ler e comentar", status: "todo", priority: "medium", due_date: null, category_id: 1, created_at: now(), updated_at: now(), category_name: "Trabalho", category_color: "#6366f1" },
    { id: 2, title: "Enviar relat\u00f3rio", description: null, status: "in_progress", priority: "high", due_date: now(), category_id: 1, created_at: now(), updated_at: now(), category_name: "Trabalho", category_color: "#6366f1" },
    { id: 3, title: "Comprar mantimentos", description: null, status: "todo", priority: "low", due_date: null, category_id: 2, created_at: now(), updated_at: now(), category_name: "Pessoal", category_color: "#22c55e" },
  ];
  _store = { tasks, categories: cats, bugs: [] };
  saveStore();
  emit();
}

function now() {
  return new Date().toISOString();
}

export function getAuthUser(): User | null {
  return getAuth().user;
}

// ── Task CRUD ───────────────────────────────────────────────────────
export function getTasksSummary(): TaskSummary {
  const tasks = _store.tasks;
  const summary: TaskSummary = {
    total: tasks.length,
    by_status: { todo: 0, in_progress: 0, done: 0 },
    by_priority: { low: 0, medium: 0, high: 0 },
    overdue: 0,
  };
  for (const t of tasks) {
    summary.by_status[t.status]++;
    summary.by_priority[t.priority]++;
    if (t.due_date && new Date(t.due_date) < new Date()) summary.overdue++;
  }
  return summary;
}

export function getBugsSummary(): BugSummary {
  const bugs = _store.bugs;
  const summary: BugSummary = {
    total: bugs.length,
    by_status: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    by_priority: { low: 0, medium: 0, high: 0, critical: 0 },
  };
  for (const b of bugs) {
    summary.by_status[b.status]++;
    summary.by_priority[b.priority]++;
  }
  return summary;
}

export function createTask(data: Partial<Task> & { title: string }): Task {
  const cat = _store.categories.find((c) => c.id === (data.category_id ?? null));
  const task: Task = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? "todo",
    priority: data.priority ?? "medium",
    due_date: data.due_date ?? null,
    category_id: data.category_id ?? null,
    created_at: now(),
    updated_at: now(),
    category_name: cat?.name,
    category_color: cat?.color,
  };
  _store.tasks.unshift(task);
  saveStore();
  emit();
  return task;
}

export function updateTask(id: number, data: Partial<Task>): Task | null {
  const idx = _store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const cat = data.category_id !== undefined
    ? _store.categories.find((c) => c.id === data.category_id)
    : undefined;
  const updated = { ..._store.tasks[idx], ...data, updated_at: now() };
  if (cat) {
    updated.category_name = cat.name;
    updated.category_color = cat.color;
  } else if (data.category_id === null) {
    updated.category_name = undefined;
    updated.category_color = undefined;
  }
  _store.tasks[idx] = updated;
  saveStore();
  emit();
  return updated;
}

export function deleteTask(id: number) {
  _store.tasks = _store.tasks.filter((t) => t.id !== id);
  saveStore();
  emit();
}

// ── Category CRUD ───────────────────────────────────────────────────
export function createCategory(data: { name: string; color: string }): Category {
  const cat: Category = {
    id: Date.now(),
    name: data.name,
    color: data.color,
    created_at: now(),
    updated_at: now(),
  };
  _store.categories.push(cat);
  saveStore();
  emit();
  return cat;
}

export function updateCategory(id: number, data: Partial<Category>): Category | null {
  const idx = _store.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  _store.categories[idx] = { ..._store.categories[idx], ...data, updated_at: now() };
  // sync category name on tasks
  if (data.name) {
    for (const t of _store.tasks) {
      if (t.category_id === id) {
        t.category_name = data.name;
        t.category_color = data.color || t.category_color;
      }
    }
  }
  saveStore();
  emit();
  return _store.categories[idx];
}

export function deleteCategory(id: number) {
  _store.categories = _store.categories.filter((c) => c.id !== id);
  for (const t of _store.tasks) {
    if (t.category_id === id) {
      t.category_id = null;
      t.category_name = undefined;
      t.category_color = undefined;
    }
  }
  saveStore();
  emit();
}

// ── Bug CRUD ────────────────────────────────────────────────────────
export function createBug(data: Partial<Bug> & { title: string }): Bug {
  const bug: Bug = {
    id: Date.now(),
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? "open",
    priority: data.priority ?? "medium",
    steps_to_reproduce: data.steps_to_reproduce ?? null,
    environment: data.environment ?? null,
    version: data.version ?? null,
    url: data.url ?? null,
    user_agent: data.user_agent ?? null,
    timestamp: data.timestamp ?? null,
    issue_number: null,
    issue_url: null,
    created_at: now(),
    updated_at: now(),
  };
  _store.bugs.unshift(bug);
  saveStore();
  emit();
  return bug;
}

export function updateBug(id: number, data: Partial<Bug>): Bug | null {
  const idx = _store.bugs.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  _store.bugs[idx] = { ..._store.bugs[idx], ...data, updated_at: now() };
  saveStore();
  emit();
  return _store.bugs[idx];
}

export function deleteBug(id: number) {
  _store.bugs = _store.bugs.filter((b) => b.id !== id);
  saveStore();
  emit();
}

// Auto-seed on first load if empty
if (_store.tasks.length === 0 && _store.categories.length === 0) {
  seedData();
}
