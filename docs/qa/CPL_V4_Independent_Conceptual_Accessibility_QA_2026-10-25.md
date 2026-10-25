# Clinical Practice Library: Version 4 independent conceptual & accessibility QA

**Review:** 25 October 2026  
**Source under review:** `resources/therapy/communication-functional-repair-v4-2026-10-25.html` on draft PR #21, checked against the local matching nine-page review PDF.  
**Baseline:** `main`'s `resources/therapy/communication-supports-toolkit.html` (17 original named tools) and `communication-toolkit.js`.

**Overall decision: HOLD FOR REVISION.** Physical page fit, grayscale legibility, and prior screen-size geometry are materially improved. However, artwork consistency, conversational agency, choice design, and restoration of live-site functions still need corrections. None of these judgments represents usability testing by people with communication disabilities.

## Summary of new findings

| Priority | Pages | Finding | Evidence / revision |
|---|---|---|---|
| **BLOCKER: semantic contrast** | **2** | **SHOW ME CHOICES** illustrates ✓ and − inside boxes. This can be perceived as approve/reject or yes/no, not two *neutral, simultaneously available* options. | Use two recognizable **different concrete options** side by side (e.g., water/tea when both are genuine options), separated by **OR**, not an arrow. Do not suggest a false binary. |
| **BLOCKER: false choice** | **4** | **A QUIET PLACE** vs **MOVE AROUND** implies an either/or choice, although someone may want both, neither, a different option, or the same activity in a calmer place. The secondary *neither/another idea* tiles have no visual support. | Make the page a reusable **A / B / BOTH / NEITHER / SOMETHING ELSE** layout only when appropriate, and substitute **two actually available, comparable choices**. Support *not now* separately. Allow actual photos/labels to be inserted without editing HTML code. |
| **BLOCKER: communication-role confusion** | **3** | The **pointing-hand image** means **I POINT** (p1) but means **SHOW ME** (p3), a request for *another person* to act. Same image, different actor. | Draw the communication partner presenting a picture, or keep text and a speaker-arrow scene showing who acts. Do not reuse the same picture for opposite conversational roles. |
| **MAJOR: states vs support overlap** | **8** | Identical food-plate drawing is used for **HUNGRY** and **FOOD**; identical glass for **THIRSTY** and **WATER**. The positions/section headings distinguish them for readers, but not reliably for a person who identifies the image alone. **TOO LOUD** is an external condition mixed with bodily sensations. | Separate **What I notice/feel** from **What may be happening around me** from **What I want to try**; use clear role markers/arrows or appropriately different images. Keep the body-map unmarked. Check this with intended users. |
| **MAJOR: age-/literacy-appropriate access** | **8** | Two instructional paragraphs are approximately **8.6 pt on US Letter**; the body figure is small for precise marking. The symbol system's choices heavily depend on text headings. | Expand body map or split it into an independent larger page; use 11–12 pt+ instructions; preserve 'I don't know', 'something else', and ability to skip body localization. |
| **MAJOR: agency** | **7** | **I DON'T LIKE IT** is not unambiguously **NO / I DON'T WANT TO GO**. One alternate plan appears as though it is the chosen replacement. | Distinguish information about unavailability from agreement with Plan B. Include explicit choice to decline, ask for another option, or defer. Maintain NOT AVAILABLE ≠ NO. |
| **MAJOR: incomplete change visual** | **9** | **DIFFERENT** panel only says “Middle activity changed”; the changed **PLAYGROUND → DOCTOR** picture pair is not repeated there. The phrase **“School → home stays”** can sound like a direct school-to-home transition, not that two endpoints remain unchanged. | Put the two changed symbols in the contrast area; say “School and home stay the same.” Continue to show identical school/home images in both rows. |
| **INTEGRATION BLOCKER** | **all** | The local **HTML has nine `<h1>` headings, but no button, link, interactive form, or `details` control**; `main`’s original toolkit has expand/collapse and per-tool printing. A direct replacement would drop existing user functionality and makes customized A/B boards impractical without editing source. The `<title>` still says **v3** even though the artwork/footer says **v4**. | Treat as **print proof only**, not an implemented CPL replacement. Restore index/navigation, per-tool printing and user-friendly customization in the review branch, then redo keyboard/screen-reader/mobile QA. |
| **REVISION: assent context** | **5** | **YES** is captioned “I want to continue”, which does not fit an activity that has **not yet started**. The ✓/X/?/pause/STOP symbols themselves are clear and consistent. | Keep core symbols stable; use “Yes, I want to [specified activity]” / “No” for start contexts, or explicitly mark the sheet “continue or stop” for an ongoing activity. Test reliability of YES/NO response mode rather than treating icon recognition as assent validity. |
| **REVISION: response-method ambiguity** | **1** | A waving hand only represents one of the many gestures in the tile; **I’M NOT SURE** may mean uncertain about the response method or the subject of the conversation. | Label “GESTURE — e.g., wave, nod or sign” as an illustrative example, and make clear what a response to “I’m not sure” refers to. Consider partner-assisted selection for people who cannot point or speak. |
| **MINOR: art scale** | **6** | Detailed backpack line scene vs minimal outdoor stick figure have differing visual complexity even though the order is clear. | Either harmonize at card scale or use personally relevant photographs. Keep FIRST / THEN structural pairing. |

