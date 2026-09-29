# Library status

Updated September 29, 2026.

## Live catalog

- 95 Clinical Research Core records
- 31 assessment and screening-tool records
- 8 Arizona Barrier Support school-toolkit records
- 21 Clinical Handout Library collection records
- 155 indexed catalog records total
- 13 clinical-question pathways
- 21 de-identified assessment verification gaps

## Architecture scaffolded

- 00 START HERE
- FIND A RESOURCE
- 01 Families & Children - Trauma
- 02 Parent & Patient Education
- 03 School - IEP & 504
- 04 Clinical Practice - Therapist
- 05 Intern & Trainee
- 06 Assessments & Screening Tools
- 07 Arizona
- 08 California
- 09 ESPAÑOL

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
