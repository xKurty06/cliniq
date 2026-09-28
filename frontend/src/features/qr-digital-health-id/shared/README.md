# Shared — QR Scanning Logic

The actual camera-scanning implementation, used by every context above (desktop webcam scan, mobile Staff scan, mobile Instructor scan). One implementation, not three.

Built on `qr-scanner` (nimiq), not a React-native QR library — see `CLINIQ-Knowledge-Base/06-Decisions/ADR-007-Stack-Finalization.md` for why: it falls back to its own decoder on browsers without the Barcode Detection API (i.e., every iPhone), where a purely-native-API library would silently fail to scan at all.

Expect a `useQrScanner` hook (wraps the library, exposes scan results/errors/loading state) and a `QrScannerView` component (the actual camera viewfinder UI) here — both consumed by `../desktop/` and `../mobile/`, not reimplemented in each.
