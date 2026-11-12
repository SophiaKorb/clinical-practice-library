# CPL visual reference technical accessibility QA — November 11, 2026

**Source:** draft PR #21, commit `b6f1e67167c00a2b162bcdd08dbdb96c393e7776`.  
**Earlier comprehensive review:** draft PR #23, verified commit `4230b7efc3a42a06b29d1bcb0c43f9e9cdb97641` (mainline catalog/navigation fixes; not merged).  
**Working branch:** `review/cpl-visual-accessibility-20261111`, based directly on PR #21 to isolate visual-tool changes.  
**Disposition:** technical draft, independent of main/PR #21; no PHI, merge, deploy, publish or permission changes approved.

## Source-confirmed defects

1. Thirteen main landmarks (`<main class="pagebody">` on each sheet) make navigating the 13-sheet document confusing for assistive technology. There was no first-tab skip link.
2. The 13-entry selector duplicated tool 2. Print current selected one sheet by index, so the Visual Dictionary could print incompletely.
3. The prior PR #21 CI at `b6f1e67167c00a2b162bcdd08dbdb96c393e7776`: site QA succeeded in run [40269281782](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/40269281782); the old PR19 rendered workflow run [40269281824](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/40269281824) was **skipped**, not passed.

## Changes on this isolated branch

- One top-level main landmark with focusable skip destination; 13 preserved per-sheet bodies and SVG/icons.
- Visible first-keyboard-stop skip link with print-hidden treatment and strong focus outline.
- Twelve unique tool selector items, an explicit "2 pages" dictionary label, and reduced-motion-aware scroll.
- Print current groups sheets by tool; Visual Dictionary prints two pages. Print all stays 13 pages.
- Deterministic keyboard, source, four-viewport and PDF page-count regressions in review-only CI.
- Vercel branch-local `git.deploymentEnabled:false` installed before branch creation; do not merge as-is.

## Regression evidence

**Run 43158590138 — site QA: SUCCESS** at initial commit `831f6d474262d2e94f490dbd177a63a1882b1ac0`. The new static structure regression passed.

**Run 43158590166 — rendered QA: FAILED (harness defect)** at that same commit. Chromium verified the 320px keyboard/skip/choice checks and successfully generated a **two-page Visual Dictionary PDF** before the test mistakenly attempted to operate a toolbar control while print media (which correctly hides the toolbar) was still emulated. The test harness now returns to screen media between user actions. This is a test-only correction, not a content/artwork change. The corrected test subsequently passed at the exact commit detailed below.

**Corrected exact-head verification (commit `ccd15de83852a91431bd113963e0d260ea1a0e09`):**

- [CPL site QA, run 43158853504](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43158853504): **SUCCESS** (full static/content/navigation check suite, including new structural test).
- [CPL visual reference Chromium review, run 43158853478](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43158853478): **SUCCESS**. The job log reports four widths (320, 390, 768, 1280), 60 grouped assertions, first-tab skip navigation, main focus, keyboard Space/Enter choice activation, reset, 12-tool selector, overflow checks, print-only hide behavior, and PDFs of exactly **2 / 1 / 13** pages (Visual Dictionary / Words That Help / all).
- The older [PR19 smoke workflow 43158853545](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43158853545) remains intentionally **SKIPPED** due to its unrelated branch filter. It is not counted as a passed test.

These are independent *automated Chromium print and interaction checks*, not independent screen-reader-user testing, tagged PDF/UA assurance, physical print proofs, or clinical symbol validation. Final PR-head status must be verified again after this documentation commit; the dedicated review workflow is configured to rerun.

## Remaining human gates

- **Ready for Human Review:** qualified clinician/SLP review of symbol semantics, consent/assent and alternatives, developmental access and trauma-informed wording.
- **Ready for Human Review:** independent users without captions to test symbol understanding, with preferred communication systems and alternative response methods.
- **Ready for Human Review:** independent screen-reader reading-order and landmark navigation, keyboard use with assistive input, actual-size B&W print, large-print/CVI needs.
- **Ready for Human Review:** source/rights/clinical approval and explicit publication authorization before any merge, replacement, deploy or public distribution.

The existing 17 communication tools remain unchanged; this is not a clinical or accessibility certification.

## Additional deep accessibility and PDF QA (November 12, 2026)

A separate deeper automated review now executes axe-core WCAG 2.0/2.1 A/AA and best-practice checks at 320, 390, 768, and 1280px; checks keyboard toolbar order, named choice controls, source semantics, printed text clipping, and extracts PDF text and page bounds with PyMuPDF. It also rasterizes pages in grayscale to verify dark/light detail and reports potentially low-contrast text spans (comparison to white alone is a screening heuristic, not WCAG certification for nonwhite backgrounds). A PDF text layer is checked independently of rendering. Exact-head outcomes must be attached after execution. Specialist review remains separately gated.

## Deep-axe findings and corrections (November 12, 2026)

The initial [deep-audit run 43302724811](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43302724811) on commit `2abed308023c0ea50320bf571fa4ac7574942236` correctly **FAILED**: axe-core identified 9–10 color-contrast failures per width (320, 390, 768, 1280), two heading-order findings (H1 → H3), and the instruction paragraph outside a landmark. The same run reported no text crossing printable sheet edges. The full repository [site QA run 43302724829](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43302724829) passed but did not include these deep tests.

This review branch now darkens only low-contrast placeholder text in CSS, changes six stage heading tags H3 → H2 while preserving their typography and words, and moves the existing instruction paragraph into the page main landmark while maintaining visual order. No SVG, bitmap, selectable symbol, phrase, or clinical guidance changes were made. A follow-up axe-core + PDF text/grayscale run must determine whether these fixes are sufficient.
