# Blocking image and communication-access QA — unified-symbol CPL draft
**Date:** 2026-10-25
**Reviewed output:** `CPL_Functional_Visual_Tools_Final_Review.pdf` and `CPL_Functional_Visual_Tools_Final_Review.html`; 9-page render in `cpl_symbol_unification/final_render/`.
**Disposition:** **FAIL for artwork approval and replacement use.** Technical US Letter pagination/searchable text checks remain valid but do not establish visual-semantic quality.

## Main failures
1. **Mixed illustrative grammars** within a single choice: page 4 “a quiet place” uses a finely crosshatched naturalistic woman reading, while “move around” uses a large, awkward, abstract running stick person. The two are neither comparably legible nor comparable visually. Quiet room is confounded with *reading*; exaggerated runner also reads as frantic.
2. **Text masquerading as pictogram**: page 1 gesture tile uses a box literally labeled `WAVE / NOD`, not an image of someone gesturing. Page 2 “try another way” and page 3 “I mean something else” are also mainly text labels, not an independently understandable visual. Text-led is acceptable if accurately described, but not visual communication success.
3. **Unclear icon-to-meaning relations**: page 2 “show me choices” shows two rectangles; page 6 “walk outside” is represented only by footprints, which communicate footsteps but not the outdoor destination; page 7 “library” uses an open book, not a place; page 8 “quieter space” uses two redundant headphone images rather than a meaningful quieter environment.
4. **Misleading or prematurely interpreted body clue**: page 8's outline has a dotted abdominal marker already drawn, risking unintended attribution of the person's sensation. Location should be blank until indicated.
5. **Visual clutter/geometry**: page 8 has narrow columns, small densely stacked labels, duplicated icons and separator lines encroaching into heading areas; print boundary detection failed to catch an *internal* alignment problem.
6. **Risky semantic conflation**: page 5 `NOT SURE` is glossed as `I need more information`; uncertainty is not always an information deficit. These should be separate possible communications.
7. **Rejected crop candidates**: the earlier 34-image extraction/contact sheet contains scraps of neighboring panels and edge rules in some assets (e.g. noisy fragments `noise`, `safe_home`, `shirt`, `steps`, `speech`). Some of these are not in the final rendered 9-page packet, but the asset inventory must NOT be accepted as a shared symbol library.

## Page-by-page decision
| Page | Existing tool | Rating | Specific issue | Corrective direction |
|---|---|---|---|---|
| 1 | Response Menu | **FAIL artwork** | Gesture = literal WAVE/NOD text; illustration styles mixed | Natural gesture line drawing; point/writing symbols coherent scale |
| 2 | When Words Get Stuck | **REVISE** | “Show me choices” rectangles; “try another way” text box | Show actual alternative routes; keep permission to pause |
| 3 | Conversation Repair Card | **REVISE** | Core repeat/rephrase distinct, but “my idea” is text in a rectangle | Keep text-led if more communicative; do not claim self-evident pictogram |
| 4 | Concrete Choice Board | **FAIL artwork** | Highly mismatched naturalistic woman vs exaggerated runner; quiet ≠ reading | Two *comparable* scene pictures, actual available choices, equal visual weight |
| 5 | Supported Assent | **PROVISIONAL usable** | YES/NO/?/BREAK/STOP visually distinguishable; NOT SURE wrongly defined as information request | Keep code stable; distinguish `not sure` vs `tell me more`; individualize access |
| 6 | First / Then Board | **REVISE** | Sequence is good; footprints do not convey outside | Show person walking outdoors / door/path, or clear real-photo location |
| 7 | Plan B Flexibility Map | **PROVISIONAL usable** | Plan A unavailable → alternative → same is clear; book alone ≠ library | Use library building/room, not generic book |
| 8 | Body Clues → Needs Map | **FAIL artwork/layout** | Premarked stomach; doubled headphones; dense columns and heading-rule overlap | Unmarked body map, simple individually selectable supports, spacing re-layout |
| 9 | Change Board — Usually/Today (supplemental) | **PROVISIONAL usable** | Matching unchanged cards and highlighted middle change work; generic symbols and no comprehension test | Keep overall comparison; use personally meaningful pictures |

## Scope and approval
- The user approved **illustration style references** and requested universal *recurring* symbols. That does not approve specific mappings or all replacement concepts.
- `YES`, `NO`, `NOT SURE`, `BREAK`, `STOP` pictograms are distinct and relatively legible on page 5; their meanings must still be confirmed with intended users.
- The 9-page review is **not one-to-one replacement** for all existing CPL communication tools.
- No user testing, SLP/clinical validation, or real physical printing test has yet established communication usefulness.
- No production updates, merge, deploy, routing change or modification of original tools is authorized.

## Acceptance tests for next iteration
1. Produce an **individual symbol register**: approved reference concept, canonical pictogram, related but different concepts, pages used, art source/rights, size checks.
2. Reject all fragment crops and semantically misleading icon mappings at source.
3. For each card, hide label and evaluate recognizability and **contrast discrimination** with at least two people unfamiliar with the art; confirm user's own preferred symbol meanings, language and access method.
4. Keep scenes comparable in complexity/scale; separate symbols of *request for help*, *company*, *quiet*, *wait*, *change*, and *try something else*.
5. Print actual-size black-and-white page proofs and screen-reader/keyboard/mobile review.
6. Redesign pages 1, 4, 8 before any replacement discussion; revise pages 2, 3, 6; confirm pages 5, 7, 9 with intended users.
7. Keep PR #21 blocked and draft; preserve existing production CPL and all original clinical content.
