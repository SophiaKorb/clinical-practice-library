# CPL Functional Communication Visuals — v6 technical and conceptual QA

**Date:** 25 October 2026  
**Status:** Standalone draft on CPL review branch; **NOT approved for clinical use, replacement, merge, or deployment**.  
**Source of truth:** `CPL_Communication_Function_First_v6.html` (the file used to create `CPL_Communication_Function_First_v6.pdf`).

## Scope and provenance

The set includes eight review redesigns matched to **existing** CPL tool names plus one explicitly **supplementary** Usually/Today Change Board. This is not a substitute for the original CPL's other visual tools. **“Repair the Message”** is not an approved tool and is not included; the existing **Conversation Repair Card** title is preserved.

## Changes made from v5

1. **Body Clues → Needs Map**: replaced dense environmental text-only chips with five visually distinct, clearly labeled cards: **TOO LOUD (sound waves), BRIGHT LIGHT (sunburst), TOO MANY PEOPLE (small group), NOT SURE (question mark), SOMETHING ELSE (three dots)**. Each now uses consistent black line art, with distinct uncertainty and other-response cards. These are *environmental possibilities*, not diagnoses or assertions about the person's emotions. Instruction says multiple conditions may be true, or the person can skip.
2. Increased Body Clues primary pictorial-card labels to approximately **11–11.25 pt when printed**, keeping the same nine-page, one-tool-per-page format. Secondary explanations and document metadata remain smaller; this does **not** establish large-print suitability.
3. **When Words Get Stuck**: independent bounding-box testing found an SVG intruding into the "SHOW ME CHOICES" label despite earlier layout passes. Replaced it with simple side-by-side drawings of a book and cup, avoiding arrows or yes/no symbols; bounded the image inside its slot. Removed a duplicated "OTHER WAY" graphic, making the abstract alternate-method option explicitly text-led instead of pretend pictorial communication.
4. Grouped pictorial Body Clues cards semantically as a labeled list for assistive-technology reading; marked optional example-photo controls as one labeled group; added keyboard-visible focus indicators to toolbar, print buttons, and customization inputs.
5. Uploaded custom choice-option image alt text now uses the corresponding option name, not a generic description. Added a 10 MB source-size cap for accidental oversized uploads. Customization remains local to the review page; no images are transmitted.
6. The original icons meaning **YES / NO / NOT SURE / BREAK / STOP / MORE TIME / NOT AVAILABLE / MORE INFORMATION** remain distinct; this version does not invent alternative mappings.

## Tests completed (current v6 artifact)

| Test | Result |
|---|---|
| WeasyPrint US Letter export | **9 pages** |
| Chromium US Letter print export | **9 pages** |
| Selectable/searchable PDF text | Yes |
| PDF word rectangles beyond page edges | **0** |
| Footer present on each page | Yes |
| Visual inspection of full-sized Body Clues and Words Get Stuck pages | Done; no print clipping seen |
| Body Clues primary option typography | **~11–11.25 pt** (PDF measured) |
| Screen widths 320 / 375 / 600 / 768 / 800 / 1024 / 1440 px | **0 document horizontal overflow** |
| External asset requests in local browser | **0**; self-contained HTML |
| Broken image elements or uncaught page JavaScript errors | **0** at tested widths |
| Image-to-label collision test across 39 card picture/label pairs | **0 collisions** in screen and print media |
| All nine *print this tool* CSS states | Each produced **one page** in headless Chromium |
| Choice option A/B text editing | Updates corresponding displayed titles |
| Print-tool button and `afterprint` reset | One print invocation; selected tool correctly reset |
| Body Clues semantic group role | Five picture-and-word items inside a list |
| Focus on print button | Visible solid 3-pixel outline |
| Sampled grayscale pages (1, 4, 8, 9) | No non-grayscale pixels detected at threshold |

**Rendering note:** The browser tests use self-contained HTML via a controlled local browser, not an authenticated deployment. PDF assertions, DOM bounds, and contrast properties do not establish comprehension.

## Remaining limitations and release blockers

- **Clinical and communication-access comprehension not independently demonstrated.** Test symbol recognition *without captions*, preference interpretation, and the person's established communication method with intended users, including people with aphasia and those using AAC supports where applicable. Images must never be represented as universally understood.
- **Not comprehensive keyboard/screen-reader human QA.** Browser focus and semantic grouping were checked, but an assistive-technology session and reading-order assessment have not been completed.
- The Body Clues page remains a **joint conversation aid**. A generic pain bolt, hungry face, sun, etc., might be interpreted differently by different people. Its labels and partner verification are essential; do not infer a diagnosis, emotion, pain location, or medical consent from icons.
- No actual office-printer, photo-upload usability with families, large-print adaptation, clinician/SLP approval, or formal effectiveness study has been completed.
- The nine reviewed pages do **not** replace the original 17 CPL tools, and no approved one-to-one crosswalk exists for broader release.

## Release boundary

Preserve `main`, live production aliases, D1 data, legacy pages, and other CPL branches. PR #21 must remain **draft, unmerged and undeployed** until explicit human release approval after clinical/communication-access validation.