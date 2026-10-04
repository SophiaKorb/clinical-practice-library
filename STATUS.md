# Library status

Updated October 4, 2026.


## Colorful 2.0 candidate — October 4, 2026

The separate candidate is `cpl2/navigation-tools-2026-10-04`, proposed in [draft PR #3](https://github.com/SophiaKorb/clinical-practice-library/pull/3) against `cpl-2-colorful-helpful`. [Reviewed preview](https://clinical-practice-library-en7r1xvk8-cohon-family.vercel.app/preview/cpl2) · [verification and remaining work](docs/2026-10-04-CPL2-NAVIGATION-HANDOFF.md).

Three clinician routes now lead from what is being seen through understanding, next action, tool selection, and review. The recovery, lower-risk, and ERP worksheets are promoted first; plain-language patient/family materials have their own section. The clinician entry retains 12 topics in order, removes shelf prefixes, and has 24 usable guide/tool links. Phone guide headings, 44px controls, worksheet return/review links, canonical index redirects, and shelf fragments were checked. Navigation CI passes.

Stable production remains separately approved on `main` at `27035be6f1b1466a1dbf28dc9c3f3d84b9666734`. This candidate does not publish 2.0 to production. Grief Map, Personal Care Plan, and After-School Reset are still separate 2.0 follow-ups; their stable conversions are already published. Native HTML print export needs a browser check; the three featured two-page PDFs are unchanged and were visually reviewed.

## Live catalog

- Clinical Research Core records
- assessment and screening-tool records
- 8 Arizona Barrier Support school-toolkit records
- Clinical Handout Library collection records
- 155 indexed catalog records total
- clinical-question pathways
- de-identified assessment verification gaps

## Architecture scaffolded

- START HERE
- FIND A RESOURCE
- Families & Children - Trauma
- Parent & Patient Education
- School - IEP & 504
- Clinical Practice - Therapist
- Intern & Trainee
- Assessments & Screening Tools
- Arizona
- California
- ESPAÑOL

## CPL 2.0 redesign status

Work continues on branch `cpl-2-colorful-helpful`. Production remains separate.

Completed in the current redesign pass:
- Reusable clinical pathway, callout, and resource-link components.
- Single author attribution standard on therapy resources.
- Communication Supports Toolkit upgraded with expandable visual examples.
- Body + Safety Check redesigned as a Body Clues → Needs Map.
- Neurodevelopmental / Executive-Function toolkit redesigned around actual visual tools, including:
  - Barrier → Access Map
  - Task Launch Map
  - Therapy Access Check
  - Explicit Session Architecture
  - Reduce Language Load choices
  - Executive-Function Task Repair checklist
  - Capacity Before Compliance map
  - Uncertainty / transition map
- Therapy Resource Shelves start page redesigned as a need-based clinician entry page with a visual clinical route, shelf map, and rights key.
- Latest preview deployments for these commits are READY in Vercel.

## Visual-tool standard

A resource labeled visual should communicate through spatial structure, sequencing, comparison, mapping, scaling, choice, or response support rather than prose placed in colored boxes.

For each visual:
1. KEEP if the visual structure already carries meaning.
2. VISUALIZE MORE if the content is useful but too language-heavy.
3. REDESIGN if the same information would work just as well as paragraphs.
4. MERGE if another tool does the same job better.
5. REMOVE if it does not improve understanding, choice, communication, sequencing, comparison, or response.

Visual test: if most sentences disappeared, would the tool still communicate something useful?

## September 30 homepage and phone-layout batch

- Intro simplified: “Guides, visual tools, and handouts for therapy, family support, and school planning.”
- Shelf-summary grid repaired after removal of the old number column; expanded menus use the available width.
- Folder and nested-menu number prefixes removed. Phone navigation remains visible with 44px targets; title sizes, buttons, spacing, and sticky-header anchor offsets adjusted.
- Live homepage checked at 320, 390, 768, and 1280px without horizontal overflow; nested school and Spanish resource lists checked at 320px. Editorial preview reviewed at both phone widths.
- All internal links and fragment targets checked. Deployed production HTML/CSS matches reviewed source; existing school-guide parity self-test passes.
- Shared fixes deployed to both branches. Colorful concept controls have working destinations and responsive phone styles; authenticated browser review is complete at 320, 390, 768, and 1280px, including actual treatment-planning and communication-toolkit routes.
- Communication toolkit phone overflow fixed on both branches. All 17 visuals fit at 320px while expanded; the colorful variant also passes at 390 and 1280px. Repeated generic captions and the duplicate footer author credit removed; one adaptation note and one author credit remain.
- Results and screenshot: [September 30 handoff](docs/2026-09-30-HOMEPAGE-MOBILE-HANDOFF.md). P1.5 remains deferred.

## September 29 P0/P1 batch

- Eight family school guides reviewed and rewritten for everyday language; 292 supports retain their pairings with clinical guides.
- Selectable support labels, mobile navigation and clear controls, and saved-note clearing fixed. Family-facing support codes and numbered guide labels are hidden; clinical reference codes remain available for teams.
- Sensory Overload & Recovery Plan, My Lower-Risk Plan, and My Uncertainty & ERP Practice rebuilt as visual worksheets with native controls and a second companion page.
- Each worksheet has a public, blank, editable two-page PDF, one visible author credit, and a source/provenance note.
- School-guide checks verify real rows and reject nine regression cases. Browser checks cover desktop, 390px and 320px mobile layouts, selection/reset, and saved notes. PDF fields and both printed pages were verified.
- Shared updates applied to both `main` and `cpl-2-colorful-helpful`; the redesign remains separate from the production shelves.
- Details and follow-up scope: [September 29 handoff](docs/2026-09-29-P0-P1-HANDOFF.md). P1.5 remains deferred.

## Next content waves

1. Continue the visual audit across therapy and patient/family resources.
2. Strengthen thin clinician “Start Here” pages using need-based routing and clinical decision structure.
3. Resolve broken asset paths and duplicate Spanish handout sets.
4. Continue school / IEP / 504 quality and consistency review.
5. Add Arizona systems and referral resources with jurisdiction and last-verified fields.
6. Add trainee and supervision materials.
7. Keep Spanish resources limited to materials with clear language and validation metadata.
8. Keep research-core additions separate from the capped 95-item core unless a formal replacement decision is made.