## Page-by-page assessment

| Page | Existing CPL name | Conceptual classification | Review disposition |
|---|---|---|---|
| 1 | Response Menu | **Expressive access / response method** | Useful but revise ambiguous gesture and method/answer distinction. |
| 2 | When Words Get Stuck | **Expressive repair / time** | **Revise before user testing**: choices picture contradicts caption. |
| 3 | Conversation Repair Card | **Partner-directed expressive requests** | **Revise before user testing**: SHOW ME's actor is ambiguous. |
| 4 | Concrete Choice Board | **Choice / preference / refusal** | **Major redesign**: false binary, not easily customizable, text-only secondary options. |
| 5 | Supported Assent | **Assent / refusal / stop** | Provisional symbol design, but fix YES caption context; confirm consistent response access and clinical practice. |
| 6 | First / Then Board | **Sequence comprehension** | Strongest comprehension visual; mild artwork harmonization. |
| 7 | Plan B Flexibility Map | **Change / alternatives / agency** | Useful structure; make explicit decline distinct from dislike and from NOT AVAILABLE. |
| 8 | Body Clues → Needs Map | **Partner-supported bodily experience discussion** | **Major redesign** for low-literacy access and separate experience/trigger/support. Not a diagnostic map. |
| 9 | Change Board — Usually/Today | **Change comprehension (supplementary, not approved replacement)** | Strong layout; add explicit swapped pictograms to DIFFERENT panel, fix same text. |

## Technical evidence independently checked

- Rendered the actual V4 PDF: **9 US Letter 612×792 pt pages**, with selectable text and no missing visible pages.
- Inspected full-resolution PNGs for all 9 pages and the HTML source.
- Using PyMuPDF, confirmed page 8 explanatory text includes spans at about **8.6 pt**. Footer/header metadata is 7.5 pt (less significant than person-facing directions).
- HTML source contains **9 standalone `<section class="sheet">` panels and 9 `<h1>` tags**, **0 buttons, links, form inputs, navigation landmarks, or expandable `details`**.
- Both versions use meaningful textual captions, and art is predominantly marked `aria-hidden="true"`, so screen readers receive labels rather than unexplained SVG path markup; this is a reasonable starting practice but is **not** a tested reading-order/accessibility pass.
- Existing CPL `main` supports expand/collapse and a **print-this-visual** action per tool; these are not reproduced in V4's standalone HTML.
- The HTML document's `<title>` still identifies **Version 3** despite Version 4 being in page footers. Correct the provenance metadata.
- The earlier QA's 375/768/1024 layout pass was not repeated here. This round independently concentrated on **semantic contrast, clinical access, document structure, and regression from original CPL**.

## Communication-access criteria used

For an image to count as a communication support rather than decoration it must (1) represent the **right communicative intent and actor**, (2) distinguish relevant alternatives and *refusal*, (3) remain recognizable at the size and access method used, (4) be editable/adaptable to meaningful real-world choices, and (5) support **verification** of what the person meant, instead of assuming a choice's meaning.

Sources supporting those criteria include ASHA's **AAC Practice Portal** (person-centered feature matching and partner training), **Aphasia Practice Portal** (multimodal partner-supported communication), and **Communication Access Resources** (reliable yes/no systems, including accessibility of the access method). These sources describe principles, **not validation of this prototype**.

- https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/
- https://www.asha.org/practice-portal/clinical-topics/aphasia/
- https://www.asha.org/practice/communication-access/communication-aids/

## Acceptance criteria before replacement discussion

1. Fix the three highest-priority meaning errors (P2 options, P3 actor for SHOW ME, P4 mutually exclusive choices) and the P8 visual-state/support mapping.
2. Enforce a **concept-role register**, not just a one-to-one concept-name-to-SVG register. Example: `POINT (my action)` must not automatically become `SHOW ME (partner action)`.
3. Test **without labels first**, then repeat with text, on actual 1:1 print cards; record recognition *and* whether the person can use the picture to send the intended message in a real exchange.
4. In supported assent, establish an **accessible and reliable response method** before interpreting YES/NO/NOT SURE; preserve STOP/BREAK as actionable messages.
5. Provide easy replacement of example options with true individual choices, not HTML editing as the only route.
6. Restore original CPL per-tool print and expand/collapse behavior in any actual replacement; preserve all 17 original functions unless a source-to-target crosswalk and approval authorize a particular replacement.
7. Re-run full browser, print, accessibility and clinical/SLP review on the **exact final branch build**. No merge, deployment, alias change or production replacement without express human approval.

**Review status:** This is an independent design and technical analysis, not a clinician/SLP endorsement or actual end-user comprehension study. PR #21 should remain **draft and blocked**. Original production CPL remains the baseline.