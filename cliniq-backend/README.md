# cliniq-backend

Laravel API backend. Not yet scaffolded — `composer create-project laravel/laravel .` will generate the standard `app/`, `database/`, `routes/`, `config/` structure here once environment setup is approved and executed (CLINIQ-Knowledge-Base/04-Development/Environment-Setup.md).

Expected shape once scaffolded, mapped to what's already designed:
- `app/Models/` — Student, User, Visit, Incident, FollowUp, InventoryItem, AuditLogEntry, etc. (Frontend Context Brief, Section 5, has the authoritative data shapes to match)
- `app/Http/Controllers/Api/` — one controller per feature, mirroring `cliniq-frontend/src/features/`
- `database/migrations/` — schema, build directly from the now-complete `CLINIQ-Knowledge-Base/02-Architecture/Database/ERD.md` (first draft, derived from already-documented requirements, not an external SRS)
- `routes/api.php` — all API routes, consumed by the frontend's `src/features/*/api/` folders
- Auth via Sanctum (CLINIQ-Knowledge-Base/06-Decisions/ADR-007-Stack-Finalization.md)
