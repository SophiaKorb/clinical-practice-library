# CPL visual reference technical accessibility QA — November 11, 2026

**Source:** draft PR #21, commit \`b6f1e67167c00a2b162bcdd08dbdb96c393e7776\`.  
**Earlier comprehensive review:** draft PR #23, verified commit \`4230b7efc3a42a06b29d1bcb0c43f9e9cdb97641\` (mainline catalog/navigation fixes; not merged).  
**Working branch:** \`review/cpl-visual-accessibility-20261111\`, based directly on PR #21 to isolate visual-tool changes.  
**Disposition:** technical draft, independent of main/PR #21; no PHI, merge, deploy, publish or permission changes approved.

## Source-confirmed defects

1. Thirteen main landmarks (\`<main class="pagebody">\` on each sheet) make navigating the 13-sheet document confusing for assistive technology. There was no first-tab skip link.
2. The 13-entry selector duplicated tool 2. Print current selected one sheet by index, so the Visual Dictionary could print incompletely.
3. The prior PR #21 CI at \`b6f1e67167c00a2b162bcdd08dbdb96c393e7776\`: site QA succeeded in run [40269281782](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/40269281782); the old PR19 rendered workflow run [40269281824](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/40269281824) was **skipped**, not passed.

## Changes on this isolated branch

- One top-level main landmark with focusable skip destination; 13 preserved per-sheet bodies and SVG/icons.
- Visible first-keyboard-stop skip link with print-hidden treatment and strong focus outline.
- Twelve unique tool selector items, an explicit "2 pages" dictionary label, and reduced-motion-aware scroll.
- Print current groups sheets by tool; Visual Dictionary prints two pages. Print all stays 13 pages.
- Deterministic keyboard, source, four-viewport and PDF page-count regressions in review-only CI.
- Vercel branch-local \`git.deploymentEnabled:false\` installed before branch creation; do not merge as-is.

## Regression evidence

**Pending exact-commit run** at initial file creation. The authoritative outcomes and run links will be attached to the new draft PR and incorporated into this register once verified. Previous draft page-count/rendering claims remain historical, not new evidence.

## Remaining human gates

- **Ready for Human Review:** qualified clinician/SLP review of symbol semantics, consent/assent and alternatives, developmental access and trauma-informed wording.
- **Ready for Human Review:** independent users without captions to test symbol understanding, with preferred communication systems and alternative response methods.
- **Ready for Human Review:** independent screen-reader reading-order and landmark navigation, keyboard use with assistive input, actual-size B&W print, large-print/CVI needs.
- **Ready for Human Review:** source/rights/clinical approval and explicit publication authorization before any merge, replacement, deploy or public distribution.

The existing 17 communication tools remain unchanged; this is not a clinical or accessibility certification.
