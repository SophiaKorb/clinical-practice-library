# CPL — systematic resource-by-resource QA coverage register
**Review date:** 2026-11-12. **Exact baseline:** draft PR #27 commit `1e5fe0c5a29ef0f89825d93e62f72d8fed7a2b9c`.
**Protected branch:** `review/cpl-comprehensive-resource-audit-20261112`, inherited Vercel `git.deploymentEnabled:false` before edits.
**Technical review only:** no PHI, merge, deployment, publication, permissions changes, image modification or clinical approval.

## Source inventory and different counting systems
The repository has **802 distinct resource-file URLs**: **741 HTML + 61 PDFs**. Of these, **508** (463 HTML + 45 PDF) are in the current inventory, **268** (252 HTML + 16 PDF) are historical, and **26** HTML pages appear in neither inventory. The 502-record finder is a subset of the 508 current entries; six remaining current entries are navigational/directory pages. The separate **156-record metadata catalog** should not be added to this file count because metadata records are not necessarily downloadable resources; its `meta.records=155` mismatch is already addressed in unmerged PR #23, not silently corrected here.

The versioned [802-row file coverage seed](2026-11-12-all-resource-coverage-seed.csv), [156-row research metadata seed](2026-11-12-catalog-evidence-seed.csv), and [audit baseline](2026-11-12-coverage-baseline.json) identify every file and declare *pending* clinical, rights, Spanish-language, native screen-reader, physical-print and publication statuses. Initial filename/title priority classification is an automated heuristic: **25 P0**, **154 P1**, **570 P2**, **53 P3 candidates**. Neither a source link nor an earlier axe test certifies clinical accuracy.

The 26 unindexed pages include previews, clinical and training pages, and **11 state/district school-rights guides**. They may be intentionally unlisted. None were added to navigation or search.

## Systematic technical QA now added
- `scripts/qa/cpl-pdf-text-audit.py`: source-only PyMuPDF checks for **all 61 PDFs**: page counts, selectable text, pages lacking text, and form fields. Not PDF/UA, physical printing or OCR.
- `scripts/qa/cpl-complete-resource-matrix.cjs`: reads **every one of 802 source files**, records declared HTML language, h1/main tags, recognized skip link, hyperlink domains/counts, PDF results and previously narrowly checked primary-source IDs. URL presence is *not* citation-by-citation verification.
- `scripts/qa/cpl-coverage-dashboard.cjs`: an **offline** searchable reviewer matrix with CSV/JSON exports. Generated only into a GitHub Actions artifact, not the public CPL site.
- `scripts/qa/cpl-extra-accessibility.cjs`: **20 newly sampled HTML pages** at 320/390/768/1280 widths with axe-core at 390, browser error and overflow checks; the previous **3 discovery** and **11 high-stakes** routes are rerun by this workflow. This covers **34 sampled routes**, not all 741 pages in native assistive technology.
- Existing full-repository local-link/JavaScript tests run independently. Passing them does not validate external URLs, content, rights, clinical claims or every printed PDF.

## Narrow primary-source research and verified safe corrections
[Four new source-specific claim records](2026-11-12-comprehensive-claim-evidence.json) extend the previously documented 17 source/rights records:
1. **NICE NG225**, published 2022-09-07, last reviewed 2024-08-16: supports concurrent psychosocial/medical care and individualized formulation without suicide prediction/discharge by risk scores. Its UK recommendations do not replace local emergency protocols.
2. **NIMH ASQ**: brief screen with youth/adult and setting-specific pathways, target **age eight and up**, trained brief suicide safety assessment after a positive screen; page update date not established.
3. **VA Spanish PTSD instruments**: public downloadable staff-confirmed translations, **not validated in published research**; individual scale permissions and exact language validity remain separate.
4. **CDC suicide prevention**, dated 2026-05-26: multifactorial risk and protective support; not an individual acute risk predictor.

