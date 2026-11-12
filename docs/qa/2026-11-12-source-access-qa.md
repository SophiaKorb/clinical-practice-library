# CPL primary-source, rights and accessibility review — November 12, 2026

## Scope and isolation

Based on PR #25 exact verified commit `2c7886bd882149a871b40df1b02d5c05410ee0d9`, using separate review branch `review/cpl-source-access-qa-20261112`. The branch inherits `git.deploymentEnabled:false` before any commit. PR #25, PRs #21–24 and `main` remain untouched. No PHI, publish, merge, source-rights clearance or clinical authorization.

## Dated primary-source retrieval — evidence, not global endorsement

The sibling `2026-11-12-primary-source-ledger.json` records each URL, publisher, source date where verified, meaning of the date, targeted CPL file and narrowly checked claim, retrieval status, remaining uncertainty, and `clinicalApproved:false`/`rightsCleared:false` for **all seven** checks. Its entries were directly compared to the specified CPL handout/guide and primary-source webpage on November 12, 2026. A dated source publication, guideline version and the date of our retrieval are different fields.

- **CDC opioid-overdose response**, official page reviewed **April 2, 2024**: corroborates general warning signs, naloxone/emergency call, side positioning and staying with a person. Original CPL handout is not completely cleared; dispatcher CPR/rescue-breathing wording, product-specific dose, and Good Samaritan wording need specialist jurisdictional review. https://www.cdc.gov/stop-overdose/response/
- **CDC naloxone FAQ**, reachable in this check without a separately confirmed page-review date: recognizes reassessment and possible repeat dosing in 2–3 minutes; CPL defers to product directions. https://www.cdc.gov/stop-overdose/naloxone-faq/index.html
- **988 Lifeline** official service information, no verified page publication date: confirms call/text and safety-support flow. Its official professional best-practices page identifies a **2024 suicide-safety policy** requiring collaboration and least-invasive effective safety measures. We did not inspect or approve every clinical recommendation or assume 988's professional network policy applies verbatim to outpatient practice. https://988lifeline.org/get-help/what-to-expect/ ; https://988lifeline.org/professionals/best-practices/
- **VA/DoD PTSD guideline** officially identified as the **2023 CPG** on the VA site, including the specific treatment recommendations. The 2023 year belongs to that guideline edition, not to this review date. The CPL start-here resource's link to VA treatment essentials is present. https://www.ptsd.va.gov/professional/treat/txessentials/cpg_ptsd_management.asp
- **IOCDF ERP** official page remains accessible and describes willing/consented ERP, identifying obsessional fear, rituals and avoidance; publication/update date was not established from this page. Existing CPL non-coercive approach is directionally consistent but not a formal treatment certification. https://iocdf.org/about-ocd/ocd-treatment-guide/erp/
- **SAMHSA overdose-prevention URL** returned **403** to automated retrieval. This means access unverified, **not** confirmed broken or obsolete. Keep it unchanged unless a human browser or source owner establishes a replacement. https://www.samhsa.gov/substance-use/treatment/overdose-prevention

## Repeated-title provenance without destructive deduplication

The previous QA found **26 same-title groups covering 54 current URL records**. The new `scripts/qa/cpl-title-variants.cjs` reads those files from the actual checkout, compares full-file SHA-256 digests separately from visible-main-text hashes, and lists each group and pair. It distinguishes exact byte duplicates from same-title variants and distinct guide/toolkit roles. Repeated titles do not imply matching clinical content, translations, rights or user audience. For example, two Spanish harm-reduction paths have identical source blobs while a third same-title path differs; the Spanish suicide-crisis pair differs by more than just filename, and a Spanish safety-planning version includes a fillable-PDF link not present in its same-title partner. These differences need editorial verification before any canonicalization, redirect or deletion.

## Verified safe technical change

Six high-stakes or assessment resource pages (English and Spanish) used `resources/resource.css`'s sticky header but lacked a first-tab bypass. Added the existing `cpl-skip` class link before the header and focusable `#main-content` destination; **the original clinical body wording, artwork, PDF links, and scripts remain unchanged**. CSS already hides skip links during printing. Automated source contract and rendered responsive/axe/print review added.

