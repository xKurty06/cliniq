# Data Retention Policy

- Active student records: retained for duration of enrollment.
- **Post-departure retention: up to 5 years after archiving**, then deleted — not indefinite, not instant-delete. Covers legitimate continuity needs (re-enrollment, records requests, potential legal claims).
- Archiving (hidden from active lists) happens immediately on departure; deletion is a separate, later step at the end of the 5-year window.
- Audit trail: shorter, separate retention — it's the fastest-growing table by row count and is about system usage, not individual student health.
- No automated purge tooling built yet — current volume estimates (well under 1GB total, even after 20 years with zero purging) don't require it. **Trigger for building it:** the Backup Verification Assistant's tracked backup file size crossing a defined threshold, not a fixed calendar date.
- **Grounding:** RA 10173 (IRR Section 19) requires data not be retained "longer than necessary" for its purpose — it does not mandate a specific number of years. 5 years is the team's policy design, reasonable and defensible under that principle, not a number the statute hands you. Not verified legal advice; final sign-off should come from whoever handles data privacy compliance for the school, if that role is designated.

Full detail: Project Plan, Section 5.3.
