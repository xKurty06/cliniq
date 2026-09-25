# User Roles and Permissions

| Role | Access |
|---|---|
| **Staff** (nurse/clinic assistant) | Full read/write — students, visits, incidents, inventory, reports, accounts; QR hub on computer and mobile |
| **Admin/Principal** | Read-only — reports, Clinic Overview Dashboard. No edit access anywhere |
| **PE/Sports Instructor** | Mobile-only, read-only — scan/enter a Student Number to view a student's full profile and visit/incident history. No action buttons |

**Deferred role (designed, not built):** Canteen Staff — same scoped-sign-in pattern as Instructor, narrower data scope (food allergies only). See `08-Logs/Issues-and-TODOs.md`.

## Display-Privacy Rule
A screen showing **multiple students at once** (Visit Log List, Incident Log List, the Dashboard's frequent-visitor section) shows the **Student Number**, not the name — these are the screens a bystander could glance at. A screen showing **one deliberately-identified student** (QR scan result, full profile, search results, the masterlist) shows the **full name** normally. See `06-Decisions/` for the correction history on this rule — it was originally scoped backwards and fixed once.

Full detail: Frontend Context Brief, Section 3.
