# CPL visual communication tools — independent second AI QA

**Date:** 25 October 2026  
**Reviewed:** `CPL_Communication_Visuals_Consistent_Meanings_v3.pdf`, nine US Letter pages, and matching `CPL_Communication_Visuals_Consistent_Meanings_v3.html`. Confirmed that the local HTML is byte-for-byte identical to GitHub draft-branch `resources/therapy/communication-consistent-symbol-meanings-review-2026-10-25.html` at blob `bb4e9d365129955f90e9f68b9248fbee256e62d1`.  
**Scope:** independent render, symbol-to-meaning, contrast discrimination, usage pathways, person-centered communication, reading order, print layout, and browser widths. No clinical user testing.  
**Disposition:** **FAIL for tool replacement.** Technical PDF integrity passes; meaningful visual access is uneven. Keep draft PR #21 blocked/unmerged, with production unchanged.

## Blockers discovered this independent pass

1. **P3: confirmed SVG-to-heading overlap.** In the Conversation Repair Card, the `SAY IT AGAIN` symbol visibly covers part of its label. PDF text span rect = `(392.99, 234.33, 488.28, 250.25)` points; a stroked illustration rect = `(417.60, 193.99, 479.32, 249.27)`, intersecting it. Previous out-of-bounds QA misses internal collisions. **Fix:** increase icon-to-text clearance or reduce pictogram height; recheck at actual print size.
2. **P2: the “SHOW ME CHOICES” drawing means sequence/change, not choice.** The image shows a book-like object, arrow, and cup. A choice should show two options *side by side*, without a directional arrow, with a distinct way to select neither or another option. Also `TRY ANOTHER WAY` is words in a box; accept that as text-led rather than pictorial.
3. **P8: the Body Clues map cannot be described as a predominantly pictorial communication aid.** Except for a generic body outline, proposed experiences and supports are all text-only, with `HUNGRY / THIRSTY` and `WATER / FOOD` merging distinct needs. This may function as a literate-user/partner worksheet but is not independently accessible as a picture dictionary. **Fix:** category-matched visual choices, actual ability to point to the body, separately selectable needs, or explicitly reclassify as a conversation guide.
4. **Responsive 768 px defect.** In a browser using the *exact HTML source*, `documentElement.scrollWidth = 816px` at a 768px viewport. At 375px no horizontal overflow, but 768px tablet width is not handled. The fixed-sheet layout should not force sideways navigation on tablet. At 1440px the page fits. Tested via Chromium/Playwright `set_content` because direct `file://` navigation was blocked by environment policy.
5. **P7: “NOT AVAILABLE” vs context explanation needs stricter separation.** The slash-circle is a plausible convention, not automatically self-explanatory. `CLOSED TODAY` is true only of the playground example, not a canonical definition. `SHOW ME MORE` uses a picture icon, whereas P4 `MORE INFORMATION` uses circled `i`; if the messages intend the same request, reuse the same token or make the difference explicit.

## Nine-page review

| Page | Tool | Independent rating | Reason / next fix |
|---|---|---|---|
| 1 | Response Menu | **REVISE** | Helpful route menu; pictorial `GESTURE` is only waving, which does not encompass nodding/other access methods. `I NEED TIME` clock and `I'M NOT SURE` question mark are distinct. Provide alternative access methods and partner checking as needed. |
| 2 | When Words Get Stuck | **FAIL meaning** | Choice image shows an arrowed change, not two choices. Other-way tile is text-led. Rename descriptions or redraw the choice comparison. |
| 3 | Conversation Repair Card | **FAIL visual** | Repeat symbol overlaps heading. `SAY IT AGAIN` / `USE DIFFERENT WORDS` are distinct in principle, but the speaker/recipient should be unambiguous (e.g. `Please say that again`). `NOT THAT` reuses an X whose established meaning elsewhere is a person's `NO`; test whether this is understood as rejecting an interpretation rather than refusing an activity. |
| 4 | Concrete Choice Board | **REVISE** | Two scenes now comparably simple; individual meaning still imperfect (`quiet place` = empty armchair + muted speaker). The example is only valid if those choices are actually available. `NEITHER`/`NOT NOW`/`ANOTHER IDEA` accessible by text only. |
| 5 | Supported Assent | **PROVISIONAL KEEP** | Strongest person-facing response set: clear YES, NO, NOT SURE, BREAK, STOP with non-equivalent meanings and autonomy statement. `TELL ME MORE` is relegated to an explanatory line, rather than an equally accessible selectable card; high priority to test with users. Consent and capacity are not established by these choices. |
| 6 | First / Then Board | **PROVISIONAL KEEP** | Sequence is visually conveyed. A free-standing backpack depicts the object, not necessarily `PUT ON BACKPACK`; consider person wearing it if task initiation is crucial. Clear placeholders below. |
| 7 | Plan B Flexibility Map | **REVISE** | Unavailable → alternative → what remains is spatially meaningful. Do not generalize `CLOSED TODAY` as an all-purpose definition. `SHOW ME MORE` graphic differs from info-request symbol on P4. |
| 8 | Body Clues → Needs Map | **FAIL as visual-access board** | Body outline is now appropriately unmarked and the person can indicate location, but rest of communication relies on printed phrases. `HUNGRY/THIRSTY`, `WATER/FOOD` conflate distinct messages. Could be acceptable as adult literate or partner-supported checklist instead. |
| 9 | Change Board — Usually/Today | **PROVISIONAL KEEP** | The two-row comparison preserves identical SCHOOL and HOME images, highlighting only the changed middle activity. Strong explanatory visual. Illustration styles differ (detailed slide vs bold doctor icon); no participant comprehension testing. Supplementary prototype remains explicitly labeled. |

