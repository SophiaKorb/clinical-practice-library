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
