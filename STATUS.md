# Library status

Updated September 30, 2026.

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

1. Ingest existing author-created handouts and guides as metadata-first records.
2. Add school / IEP / 504 resources with jurisdiction and last-verified fields.
3. Add Arizona systems and referral resources.
4. Add trainee and supervision materials.
5. Add Spanish resources only with clear language and validation metadata.
6. Keep research-core additions separate from the capped 95-item core unless a formal replacement decision is made.
