# CPL navigation and comprehensive QA checkpoint

## Implemented repairs and architecture

- Added a connected clinical resource finder with the five requested pathway steps; assessment remains within guides/task filtering rather than as a separate top-level pathway step.
- Current-resource search covers diagnosis, presentation, functional difficulty, intervention, developmental coverage, professional role, clinical task, and pathway step. Combines filters, supports multiword search and common synonyms, has empty/reset states, incremental results, shareable URL state, and validated incoming filter values. Added the same compact five-step link sequence to the homepage.
- Added related-resource recommendations based on topic/function/task overlap. Explicitly describes discovery tags as title/path metadata with curated flagship corrections, not clinical indications or evidence grading.
- Keeps the homepage a compact subject index and preserves all 24 original diagnosis-guide links. Finder entry points added to full/current shelves, visual toolkit, communication toolkit, intern hub, and workforce center.
- Finder intentionally excludes retained legacy and layout previews. Complete inventory remains the labeled comparison route; no accidental cross-theme links identified by source scan.
- Removed old shelf and summary numbering from resources/index.html without removing its resource links or changing legacy files.
- Repaired a real print regression: a generic button-hide rule removed the six support-scale levels and choice-board options. Targeted print overrides now preserve these visual tiles, with black text/borders and white backgrounds.

## QA completed and practical limits

- Behavior regression checks cover eight facets, combined filters, five realistic resource-finding scenarios (task initiation/ADHD, aphasia/communication, OCD/ERP, staff risk recognition, progress review), multiword/synonym queries, declared text/focus contrast pairs, related links, invalid URL filters, empty/reset, pagination, five pathway toggles, browser-history state, and print visual retention rules.
- All prior catalog, diagnosis guide parity (292 paired supports), homepage, thermometer, clinical expansion, assessment/school, visual-tool, and workforce behavior tests pass.
- Source-level accessibility scan across 273 current HTML pages: no duplicate IDs, missing document language, multiple/missing h1s, multiple footer elements, unlabeled form controls (including wrapped labels), or missing image alt attributes detected. Two pages expose intentionally labeled retained-version navigation. Counts update in the machine-readable report after final regeneration.
- Full local HTML/catalog link scan and script syntax checks pass. Snapshot before final inventory regeneration: 529 HTML pages; final links/scripts recorded by the checks after homepage pathway links are added.
- All 36 PDFs (current and retained) parse with pages and extractable text. Canonical fields and page widgets were compared for orphaned fields and value disagreement; none found. Structural/form checks do not prove PDF screen-reader accessibility or appearance fidelity.
- Rendered and visually inspected all seven pages of the current safety-planning preparation, lower-risk planning, and ERP practice PDFs. No clipping/overlap found. Earlier increment separately verified the two new printable companions. Other PDF layouts have not all been re-reviewed in this pass.
- Actual HTML screenshots, browser/mobile geometry, real browser printing, keyboard focus traversal, and screen-reader behavior remain unverified. Managed Sites instructions forbid an improvised browser path when the required control-browser capability is absent. DOM harnesses are not presented as rendered browser tests.

## Qualified human review queue

No automated clinical approval is claimed. Review priorities:

1. Suicide/crisis, overdose/withdrawal, abuse/reporting, and urgent medical response materials: qualified clinician plus relevant local policy owner.
2. Diagnostic assessment, differential diagnosis, formal testing and restricted instruments: qualified assessor; check current manuals and limits.
3. Exposure/ERP, trauma/dissociation, psychosis and complex interventions: trained clinician; check consent, contraindications, adaptations and fidelity.
4. Pediatric/developmental and neurodevelopmental materials: qualified clinician and appropriate developmental expertise; verify stage-specific appropriateness.
5. Educational eligibility and state/system guidance: school/legal-policy specialist; authoritative-source freshness check.
6. Spanish materials: qualified bilingual clinical reviewer; language labels do not establish translation validation.
7. Original diagrams, support scales, cases and skill checklists: clinical peer review and observed usability; these are original heuristics, not validated instruments.

## Publication

Changes are scoped to cpl-2-colorful-helpful. Verify Vercel READY status and exact commit, served finder/data/script/CSS, unchanged main production deployment, and clean local checkout after committing. Record verified publication in a follow-up checkpoint. Phase 6 architecture is implemented for this increment; Phase 7 remains ongoing until rendered usability and qualified clinical reviews are completed.