## Remaining limits and gates

- Scope is sampled source review, not verification of every website source, every high-stakes clinical sentence, every date, statewide response protocol, or copyrighted test.
- Browser/axe checks do not replace native screen reader, low-vision, physical print or user-comprehension QA.
- Native language, clinical/SLP, translation and rights reviews, plus explicit publication, merge and deployment authorizations, remain **Ready for Human Review**.
- Any new technical or factual defect must be demonstrated by a dated primary source and corrected only on this guarded review branch. No automatic clinical rewriting or inferred rights permissions.

**CI:** initial execution pending; exact-head run outcomes must be recorded on the draft pull request before claiming a pass.

## Expanded axe findings and repairs — November 12, 2026

[Initial sampled Chromium run 43309869174](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43309869174) **failed** on three serious axe-core findings: two `label-content-name-mismatch` errors on the visible “CPL” navigation-brand links (Start Here and self-harm clinical depth), and a `scrollable-region-focusable` error on the self-harm pathway’s horizontally scrollable formulation table. All six originally edited high-stakes/assessment pages and the sampled OCD/PTSD/treatment-plan pages had **zero reported axe violations**. The same run verified all **26 repeated-title groups / 54 files**: exactly **one byte-identical file pair** and **eight additional same-visible-main-text pairs with different file bytes**. These findings are *not* a license to merge or redirect Spanish pages.

Corrected the two brand link accessible names to begin with visible “CPL”, and made the self-harm comparison table keyboard-focusable with a descriptive region name. Also repaired missing first-tab skip navigation on the OCD, PTSD, and treatment-plan guidance pages, using the existing shared resource CSS for the first two and isolated CSS for the third. Gave existing `#routes` and `#content` targets explicit focusability. Clinical wording, current source links, images and client worksheets were not changed.

Full site QA on initial commit succeeded ([43309869081](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43309869081)); existing rendered QA succeeded ([43309868991](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43309868991)). **This updated source requires new exact-head reruns**.

The subsequent [run 43310280924](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43310280924) stopped in the *new source-only assertion*: it matched an exact `class="resource-page"`, but two valid existing guide pages also carry `start-here-page` in the class attribute. Updated the test to accept the additional existing class. **No clinical page content was changed to satisfy the test.** A new exact-head Chromium rerun is required.

## Completed technical regression at the corrected source head

**Verified code commit:** `63cbc47e57d3d8e8f15dfd4d3b03f27604a33c75`.

- [Full site QA 43310449307](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43310449307): **SUCCESS** — existing link/script/navigation and new source-contract checks.
- [Existing rendered keyboard/print QA 43310449300](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43310449300): **SUCCESS**.
- [New source, variant and 11-page Chromium QA 43310449241](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43310449241): **SUCCESS** — all 26 groups/54 source files inventoried, one byte-identical pair and eight further same-visible-main-text/nonidentical-file pairs; 11 sampled routes at four widths, **zero axe-core violations** at 390px, no recorded browser exceptions or horizontal overflow. Existing CPL finder/inventory browser regression also passed.

This is automated accessibility sampling at 390px plus keyboard/layout checks at four widths, **not whole-site accessibility certification**. The six original high-stakes/assessment skip targets and three added therapy skip targets were tested. No source-based changes to suicide, overdose, ERP, or trauma clinical instruction text were made. Source concordance and rights remain narrow/pending as documented in the ledger.

The review register includes failing initial axe results [43309869174](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43309869174), and the subsequent static matcher failure [43310280924](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43310280924), rather than erasing either. Their causes and corrections are documented above. This documentation-only update will receive a fresh exact-head CI run before closure.

**Ready for Human Review, not cleared:** native screen reader and alternative-input, clinically trained safety/ERP/PTSD assessment, Spanish translation and cultural fit, duplicate-file ownership and canonical decisions, rights and provenance, printed material, local emergency protocols, merge/publication/deployment authorization.
