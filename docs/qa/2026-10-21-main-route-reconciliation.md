# Controlled CPL main-based route reconciliation — October 21, 2026

> **DRAFT — NOT APPROVED FOR MERGE OR PRODUCTION.** Static routes are not a complete clinical, accessibility, screen-reader, PDF/print, or rights review. Preserve stable main and all existing DSM/Colorful branches.

## Provenance

- Baseline `main`: `d9ccb18a6d26752641a6b0f473e78e78d8848279`.
- New route/asset blob source: `fix/dsm-venn-mobile-fit-20261019` at `a2d2bc5fe93fbacac5d1d6697b4c0e2dc4c7e4bb`.
- Isolated candidate: `qa/main-reconciled-routes-20261021`; first commit `666bc85240afc4eafa57116d8ab981750f99cd5b` adds six HTML routes + 12 direct assets; second commit `cd8c1516e32173795099b2c58a67af8d8c9e8e56` adds 18 first-degree destinations directly referenced by those pages. Both commits are **additive to main**. No main file, independence disclosure, pre-existing guide, worksheet, legacy resource, or alias modified.
- Vercel automatic nonproduction preview: `dpl_6Ls92NgJoBpaBB9wMM9GTA48gHux`, `https://clinical-practice-library-colorful-hh0pzko93-cohon-family.vercel.app`, exact head SHA `cd8c1516e32173795099b2c58a67af8d8c9e8e56`, READY. No explicit deploy action or promotion performed.

## Served preview HTTP acceptance, exact preview host, October 21

| Test set | Observed | Result |
| --- | --- | --- |
| Jurisdiction school guides | California, Colorado, District of Columbia, Florida, Maine, New Mexico, New York, Oregon, Texas, Utah, Vermont, Washington | **12/12 HTTP 200**, title matched jurisdiction |
| Main treatment worksheet | `/resources/therapy/treatment-planning-worksheet.html` | **200** |
| Independence disclosure | `/library.html` | **200**, disclosure present in served HTML |
| Legacy continuity | `/legacy/resources/handouts/grounding.html` | **200** |
| Six new entrypoints | `/resources/start-here.html`, `/resources/clinical-resource-finder.html`, `/resources/therapy/visual-reasoning-toolkit.html`, `/resources/training/dsm-from-zero.html`, `/resources/training/diagnosis-comparer.html`, `/resources/therapy/functional-progress-review.html` | **6/6 HTTP 200**, expected page titles |
| Sample direct assets | `/resources/site-navigation.css`, `/resources/clinical-finder-data.js`, `/resources/training/dsm-foundations-experience.js` | **3/3 HTTP 200** |
| Direct linked index | `/resources/clinical-topics/index.html` | **200** |
| Second-degree topic route | `/resources/clinical-topics/bipolar-episode-timeline/index.html` | **404, FAIL** |

## Internal link test — not ready for release

Before second commit, six new HTML entrypoints had **18 distinct first-degree absent paths**; imported those 18 unchanged blobs as a bounded first-degree dependency repair. This is **not** the entire Colorful branch.

Second-degree static link scan of imported index `resources/clinical-topics/index.html`: **190 distinct absolute internal links**, of which **177 currently reference paths absent from this candidate**. This includes the topic-level CSS/JS and multiple links to patient-facing and clinician pages. Other imported pages likewise contain additional unported nested links/assets. These are **known genuine defects in the candidate**, not assertions about stable production. The current finder data/route links and complete nested graph have not been independently crawled.

**NO-GO until:** choose whether to (a) import and clinically/rights/AT-review the full topic subtrees and required assets, or (b) remove/redirect any unfinished topic entrypoints without destroying intended access, then re-run complete link crawl and actual browser/keyboard/print/screen-reader tests. Do not simply import all 200+ pages without a content decision. Confirm clinical correctness separately. Reverify all 12 guides and disclosure after any route edit. Do not alter aliases, production, public permissions, or existing branch histories.

## Human review gate

Release approval must be version-specific to the candidate SHA and include route-retention choices, clinical editorial/rights signoff, accessibility/AT testing and the October 20 documented rollback plan. Vercel READY verifies build/runtime availability only.
