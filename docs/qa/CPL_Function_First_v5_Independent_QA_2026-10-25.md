# CPL functional communication visual tools — v5 QA report

**Date:** 25 October 2026  
**Status:** Draft review candidate. **Not a validated visual communication system. No production release or replacement is authorized.**

## Source preservation
- Original CPL's 17 tools in `main/resources/therapy/communication-supports-toolkit.html` are left unchanged.
- Eight existing named functions are illustrated and the ninth, **Change Board — Usually / Today**, remains explicitly **supplemental**.
- Unapproved **Repair the Message** title was not reintroduced. The existing **Conversation Repair Card** name remains.

## Third-pass QA findings addressed
1. **P2 SHOW ME CHOICES:** two concrete examples placed side by side with **OR**, no affirmative/negative checkmarks and no sequential arrow. Partner still must provide actual available choices.
2. **P3 SHOW ME:** action now depicts two people and one showing a picture; the person's POINT action is not reused for a request to a communication partner.
3. **P4 Concrete Choice Board:** explicit **BOTH, NEITHER, SOMETHING ELSE, NOT NOW** alongside the two example supports. The board says support options need not be mutually exclusive. Local browser inputs can change labels and insert images before printing.
4. **P5 Supported Assent:** YES caption now reads **I want to do this**, not only “I want to continue.” The response context and independent uncertainty, refusal and information routes remain explicit.
5. **P7 Plan B:** proposed library trip is a **possible option**, not presumed chosen. Response **NO / I DO NOT WANT THIS** is distinct from NOT AVAILABLE.
6. **P8 Body Clues:** three meanings separately organized — **where**, **what I notice**, **environment around me**, and **what might help**. Food and water have action/request images different from hunger and thirst. Body outline remains unmarked; no diagnosis implied.
7. **P9 Change Board:** **PLAYGROUND → DOCTOR** displayed again in the DIFFERENT comparison, with exact same school/home artwork and explicit **School and home stay the same** text.
8. **Integration:** restored navigation list, nine **Print this tool** controls, **Print all**, and local name/photo customization for choice examples without changing original CPL resources.

## Verified tests
- PDF created from the exact v5 HTML using WeasyPrint, with **9 US Letter pages**, visible footers, searchable text and no text bounds outside physical pages. Printed line drawings and text were manually inspected on pages 8 and 9 after a footer-overlap correction.
- Self-contained HTML tested with local Chromium/Playwright using `page.set_content` at viewport widths **375, 600, 768, 800, 1024 and 1440 px**: no horizontal overflow or JavaScript errors, nine tool sections, ten navigation options including placeholder, nine individual print buttons.
- Choice A and B label change verified through the inputs.
- **Single-tool print** verified by browser print/PDF simulation: pressing the individual-print state for page 4 produced one US Letter page with Concrete Choice Board only.
- PDF grayscale sample verified; no colored pixels exceeding the test threshold.

## Findings remaining; do not overclaim
- Text in small Body Clues environment choices is still roughly **9pt print size**, and some explanatory labels on other pages are similarly small. Further readability improvement is advisable; converting Body Clues to a two-page reusable tool may ultimately be better than squeezing four distinct concepts into one page.
- The new **SHOW ME** scene is schematic: it remains a hypothesis that this actor/intent is more recognizable. No intended user has identified the image without labels.
- Scenes are still a mixture of detailed raster illustrations and simplified scalable symbols; illustration coherence remains a review concern.
- Example support choices must be replaced with **real available options**; the blank or customized choice board requires clinician/partner judgment and familiarity with the person's communication methods.
- Per-tool print action was tested programmatically with the applied print CSS state; real print dialogs, printers and screen reader interactions have not been verified.
- No SLP consultation, consent/capacity validation, user preference review, live clinical usability study, or representative aphasia/AAC user testing completed.
- This set is **not equivalent** to all 17 existing CPL tools. A future source-to-target crosswalk and human approval remain required.

**Release boundary:** Draft PR #21 stays unmerged, undeployed and unlinked to production; `main`, production aliases, D1, stable existing pages and colorful branch remain unchanged.