# CPL visual-access artwork repair v2 — 25 Oct 2026

**Status: source artwork materially revised; QA gate STILL OPEN.**
Review PR #21, branch `review/line-art-visual-tools-2026-10-24`. No merge, production link or deployment.

## Repair carried out
- Replaced all **99** visual positions across **17** standalone review worksheets.
- New source uses **91 embedded, scalable outline SVGs** and **8 text-only visual panels** for concepts for which a generic image was misleading.
- Ingested **45 source-attributed Lucide symbols** (ISC license: https://github.com/lucide-icons/lucide/blob/main/LICENSE), using original scalable vector path data. Individual source names are stored in `resources/therapy/line-art-review-icons-{1,2,3}.json`.
- Replaced the pointing icon with a right-pointing **Tabler** outline hand (MIT license; https://github.com/tabler/tabler-icons/blob/main/LICENSE), with a separately sourced Tabler sneaker for actual **SHOES**. These are not confused with gesture and movement.
- A simple custom line-drawn playground slide was inspected individually at enlarged and card size.
- Removed 8 ambiguous icons for subjective or relational concepts; plain words remain supported by the surrounding clinical text.
- Corrected important semantic conflicts: **YES = check, SAME = equals, FINISHED = flag**; **change** and **say again** have distinct arrows; **too many people** and **smaller group** no longer share an identical icon; **SHOES** is distinct from MOVE; changed the blocks depiction's caption from generic “Free time” to literal “Play with blocks.”
- Preserved the standalone review file, existing 17 tool functions, printable HTML text, and previously verified appropriate document safeguards.

## Checks this pass
1. Connector read-back verified **17 worksheet sections, 91 inline SVGs, 8 word panels, 0 remaining SVG sprite <use> dependencies**.
2. Verified the previous malformed custom POINT and HELP path geometries are absent from the updated branch file.
3. Read back Tabler right-pointing hand is present twice. The main icon library paths remain direct paths in SVG rather than rasterized characters.
4. Tested US Letter print layout locally with a text/size-equivalent **flow proxy**, confirming 17 pages and no page-size clipping. **This is a layout proxy, not an exact rendering of the updated branch artwork.**
5. Built and visually inspected six new, adult-respectful black-line candidate scenes (point to choice, two people working together, playground slide, backpack, quiet room, two adults together) in a separate local one-page PDF. The scenes are **not integrated into the web toolkit**, and should not be represented as the branch's icon drawings.
6. Independently rendered the custom slide vector; judged more recognizable than the old angular pseudo-slide.

## Remaining blockers / human review
- **Source-accurate browser/print screenshots of current PR branch** are still required. A local proxy check cannot establish this.
- Meaning comprehension at actual card size for **quiet place (armchair)**, **help (helping hands)**, right-pointing gesture and contextual supports. If not recognized by users, use clearer custom scene or a personal photo, rather than a generic icon.
- More coherent line-illustration style may be needed for tools where interaction is the message, notably **Repair the Message, Supported Consent, and Two Perspectives**. The abstract line icons alone may be insufficient.
- Adult aphasia and supported consent/assent content needs qualified SLP and clinician review. These are access aids, not diagnosis/capacity/consent validity tools.
- Screen reader/keyboard/mobile/high-contrast and real-printer checks remain outstanding.
- Ensure no browser-visible production links are changed before approvals.

**Gate:** PR #21 remains DRAFT / BLOCKED for adoption. Existing CPL stable and experimental branches are untouched.
