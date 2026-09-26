Date/Day/Time: Saturday, September 26, 2026 — actual time not available (no system clock access in this environment)
Agent: Claude (chat session)
Task: Build a frontend-specific loop-engineering operating manual with a resumable per-screen checklist; save the reference mockup image as a repo asset
Status: Completed
Prompt/Request: "Now make me a separate md file to do the loop engineering building and developing the frontend phases. Each build it should strictly countercheck, audit, confirm base on the features, functions, everything. It should also analyze or like simulate as if everything is finished if the flow is correct... also add checklist so if ever i ran out of token i can pass it to other agent." Confirmed frontend-only in the same turn. Also asked how to use the previously-uploaded reference mockup image, which was re-uploaded in this turn.
Files Modified: CLINIQ-Knowledge-Base/04-Development/Frontend-Loop-Engineering.md (new), CLINIQ-Knowledge-Base/03-Design/assets/reference-mockup.png (new asset), CLINIQ-Knowledge-Base/03-Design/Design-Audit-Reference-Mockup.md (added asset pointer), AGENTS.md, CLAUDE.md (both updated, kept identical)
Changes Made:
- Defined a 7-step loop (Read, Build, Countercheck, Audit, Simulate, Confirm, Log+Check Off) to be run per screen/component, not just per phase.
- The Simulate step specifically ties to the three flows already diagrammed in Activity-Diagram.md (QR scan-to-action, two-stage incident, Follow-Up handling) — using them as literal end-to-end test scripts rather than checking each screen only in isolation, which is where integration bugs would otherwise slip through.
- Built a fully resumable checklist covering F0 (setup + shared components), F1 (all 5 reference screens, full loop spelled out per screen), F2 (all ~30 remaining screens, grouped by module, checkbox + resume note per screen), and F3 (polish). Every single checklist item has its own "Resume Note" line specifically so a fresh agent picking this up mid-work — including mid-token-limit — knows exactly what's done and what the next action is, per the explicit request.
- Saved the reference mockup image as a real file in the repo (03-Design/assets/reference-mockup.png) rather than leaving it as something only described in a chat-derived audit document — this is what actually lets a multimodal coding agent view it directly.
- Built an explicit mapping table (in the new file) of which screens have a matching mockup screen and which specific corrections from the existing design audit apply to each — framed clearly as "layout/density reference only," never colors, never a target to replicate uncorrected.
Reason: Explicit request for a strict, auditable, resumable frontend build process, plus a practical question about how to actually use an already-uploaded reference image.
Testing Performed: N/A — documentation only.
Known Issues: None new.
Next Steps: Begin Phase F0 once the two blocking decisions (data-fetching library, routing library) are resolved.
