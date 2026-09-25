# Non-Functional Requirements — Full Detail

Kept in sync with the canonical Project Plan, Section 5.1. If you edit one, edit both.

---

**Non-Functional Requirements:**
- **Performance:** must run acceptably on the existing minimum-spec workstation (Intel Core i3 or equivalent, 4GB RAM) with no perceptible lag during data entry. The React frontend is compiled into optimized static assets at build time, so the workstation only ever serves and renders a finished bundle — it does not need to run the heavier Node.js build tooling in production, only during development
- **Security & Privacy:** Laravel Sanctum (bcrypt password hashing, session/token handling), session timeout, account lockout after repeated failed logins, and handling aligned with RA 10173 (legitimate purpose, consent, purpose limitation, and a defined data retention policy — see Section 5.3)
- **Availability:** must function fully offline from the public internet, over the school's employee-tier intranet only
- **Usability:** must be learnable by non-technical clinic staff within a single training session
- **Maintainability:** codebase and database schema documented clearly enough for the school's outsourced IT provider to support after the team's academic involvement ends
