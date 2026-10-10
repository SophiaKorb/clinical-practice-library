# CPL phases 4–5: visual reasoning and workforce learning

## Published scope of this increment

Extends the existing flagship instead of replacing its 17 communication boards, six-level thermometer, or original diagnosis guides. The homepage remains a subject index. Legacy/main is untouched.

- Visual reasoning toolkit: safety/access decision tree; before/action/after functional map with context and competing hypotheses; avoidance cycle; skill/access quadrant; keyboard-accessible body map with equivalent labeled buttons; six distinct support levels; supported-choice board; before/during/after transition timeline.
- Layered clinician instructions, worked examples, client-view toggle, high-contrast toggle, mobile layouts, and browser print styles. Original heuristics are labeled as unvalidated; observations do not establish function, diagnosis, or intent.
- Workforce learning center: four role-specific paths (high-school-level support, bachelor's-level coordination, graduate training, licensed practice); eight rehearsal modules; three fictional cases with nine response options and explanation; documentation exercise; nine-skill rehearsal checklist.
- Client questions and interviewer instructions are separately labeled. Scope follows actual role, training, policy, credentials, and supervision, not degree alone. Risk recognition leads to designated clinical response and local emergency pathways rather than independent risk scoring.
- Two reproducible one-page PDFs: functional support map and supervised practice sheet. Printable writing spaces are intentionally static, not fillable digital forms.
- Connected through homepage shelves, full library index, existing communication toolkit and intern hub. Experimental DSM lab remains separate.

## Source crosswalk and comparison

| Design decision | Reference | Evidence boundary |
| --- | --- | --- |
| Context + ABC + competing hypotheses + review | PBIS comprehensive FBA guide (2022) | School function-linked guidance; new map is a teaching aid, not a formal FBA |
| Choice, predictable steps, collaboration and communication access | SAMHSA trauma-informed framework | Framework; does not establish efficacy of these particular diagrams |
| Practical workforce support with role boundaries | NCTSN/VA Psychological First Aid orientation | Disaster-focused, evidence-informed; not routine psychotherapy or clinical risk assessment |
| Six visually separate support levels | Existing CPL thermometer | Preserved original separation; new scale is a personalized support aid, not validated distress/risk scoring |
| Layered diagnosis-rich reasoning | Original CPL diagnosis collections | All 24 guide links retained; new quadrants do not replace differential guides |

Primary source pages verified through search on October 10 UTC / October 9 Arizona. Original diagrams and wording; publisher materials and restricted instruments are not reproduced.

## Verified QA

- 527 HTML pages and 3,998 local references initially checked with zero errors; final regenerated inventory check: 4,002 local references, zero errors.
- Existing homepage, thermometer, clinical expansion, assessment/school, catalog, and all 292 paired school-support regression checks pass.
- New behavior harness exercises four path selectors, three cases/all nine feedback options, exclusive selection, case-feedback reset, note clear/review, checklist count/reset, six scale selectors, body-map keyboard activation, client/high-contrast state, print invocation, functional-map no-overwrite and clear.
- Both PDFs rendered to PNG and visually inspected: one-page layouts, complete labels, readable writing areas, no overlap or clipping. Text extracted and page counts verified.
- Inventory refreshed: 563 HTML/download assets, 560 reachable from homepage, ten branch tips; three intentionally unlinked preview layouts remain.
- Browser visual/interaction QA for HTML remains unavailable because the required browser-control capability is not present. DOM behavior harnesses and HTTP checks are not claimed as rendered browser testing.

## Deployment and remaining work

Verified publication: commit e9abfd147e662074dc5cb158829bf49d4a2fde98 on cpl-2-colorful-helpful, Vercel deployment dpl_5JeM4w8v6c2KtkJsxnGwKErxpVD7, READY, preview target. URL: https://clinical-practice-library-od3zdhz2m-cohon-family.vercel.app . Both new HTML pages, both scripts, shared CSS, both PDF downloads, and homepage return HTTP 200 with expected content and correct content types. Main production remains deployment dpl_DBmCm1WvuCaP8EsnHFDkLtF3t9eN at commit 2b8c5ba1d66fa397548c9c10a006d764d8c1018b. Do not label this phase fully tested until real browser QA is completed.

Remaining: rendered desktop/mobile and keyboard/screen-reader QA of HTML; deeper clinical peer review; more worked cases and population-specific examples; client-specific body-map custom labels; additional individual printable tool sheets; direct-observation competency rubrics with reviewers; source freshness audit across the broader existing directory. Neither phase is claimed complete or clinically approved.
