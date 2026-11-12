# CPL comprehensive QA — November 11, 2026

**Base:** `main` `eee0cb60c0df87fe759de0b84a5b8fa9eeb8b277`  
**Review branch:** `review/cpl-comprehensive-qa-20261111`  
**Release disposition:** review only; no PHI, merge, publication, permission changes, or production/preview deployment authorized.

## Verified findings / fixes

1. **P1 / corrected on this branch — catalog:** `data/library.json` has **156** actual records (95 research, 31 assessment, 8 school, 21 clinical handout, 1 treatment planning). IDs are unique. `meta.records` and `STATUS.md` incorrectly said 155; `README.md` said 134. The treatment-planning record lacked `publicMetadataOnly`. Counts, flag, README/STATUS are corrected and `tests/catalog-metadata.cjs` is added to site CI.
2. **P1 / documentation corrected — publication:** GitHub reports the repository **public**, contrary to the prior private-source documentation. Draft branches are publicly readable. Do not enter PHI into public educational tools or assume browser-local forms are fully private. No sharing permissions were changed.
3. **Main CI:** exact main SHA site QA [41563882778](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/41563882778) passed November 3; linked source/scripts/navigation/clinical/school tests passed in that historical run.
4. **PR #21 visual reference:** draft/unmerged, head `b6f1e67167c00a2b162bcdd08dbdb96c393e7776`. Reviewed source has 13 visible `<main>` landmarks (one per sheet), a concrete assistive-navigation defect to repair on a follow-up visual branch. Contains 13 sheets and 67 initially unpressed choice buttons, plus wired selection/reset/print controls. Site CI [40269281782](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/40269281782) passed; rendered smoke [40269281824](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/40269281824) was **skipped**. Historical source QA asserts 13 PDF pages and responsive screens but no independent screen-reader, physical print, symbol-comprehension, large-print/CVI or clinical/SLP approval was verified in this pass. Not a substitute for 17 existing communication tools.
5. **PR #22 parent education:** draft/unmerged, head `df872ec51dc228d125b4b41f417d0568da254319`. Four draft pages each have one h1, English lang, skip link, main target and print control. Branch finder parses 506 records, including four new unique parent records with valid facets. Exact-head site QA [42759095546](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/42759095546) and rendered keyboard/print QA [42759095378](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/42759095378) passed. Clinical/editorial, screen-reader, caregiver usability and independent physical print review remain open.
6. **Existing navigation / accessibility:** merged PR #20 added skip-navigation checks. The QA-status route had no first-tab skip-to-content link (verified on main), so this review branch adds a keyboard-visible skip link, focusable main target, print-hidden treatment, a static regression and 4-width browser checks. The public page's October content checkpoint remains unchanged. Refresh that public page only at an approved publication milestone, and distinguish catalog records, finder index and HTML resource counts.
7. **Clinical review:** October 15 clinical-content QA register calls out uncleared crisis/overdose/suicide, ERP, trauma, differential/assessment, licensed tests, Spanish translations, source freshness and jurisdiction guidance. Green technical CI does not certify these.

## Gates and priorities

| Priority | Work | Human approval |
| --- | --- | --- |
| P0 | Specialist review of safety/crisis/overdose, restricted tools and publication rights | Qualified clinical and rights reviewers — **Ready for Human Review** |
| P0 | Preserve #21 and #22 draft/unmerged; no publication | Owner authorization |
| P1 | Repair #21 repeated main landmarks, check reading order/keyboard, print-one/all, grayscale and symbol meanings | Developer then clinical/SLP and intended-user review |
| P1 | Parent resource real-user comprehension, age/access accommodations, print and screen-reader assessment | Clinician/editor, caregivers |
| P1 | Dated primary-source verification for jurisdiction/translation claims | Source/clinical reviewer |
| P2 | Update public QA-status page, and broaden browser regression for visual reference | After approved release |

## Testing and deployment control

This audit used GitHub source reads, structural counts, metadata parsing and inspection of previously completed exact-head CI jobs. The new catalog regression passed on the first review commit in [site QA run 43156386705](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43156386705). Subsequent accessibility changes require a fresh exact-head site and rendered-browser CI result. Independent live assistive-technology, physical print, rights and clinical tests are **not** complete.

**Branch-only safety guard:** this review branch sets `git.deploymentEnabled: false` in `vercel.json` to suppress Vercel Git auto-preview deployments. It must **not be merged as-is**. Remove the temporary override only in a separately authorized release workflow; no build, deploy, merge or permission change is approved here.