## Technical checks: what actually passed

- **9 pages, US Letter (612 × 792 pt)**, real searchable text on every page, and all nine visible footers.
- 6 embedded `<img>` and 41 inline SVG elements in the HTML, with each referenced raster image loading in a controlled browser test; no JavaScript errors.
- Sampled page raster pixels (pages 1, 5, 7) are truly grayscale (`R = G = B`); no evidence of color leakage.
- 375px mobile viewport: document scroll width 375px; 1440px desktop fits. **768px tablet fails with 816px scroll width** (48px overflow).
- 7.5pt microtype appears in running title/footers on each page; core page text is larger. Physical printer legibility not tested.
- Previous 'no text beyond page' claim does **not** rule out the confirmed internal icon-to-heading collision on page 3.

## Cross-document semantic vocabulary

| Meaning | Current presentation | QA judgment |
|---|---|---|
| YES | Checkmark on P5 | Distinct, provisional |
| NO | X on P5 | Distinct, provisional; test competing use for `NOT THAT` P3 |
| NOT SURE | `?` on P1 and P5; text-only P8 | Mostly distinct; P8 exception is a text-only choice rather than a different icon |
| TIME | Same clock on P1/2/3/7 | **Consistency achieved**; labels vary appropriately (`I NEED TIME`, `MORE TIME`) |
| NOT AVAILABLE | Slashed circle P7 | Different from refusal; recognition still untested |
| MORE INFORMATION | Circled `i` P4; picture for `SHOW ME MORE` P7 | May be semantic mismatch; clarify whether those requests differ |
| BREAK vs STOP | Pause bars vs stop octagon P5, break icon P2 | Visually distinct; meaning appropriate |

## Conceptual assessment and approval limitations

- A recognizable icon may illustrate rather than enable a specific communicative act. Test: (a) what can a person express/reject with it; (b) does the *partner know what to do* with the selection; (c) are the choices real, personally meaningful, and accessible by the person's preferred method; (d) can the person convey unexpected responses.
- The designs should not be called a validated AAC system. Use the principles of feature matching, individual symbol recognition, field size, access method, and partner training in [ASHA's AAC practice portal](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/).
- **Independent participant comprehension/contrast testing, clinician/SLP review, screen-reader testing, physical printer testing, and explicit approval of actual tool replacements are pending.** The underlying 17 CPL originals must be preserved.

## Acceptance order

1. **Blocker:** fix page 3 collision, 768px horizontal overflow, page 2 false “choices” picture.
2. **Meaning:** make P8 a real individualizable visual choice/point board *or* accurately reclassify it; separate ambiguous bundled sensations/needs.
3. **Vocabulary:** write a small canonical register with distinct communicative functions, contrast pairs and real example captions; validate the NOT AVAILABLE mark and P4/P7 information requests.
4. **Clinical and access:** independent SLP and intended-user evaluation at *printed card size*, including low vision, aphasia, and different pointing/eye-gaze access methods. Do not interpret a checkmark as informed consent.
5. **Only then:** review one-to-one links to original CPL tools; do not merge or deploy without the user's explicit approval.