Two plain-text `Official source` references in `resources/assessment/trauma-ptsd-dissociation-safety.html` now link to the actual official VA PCL-5 and PC-PTSD-5 pages. The Spanish assessment guide's outdated assertion that translations are available `by request` was corrected to **downloadable staff-confirmed translations** and linked to VA's official translation page. No clinical interpretation, scores, cutoff tables, art or worksheet content was changed.

## Release boundaries and outstanding human decisions
**Ready for Human Review:** high-stakes clinician source-by-source verification; current evidence and jurisdiction; Native Spanish translations, reading level, culture and validity; copyright/rights including Stanley–Brown/NCTSN/third-party instruments; native screen readers and assisted input; physical B&W/large-print/CVI proofs; owner authorization for publication, merge, canonical selection, or deployment.
Existing draft PRs #21–27, `main`, and production remain unchanged. This branch is **never** a release approval; its temporary Vercel disable setting must not merge into production as-is.

**Initial regression results:** pending. Exact-head CI links and artifacts must be recorded after verification; preserve failures and unresolved conflicts.

## First complete automated source scan (implementation commit `2d5234255c8ed823b981ad92e0b783e6bd986204`)

**Exact-source full site QA** [43320266463](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43320266463) **SUCCESS**; **existing rendered keyboard/print QA** [43320266471](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43320266471) **SUCCESS**; **new comprehensive workflow** [43320266465](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43320266465) **SUCCESS**, including generated [downloadable full matrix, PDF findings and offline browser dashboard](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43320266465/artifacts/13990211976) (expires December 12, 2026).

- **All 802 source files scanned**; 741 HTML and 61 PDF; 156 catalog metadata entries tracked separately. **1,091 external links enumerated**, but *not independently retrieved or checked for clinical truth*.
- **PDF technical audit:** all **61 PDFs opened**, comprising **97 pages**, **zero parse errors**, **zero files or pages without selectable text**. This does **not** prove PDF tagging, proper reading order, clinical accuracy or physical print quality.
- **HTML structural source markers:** **0 missing HTML language declarations**, **one missing H1** (`/legacy/resources/index.html`), and **three missing main landmarks** (`/legacy/preview/layout-check.html`, `/legacy/resources/index.html`, `/preview/layout-check.html`). These are historical or layout-preview files and have not been altered or published.
- **Skip navigation source-pattern audit:** **494 HTML pages** lack the script's recognized first-tab skip pattern, including **248 in the current inventory**. This is a **review candidate count**, *not proof of 494 inaccessible pages*. Independent keyboard and native AT testing still needed; do not mass-rewrite templates without verified per-template evidence.
- **Automated axe-core sample** increased from 14 to **34 distinct HTML routes** (3 library/discovery + 11 previously sampled high-stakes + 20 newly sampled). The **20 new pages** were checked at 4 viewport sizes (80 route/viewport checks) with zero recorded browser errors or document-level horizontal overflow; **zero serious/critical axe violations after the fix**. The offline 802-row dashboard passed keyboard first-tab, search filters, print CSS, mobile widths and its own axe check. None of this certifies all 741 HTML pages.
- **Initial comprehensive run** [43319918461](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43319918461) appropriately **FAILED** on two serious `scrollable-region-focusable` findings in `resources/clinical-depth/substance-use-cooccurring-care.html`. Both were made keyboard-focusable and descriptively labeled, without changing clinical content, and regression checks were added. The corrected [43320266465](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43320266465) passed all new and prior browser coverage.
- [Complete P0 clinical-safety reviewer work queue](2026-11-12-p0-review-workqueue.md): **13 current resources + 12 historical variants**, all pending specialist review and ownership/rights decisions; other risk classes may be inaccurate because labels were assigned by automated filename heuristics.

**Important boundary:** Resource count completeness is now verified **at the file level**, not clinical and source validation for every file. The full audit still needs qualified review of high-risk clinical, Spanish/rights and all source-dated materials before any publication or merge. This is a technical *first pass*, not a whole-CPL clearance.

**Documentation-only changes after this point require a new exact-head QA rerun**; final successful run links will be attached to draft PR #28.
