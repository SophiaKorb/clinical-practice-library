# BLOCKING IMAGE QA — CPL line-art visual tools (25 October 2026)

**Disposition: FAIL / DO NOT MERGE OR DEPLOY**. This document audits the art in draft PR #21. The 17-tool page count and successful PDF render are **not** visual-quality approval.

## What was inspected
- The exact review HTML and rendered US Letter PDF (17 pages), at full-size and as a contact sheet.
- All 42 native SVG symbol definitions, rendered independently at enlarged size, plus 99 occurrences in the 17 tools.
- Local browser screenshot of the HTML and PDF page 1. Both show the same malformed icons, establishing that the principal defect is in source SVG geometry/selection, **not** PDF export scaling.
- Confirmed 17 actual tool sections and no blank SVG elements; technical print/PDF bounds checking alone did not catch semantic failure.

## Blocking glyphs — replace, don't resize
| Symbol | Uses | Affected tool pages | Confirmed problem |
|---|---:|---|---|
| `point` | 2 | 1, 2 | Upward isolated finger; can look like an inappropriate gesture, not pointing at a response |
| `help` | 4 | 3, 6, 8, 17 | Distorted ambiguous hand, no legible request-for-help action |
| `playground` | 2 | 5, 17 | Angular outline does not clearly depict playground/slide |
| `bag` | 3 | 4, 10, 17 | Looks like lock or handbag, not a backpack |
| `quiet` | 5 | 3, 6, 7, 11, 17 | House with plus; not recognizably a quiet space, may suggest clinic/hospital |
| `body` | 1 | 6 | Generic figure does not illustrate a body clue |
| `warning` | 1 | 6 | Generic warning triangle incorrectly stands for subjective “too much” |
**At least 18 image occurrences on 11 pages have these confirmed critical problems.** These are source/meaning failures. Other potentially misleading symbols also exist.

## Further revision required — 14 shared symbols, 41 occurrences
`hand`, `keyboard`, `school`, `walk`, `people`, `repeat`, `change`, `check`, `picture`, `blocks`, `neutral`, `stop`, `water`, `stairs`.

Specific conceptual failures:
- One `people` icon stands for **too many people**, **smaller group**, **someone with me**, and **company**. It cannot communicate the differences.
- One `check` means **yes**, **same**, and **finished**; this undermines the shared-symbol rule.
- `blocks` is used for **free time**, not merely blocks/play.
- `change` is used for **another way**, **unexpected change**, **changed routine**, and **another option**.
- `repeat` and `change` are visually too similar where both are intended as distinct instructions.
- The `school` shape is often too generic; `walk` is stylized and stiff; `hand` is not a convincingly natural gesture.

## Page-level preliminary disposition (image QA)
1 **FAIL** Supported Communication Options: point and gesture.
2 **FAIL** Repair the Message: point, ambiguous repeat/another-way.
3 **FAIL** What Helps Me?: quiet, help, two-person option ambiguous.
4 **FAIL** First → Then → Next: bag resembles lock; blocks do not communicate free time.
5 **FAIL** Change Board: playground scene invalid; core comparison structure otherwise good.
6 **FAIL** Visual Dictionary: ambiguous body clue, overload warning triangle, quiet.
7 **FAIL** Barrier → Support Matcher: quiet, identical groups for opposite supports, clock-to-clock information-free pairing.
8 **FAIL** Getting Started: help picture ambiguous; primary panels text-led.
9 **REVIEW** Try → Notice → Tell: mostly text; needs meaningful diagram QA.
10 **FAIL** Routine Map: bag ambiguous.
11 **FAIL** When Things Feel Too Much: quiet, repeated people icon for different choices.
12 **REVIEW** Notice Early Signs: primarily text; artwork not carrying the information.
13 **REVIEW** Words That Help: text-led; no art problem, but not an illustrated replacement.
14 **REVIEW** Two Perspectives: duplicated generic speech icon does not communicate differing viewpoints.
15 **REVIEW** Choice and Assent: generic check/cross/refresh pictograms; test recognition, but do not equate choice with capacity.
16 **REVIEW** Supported Consent: too text/icon generic, needs independent clinical/SLP safety review.
17 **FAIL** Reusable Picture Cards: propagates several failed symbols to standalone cards.

## Root cause
The authoring script constructed icons out of a few ad-hoc SVG strokes/paths, then reused those drawings for multiple unrelated meanings. Shape-rendering, page counts and clip bounds passed, but **an illustration comprehension and anatomy inspection was omitted**. The “professional line art” requirement was reduced to generic outline icons, not approved naturalistic pictograms.

## Required corrections / re-QA gates
1. **Hold PR #21**: keep it draft; do not merge, deploy, replace production visuals, or promote links.
2. Replace the 7 critical glyphs using individually reviewed, age-neutral line illustrations. Do not simply rename or enlarge the old icons.
3. Separate conflicting meanings (e.g., **too many people** vs **someone stays**; **yes** vs **same** vs **finished**; **change** vs **repeat**).
4. Re-render every icon on its own at 128×128 and at **actual printed card size**, next to its label; check physical anatomy and unambiguous objects.
5. Re-render every tool in browser and PDF, phone/tablet and US Letter black-and-white; inspect an enlarged proof page-by-page.
6. Ask independent users familiar with supported communication, including adults using communication supports, to identify pictures *without the text labels*. If not reliably identified, make the tool text-led or use a personally meaningful photo / established symbol.
7. Clinician/SLP review is mandatory for communication, assent and supported-consent tools. No pictogram indicates competence, capacity or agreement without verification.
8. Update the image inventory with ID, meaning, accepted source, roles/pages used, visual test status, and alt/text caption.

The existing production CPL pages, `main`, experimental branch, and all approval gates must remain unchanged.
