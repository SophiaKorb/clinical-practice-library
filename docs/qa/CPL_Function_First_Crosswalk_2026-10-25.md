# CPL visual communication — function-first review

**Date:** October 25, 2026  
**Branch target:** `review/line-art-visual-tools-2026-10-24` / draft PR #21  
**Release status:** Review-only. No production, routing, or original clinical content changed.

## Why the earlier visual set was stopped
The previous 17-page redesign introduced tools and titles that were not all in the original CPL, confused visual depiction with communication function, and duplicated symbols across contrasting concepts. Approval of an artistic direction did **not** establish approval of its tools. In particular, **"Repair the Message" is not a source CPL title** and is not used in this revision.

## Nine-page new review
**Eight source-matched redesigns; one clearly marked supplemental prototype.**

| Review page | Exact CPL source title | Function | What has changed |
|---|---|---|---|
| 1 | Response Menu | Communication response route | Person chooses multiple ways to respond; explicit time, uncertainty, other; avoids guessing intention from gesture |
| 2 | When Words Get Stuck | Communication access | Offers alternatives rather than requiring a three-step sequence; separate voice of person and partner |
| 3 | Conversation Repair Card | Correct misunderstanding | Direct first-person messages; distinguish repeating same words from different words and from a new idea; explicit ability to reject interpretation |
| 4 | Concrete Choice Board | Preference and refusal | Two actually different example options plus neither, other idea, not now and information; choices replaceable |
| 5 | Supported Assent | Agreement, dissent, pause | Balanced yes/no/not sure/break/stop; no checkmark as a substitute for comprehension/consent |
| 6 | First / Then Board | Predictability | Two large illustrated sequence cards with blank personalization template, not conflated with plan changes |
| 7 | Plan B Flexibility Map | Alternatives after disruption | Distinguishes expected activity, unavailability, actual alternative, unchanged event, and optional supports; not just another change board |
| 8 | Body Clues → Needs Map | Collaborative meaning discovery | Body outline to mark a spot, *possible* causes, and *optional* supports; no automatic body clue→diagnosis assumption |
| 9 | NEW supplemental Change Board — Usually / Today | Changed routine comparison | Two matching aligned sequences with one changed card; not designated a replacement for an existing tool |

## Original CPL tools deliberately not replaced in this review
These remain in `main` and need separate design QA before any optional new drafts:

- Supported Consent — actual decision-specific comprehension must be supported, not generic checkmarks.
- Decision Support Menu — actual option consequences and values.
- Emotion / Overload Thermometer — intensity expression rather than emotion diagnosis.
- Sensory + Visual Load Check — environmental and visual access, including CVI needs.
- Transition Countdown — notice in advance, not interchangeable with Change Board.
- Free Recall vs Recognition — assessment method differences.
- What Happened? — timeline and reflection; not replaced by First/Then.
- Generalization Bridge — transferring skills to other contexts.
- Social Meaning Decoder — multiple plausible meanings, not an assumed perspective.

Together with the eight source-matched pages above, these account for all **17 original communication-support toolkit tools**.

## Meaning check, page by page
1. Response modes are labeled as ways to respond, **not statements**. A hand can mean stop or hello; the gesture card therefore uses explicit words rather than pretending a palm automatically means "gesture."
2. When Words Get Stuck supports choice between routes and a break; the partner never decides the answer.
3. Conversation Repair Card uses *distinct large text* for abstract messages. A repeated arrow cannot convey "use different words" or "my different idea," so those are text-led.
4. Concrete Choice Board has meaningfully different photos/line drawings and an unanticipated choice route.
5. Supported Assent includes NO/STOP with equal standing; clinical interpretation and legal consent are separate.
6. First / Then is sequence, *not* compliance and not the same as changed plans.
7. Plan B has an actual unavailable plan and a proposed alternative; the person may reject it.
8. Body clue localization is a hypothesis-generating aid; symptoms and risks require appropriate clinical assessment.
9. Change Board's matched positions convey sameness and difference; supports are not forced into the board.

## What QA was and was not performed
- **PASSED (local):** 9 US Letter PDF pages, one per tool, selectable text, page boundaries checked with PyMuPDF, visible footer on each page, embedded art renders, black and white, high-resolution print proofs visually inspected, repair-card overlap found and corrected.
- **LIMITED:** No independent user recognition/comprehension testing, no SLP/clinical sign-off, no real-printer legibility test, and no mobile/keyboard/screen-reader browser test. This environment blocked Chromium navigation to local files and loopback, so mobile/browser QA is explicitly outstanding.
- **ART:** Uses four of the six previously approved line-art subjects in these tools (point, quiet scene, backpack, playground); other two approved subjects remain available as references for future relevant tools. Approved artistic style does not equal clinical approval.
- **NO MIGRATION:** No previous CPL tool, data, link, production alias, or content file has been overwritten. This is a standalone review candidate only.

## Decision gate
Before considering any replacement, have the intended users and qualified clinicians verify the actual symbol meaning and usefulness, especially when speech, hearing, vision, motor access, literacy, fatigue or cognition vary. Preserve all 17 originals until their replacement mappings and content preservation are verified. Maintain draft PR and explicit human release approval.