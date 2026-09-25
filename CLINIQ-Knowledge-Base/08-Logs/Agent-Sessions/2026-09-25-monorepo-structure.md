Date: 2026-09-25
Agent: Claude (chat session)
Task: Build the monorepo folder structure (frontend + backend), resolve where QR scanning code organizationally belongs
Status: Completed
Prompt/Request: "Also I'll apply the monorepo frontend and backend, then for the qr scanner i'm not sure how to put it or where but also separate the folder since it's for the mobile view just to organize the folders but i think it will be in frontend folder. but for github i will repo the root folder"
Files Modified: Entire repo root restructured — AGENTS.md and CLAUDE.md moved from CLINIQ-Knowledge-Base/ to the true repo root; cliniq-frontend/ and cliniq-backend/ skeletons created; CLINIQ-Knowledge-Base/02-Architecture/System-Architecture.md updated; new ADR-008.
Changes Made:
- Confirmed monorepo (one repo, frontend + backend + knowledge base as siblings at root), consistent with what was proposed earlier and now actually built.
- Built cliniq-frontend/src/ as a feature-based structure (one folder per module), not a flat type-based structure — reasoned in ADR-008.
- Resolved the QR scanner organization question: features/qr-digital-health-id/ split into desktop/, mobile/, shared/, api/. desktop and mobile are separate because they have genuinely different information architecture (not just responsive variants); shared/ holds the one camera-scanning implementation (qr-scanner wrapper, per ADR-007) used by every context, so it isn't duplicated three times.
- Explicitly did not create a separate mobile frontend project — same app, same auth, same API underneath; the split is organizational, not architectural.
- Caught and fixed a real problem: AGENTS.md referenced vault-relative paths (e.g. `00-Project-Core/...`) that broke the moment AGENTS.md moved to the true repo root above the vault. Rewrote every reference to include the CLINIQ-Knowledge-Base/ prefix.
- Added a README.md to every frontend feature folder and the backend root, so "what goes here" is answered before any code exists.
Reason: User confirmed the monorepo approach and asked specifically where QR scanner code should be organized.
Testing Performed: N/A — folder structure and documentation only, no code, nothing installed.
Known Issues: cliniq-frontend/ and cliniq-backend/ are folder skeletons with README placeholders only — actual `npm create vite` / `composer create-project` scaffolding still requires separate explicit approval per the standing "don't execute until approved" rule.
Next Steps: Once environment setup is approved and run, the real Vite/Laravel scaffolding will land inside these already-organized folders rather than needing reorganization afterward.
