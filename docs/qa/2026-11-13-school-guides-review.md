# CPL school-support guide: dated source and keyboard follow-up

**Review date:** November 13, 2026. **Baseline:** draft PR #28 `43d45af194a91940b6a19342d204bee2275a24c0`. **Branch:** `review/cpl-guides-access-source-20261113`, inheriting `vercel.json` `git.deploymentEnabled:false`. All reviewer gates stay open.

## Evidence and scope

Five claim comparisons against current **primary government webpages** are stored in [machine-readable source ledger](2026-11-13-school-guide-primary-claims.json). The URLs and each record's precise source-date meaning, target CPL file, limited finding, and uncertainties are recorded; none is a complete legal/clinical review. No proprietary content was reproduced. The official pages were consulted on **2026-11-13**; a retrieval date must not be confused with their publication or rule-effective dates.

- [Arizona Department of Education: timelines](https://www.azed.gov/specialeducation/timelines): Parent **written** IDEA evaluation request requires school action within a reasonable period not exceeding **15 school days** to review existing data or issue a prior written refusal. Arizona's **60 calendar days** to eligibility decision begins upon receipt of **informed written parent consent**. A written, mutually agreed extension of up to 30 days requires the child's best interest, not school convenience. The English [school support process guide](../../guides/arizona-school-support-process.html) is narrowly concordant on those timing points.
- [Federal IDEA regulation 34 CFR §300.301](https://sites.ed.gov/idea/regs/b/d/300.301): Both parent and agency may request evaluation; federal default consent-based timeframe and state-timeframe exception. It does **not** alone establish the Arizona-specific 15-day step.
- [U.S. DOE OCR Section 504 FAQ](https://www.ed.gov/laws-and-policy/civil-rights-laws/disability-discrimination/frequently-asked-questions-section-504-free-appropriate-public-education-fape): Medical diagnosis alone is not automatic 504 entitlement; eligibility depends on substantial limitation of a major life activity and individualized procedures. IDEA's request clock cannot simply be copied into every Section 504 case.
- [U.S. DOE disability discrimination FAQ](https://www.ed.gov/laws-and-policy/civil-rights-laws/disability-discrimination/frequently-asked-questions-disability-discrimination): Good grades do not foreclose disability-related school evaluations; receipt of RTI/MTSS assistance is not itself a reason to delay a required 504 evaluation.

## Specific unresolved wording issue — proposed, not modified

In `resources/es/arizona-como-conseguir-iep-504.html`, the Spanish guidance currently reads:

> La fecha de inicio puede depender de si el padre o la escuela inició la evaluación.

This **may mislead readers** about the 60-day start date. Arizona says the 60 calendar days begin after the school receives informed written parental consent; the parent's written IDEA request separately sets a 15-school-day response rule. See [ledger record `AZ-SPANISH-CONSENT-START`](2026-11-13-school-guide-primary-claims.json) for a **candidate** Spanish revision. It was **not inserted** into the public guide, because bilingual legal/clinical editorial approval and accessibility/reading-level review are required. The English guide's timing wording was not rewritten either.

## Safe technical repairs

Nine `guides/*.html` school-support pages with the same sticky toolbar and `guides/guide.css` pattern lacked first-tab bypass links. Added a keyboard-first `Skip to guide content` link and `<main id="main-content" tabindex="-1">` focus target on **all nine**, with visually evident focus, reduced-motion respect, and print suppression in the shared guide CSS. Kept existing text, worksheet behavior, images, authorship labels, and 504/IDEA guidance unchanged. [New source test](../../tests/cpl-guide-bypass.cjs) checks all nine; [new Chromium test](../../scripts/qa/cpl-guides-browser.cjs) checks the nine pages at 320/390/768/1280px (36 route/viewport combinations), with sampled axe-core at 390px, visible skip activation, overflow, and print.

This is source-pattern and browser accessibility QA, **not** native screen reader, assistive-switch usability, actual grayscale print, law/practice approval or validated parent comprehension.

## Review decisions pending

**Ready for Human Review**: bilingual Arizona special-education/legal accuracy, current source provenance, school-district procedural application, child/parent reading level, screen-reader/keyboard on real devices, printed materials, rights and site owner authorization to merge/publish/deploy. No PHI and no review of a real student's records. Draft PRs #21–28, `main` and the original clinical resources remain untouched. No production or public website changes.

**Exact-head CI status:** pending at document creation; do not treat prior PR #28's passing workflows as approval of this new branch.

## Initial CI correction

[Initial workflow run 43386542182](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43386542182) stopped on an erroneous **source-ledger unit-test expectation**, not on guide content or navigation: a test looked for the substring `HUMAN_REVIEW` in an explicitly named `POTENTIAL_FACTUAL_AMBIGUITY_NEEDS_BILINGUAL_LEGAL_REVIEW` status. The test was corrected to check the exact existing unresolved-status value; Spanish guidance remains unchanged, and **bilingual legal review is still required**. Full browser QA from this branch must be rerun on a new SHA before marking technical completion.

## Initial expanded browser defects and nonclinical repairs

The corrected source-ledger [run 43386730986](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43386730986) ran the nine guides at four widths. **All skip and focus checks passed** but comprehensive browser QA **failed**, exposing actual accessibility defects not covered by the prior audit: **nine serious color-contrast findings** on small metadata/footer labels, **five serious keyboard-scrollability findings** on wide worksheet tables, and **two document-level horizontal-overflow results** on the Arizona school-process page at 320 and 390 pixels. Axe also logged moderate landmark naming issues for `aside` elements; these remain separately recorded as source-level/user-AT review candidates rather than being hidden or counted as passing.

Safe technical repairs: deepened only the shared `--muted` ink from `#68736c` to `#435c4e` (calculated contrast against the metadata-chip background `#f0ece4` improved from about **4.19:1 to 6.19:1**), allowed the guide grid child to shrink within the viewport, permitted long table values to wrap, and made **six** second worksheet-table wrappers keyboard-focusable and explicitly named. No rights, clinical/legal statements, input values, tables' data, or publication gates changed. CSS changes are limited to the nine-guide shared stylesheet. Browser rerun against the new exact SHA is required before marking these findings repaired.

The earlier [run 43386542182](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43386542182) failed on an incorrectly matched status literal in a source-only test; this was corrected without weakening the explicit bilingual legal review gate.

## Complete follow-up browser evidence and remaining landmark repair

At code commit `2c743f34f07c97b35a6f4aabb912b494e1f1edb3`, [full browser/PDF/source workflow run 43387666917](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43387666917) **PASSED**: nine guides × four widths (36 checks), **zero serious or critical axe findings** and **zero detected overflow/browser faults**; all guide skip and print tests passed. The same run checked 802 source files, 61 PDFs/97 pages, 1,091 external URL occurrences and the existing 3+11+20+14 browser samples. [Artifact 14018649780](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43387666917/artifacts/14018649780) was uploaded (expires December 13, 2026). The earlier [run 43387323824](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43387323824) verified that contrast and horizontal scroll-focus issues were fixed but **correctly failed** because one non-family guide still overflowed on narrow screens; stacking that guide's two-column callouts on mobile resolved the remaining overflow.

That successful run still reported **nine moderate axe `landmark-unique` warnings**: the HTML had multiple implicit complementary `aside` landmarks. Reviewed all nine sources; explicitly assigned **`role="note"`** to instructional callouts (which are not site navigation) and gave the guide table-of-contents `aside` an accessible name when present. Existing text and visual design remain unchanged. These additional semantic changes require **new exact-head browser QA**, including actual screen-reader review by an authorized tester before release. Do not collapse the earlier warnings into an unqualified accessibility pass.

**No legal clinical content, translations, copyright/ownership, user responses, or rights approvals changed.** Arizona's Spanish timeline issue remains **Ready for Bilingual Legal Review**; release and production gates remain closed.

## Final source and browser evidence — implementation SHA `8f0a76c90e67375ebeb1e9e8191ac0a8a4995563`

- [CPL school guides full source/PDF/browser QA 43388339292](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43388339292): **SUCCESS**. **All 9 guide pages**, at **320/390/768/1280px** (36 combinations), passed keyboard-first skip activation, main focus, print suppression and responsive layout; **0 axe-core violations on all nine sampled pages** at 390px; **0 browser errors and 0 document-wide overflow**.
- [Full CPL site QA 43388339349](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43388339349), [rendered keyboard/print QA 43388339335](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43388339335), and [school-guide parity QA 43388339330](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43388339330): **all SUCCESS**.
- The same isolated workflow successfully checked all **802 files** (741 HTML/61 PDF), including **97 PDF pages, no parsing or selectable-text gaps**; **1,091 external citation-link occurrences** (no claims of remote-date validity); and previously established discovery, source and 20+14-page browser samples. Pattern recognition now finds **471/741 HTML files**, including **225 current HTML pages**, lacking a recognized skip-link pattern, down nine from the immediately preceding review; this is *not* a count of inaccessible pages.
- [Final review-only JSON/CSV evidence artifact](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43388339292/artifacts/14020205723), verified uploaded with **expiration December 13, 2026**. Contains the guide-by-guide focus/axe/overflow report and complete resource/PDF/source-link audit. No webpage was published or deployed.
- The previous [run 43387323824](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43387323824) correctly failed on residual 320/390px Arizona overflow and nine moderate unnamed complementary-landmark observations. Mobile callout stacking removed the overflow; informational callouts were explicitly made `role="note"` and the contents sidebar labelled. The final run recorded **no remaining axe violations** in the nine-page sample. All clinical language and rights metadata remained unchanged.

**Approval boundary:** Automated axe and viewport checks do not replace native screen-reader, alternative input, grayscale/physical print, actual parent comprehension, qualified educational/legal review, translator verification, rights clearance or site owner publication approval. The Spanish IDEA timeline ambiguity remains unmodified and *Ready for Bilingual Legal Review*. All PRs remain review only and no PHI was used.

**Documentation-only follow-up:** This evidence entry and an audit-date metadata correction require a final exact-SHA CI rerun before closing the branch's technical QA.
