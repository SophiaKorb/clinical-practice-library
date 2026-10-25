# CPL semantic visual QA repair — 25 October 2026

## Status
**Review candidate only; not approved for clinical use or deployment.**
This pass follows [the blocking visual QA](CPL_Unified_Symbol_Visual_QA_FAIL_2026-10-25.md).
All original main-branch CPL resources and titles remain unchanged. The standalone v2 nine-page review is at:
`resources/therapy/communication-semantic-repair-review-2026-10-25.html`.

## Targeted corrections
| Page | Tool | Corrected failure | Residual caution |
|---|---|---|---|
| 1 | Response Menu | Replaced fake “WAVE / NOD” label art with a legible waving hand drawing | A wave is only an example of gesture; individualize and confirm meaning |
| 2 | When Words Get Stuck | “Show me choices” now shows two recognizable objects, not blank rectangles; card layout checked | Examples cannot replace the person's real choices |
| 3 | Conversation Repair Card | “I mean something else” now text-led; no misleading pretend pictogram | Comprehension and response-method testing pending |
| 4 | Concrete Choice Board | Replaced wildly mismatched realistic-versus-stick art with **two similarly stroked line scenes**, quiet seated space/muted sound vs walking/movement | Pictograms are examples; use person's real choices/photos |
| 5 | Supported Assent | Kept distinct YES check, NO X, NOT SURE ?, BREAK pause, STOP octagon; replaced incorrect “NOT SURE = more information” caption with “I have not decided”; added separate TELL ME MORE | Capacity/informed consent are not established by a checkmark; qualified review needed |
| 6 | First / Then Board | Replaced footstep-only “outside” with person moving along outdoor path and sun; matched card heights | Still an illustrative sequence, not a compliance demand |
| 7 | Plan B Flexibility Map | Replaced plain book for “library” with library building and books | Original change/no-change and refusal paths preserved |
| 8 | Body Clues → Needs Map | Removed preselected abdominal dot, duplicate headphones, dense three-column layout and footer overlap; person chooses location and possible meaning independently | Body icon is generic; person may not locate a bodily clue; clinical assessment separately |
| 9 | Supplemental Change Board | Kept same symbols/positions for unchanged activities, distinct middle changed activity | Supplemental, not an existing approved CPL replacement |

## Actual QA
- **Exactly nine US Letter pages**, all with searchable text and unobstructed page footers.
- Sampled every PDF page at full print-size; image/text collision defects from the previous revision corrected (especially pages 1, 2, 6, 8).
- PDF raster grayscale check: **0 visibly colored pixels** at the test threshold on sampled downscaled images across all nine pages.
- PyMuPDF text bounding-box check: **no text outside physical page**.
- Browser-controlled DOM checks using Chromium + Playwright (page content from latest self-contained HTML): **9 tool sections, 40 SVGs, all image references load, 0 page JavaScript errors**, and **no horizontal overflow at 375px or 1440px**.
- Newly constructed SVGs carry aria-hidden while their accompanying text names the choice. Existing tool content is text rather than art-dependent.
- No source-system or production pages modified by the local creation of the review HTML and PDF.

## Not passed / not claimed
- No real users' symbol recognition measured; the “cover the labels” test is design review, **not** evidence of independent comprehension.
- No qualified clinician/SLP approved aphasia, assent, consent, or decision supports.
- No actual office-printer proof or screen-reader human testing yet.
- Some imagery remains pictographic rather than the more naturalistic approved six scenes; consider scene replacements only where the picture itself improves access.
- This draft should **not** replace any original CPL tool automatically; source-to-target crosswalk and explicit acceptance still required.

## Gate
Keep PR #21 draft; do not merge, deploy, update production, alter branch `main`, or replace original content.
