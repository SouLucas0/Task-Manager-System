---
name: bcrypt passlib compatibility
description: bcrypt 5.x is incompatible with passlib 1.7.4 — must pin to 4.x
---

## Rule
Always install `bcrypt==4.0.1` (not latest) when using `passlib[bcrypt]`.

**Why:** bcrypt 5.0.0 raises `ValueError: password cannot be longer than 72 bytes` during passlib's internal `detect_wrap_bug` test, crashing every bcrypt hash/verify call. passlib 1.7.4 (latest) has not been patched.

**How to apply:** When installing auth dependencies for Python projects: `pip install "passlib[bcrypt]" "bcrypt==4.0.1"`. Never let pip upgrade bcrypt to 5.x.
