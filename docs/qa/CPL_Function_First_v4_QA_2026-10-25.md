# CPL visual communication review — v4, 25 October 2026

**Status: improved technical and conceptual review candidate; NOT approved for adoption, merging, or clinical deployment.**

This independently rendered revision corrects blockers from `CPL_Independent_Second_AI_QA_2026-10-25.md`. It is a new review artifact and does not replace any original CPL tool. In particular, **"Repair the Message" is not an approved tool** and does not appear here; the original **Conversation Repair Card** name is maintained.

## Corrections actually made

| Prior failure | Revised output | Rationale |
|---|---|---|
| Page 2: "Show me choices" looked like a book → cup transformation | Two distinct side-by-side choice tiles, with no direction arrow | Choices occur simultaneously; they are not a forced sequence |
| Page 3: repeat symbol touched its heading | Defined a bounded icon box, reduced artwork height, reserved label clearance; now "Say that again" with an unambiguous request sentence | Pictogram and heading no longer occupy the same area |
| Page 8: body map mostly text-only; hungry/thirsty and food/water bundled | Unmarked body diagram, seven individually selectable possible experiences, seven independently selectable supports | A person can indicate location, possible experience and preferred adjustment without combining distinct ideas |
| Page 8: NO/NOT NOW/NOT AVAILABLE ambiguous | "NOT NOW" is text-led, not a NO X or unavailable slash sign | Refusal of timing is not the same as a missing option |
| Page 7: information requests use different symbols | "MORE INFORMATION" uses the canonical circled-i | Same communicative intent, same symbol |
| Page 5: "Tell me more" only in small note | Added equal-sized sixth selectable response with circled-i | Information request is available without first committing to yes/no/not sure |
| Response Menu: gesture pictogram touched label in automated geometry test | Gesture SVG bounded to 50px and given label clearance | Fixed an additional overlap discovered in this iteration |
| 768px tablet: horizontal scroll forced by fixed US Letter sheet | Screen-only responsive width rule for 761–850px | Tablet review can proceed without lateral page movement |

## Evidence from generated v4

- `CPL_Communication_Visuals_Functional_Repair_v4.html` contains **nine source-matched sections** (eight existing CPL names and one clearly identified supplemental Change Board). Original CPL source pages are unchanged.
- `CPL_Communication_Visuals_Functional_Repair_v4.pdf` is **exactly nine US Letter pages** with searchable text, each with the correct review footer.
- Every PDF page was rasterized and inspected as a contact sheet; pages 2, 3, 5, and 8 were also inspected full-size.
- All text lies inside print margins; rendered pages are grayscale (RGB channel parity on downsampled raster checks).
- Local Chromium HTML tests at **375, 600, 768, 800, 1024, 1440px** show document width equal to viewport width, no broken images, no page JavaScript errors.
- Bounding-box checks comparing pictograms to the cards' primary text found **no collisions** at any tested viewport or print mode.
- Person-facing assent retains visually distinct YES / NO / NOT SURE / BREAK / STOP; MORE INFORMATION is separately selectable. Time requests still use the same clock. NOT AVAILABLE remains a plan condition, not a refusal.

## Still required before adoption

1. Test pictogram recognition without labels **and** partner verification with actual intended users, including those with aphasia, low vision, or nontraditional access methods. A symbol may look clear to its author and still be misunderstood.
2. SLP/clinician review of the original-versus-proposed clinical language, assent/consent boundaries, pain/safety prompts, and choice structures.
3. Screen-reader reading-order and keyboard tests (automated browser fit does not cover these), real printer tests at normal office scale, and checks for supported visual access (including CVI and symbol complexity).
4. Confirm each pictured option is actually available for that individual. The picture is an example, not a universal AAC vocabulary set.
5. Human sign-off on any one-to-one replacement crosswalk. The other original CPL tools (including Supported Consent, Transition Countdown, and Sensory + Visual Load Check) have not been replaced.

**Release boundary:** PR #21 stays draft and unmerged. No production alias, routing, `main`, D1, experimental branch, or existing communication tool is changed.