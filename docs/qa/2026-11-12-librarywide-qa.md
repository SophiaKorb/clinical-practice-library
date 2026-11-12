# CPL library-wide QA checkpoint — November 12, 2026

**Baseline:** main `eee0cb60c0df87fe759de0b84a5b8fa9eeb8b277`.  
**Working branch:** `review/cpl-librarywide-qa-20261112` created from a commit already containing `git.deploymentEnabled:false`.  
**Scope:** site discovery, inventory completeness, mobile/keyboard/print and search technical QA. No PHI, merge, deployment, clinical publication or permissions change authorized.

## Verified source findings

1. **Finder versus inventory:** 502 distinct finder URLs (457 HTML, 45 PDF) have no duplicated URL, missing priority or invalid facets. The complete inventory originally held 762 distinct entries (494 current, 268 retained legacy). **14 existing finder-linked current HTML pages were missing from the inventory**, including decision-oriented clinical-depth materials. All 14 files exist in the repository. Added those entries in sorted URL order; a regression test now requires all finder URLs to be included.
2. **Keyboard navigation:** both the selected resources directory and complete inventory lacked a first-tab bypass and focusable main target. The finder linked to #finder but lacked an explicitly focusable target. Corrected with visible skip links, main/section focus targets, and keyboard testing.
3. **Search relevance:** broad synonym results could outrank exact query matches. Added direct-query ranking ahead of synonym-only results without eliminating matches or changing clinical tags; priority and alphabetical order remain within relevance tiers.
4. **Spanish search:** complete inventory searched case-insensitively but not accent-insensitively; normalized diacritics and preserved current/legacy filters.
5. **Distinct counts:** the structured catalog has 156 entries, and the other two indexes have different scopes. README says 134 and catalog meta says 155 on main; independent draft PR #23 already fixes those discrepancies but remains unmerged. Do not merge this branch as a substitute for PR #23 or treat the indexes as a single list.
6. **Source freshness:** the October clinical QA register documents sampled review of six high-impact resources; crisis/overdose, ERP, trauma, diagnoses, assessment permissions, Spanish translation, legal/jurisdiction and remaining content remain **uncleared for clinical/rights publication**. Existing static link tests validate internal paths, not remote official source availability or current policy dates.
7. **Other drafts:** visual PR #21 and technical child PR #24 stay draft/unapproved; parent resource PR #22 awaits human review. This branch does not incorporate those materials.

## Changes and technical checks

- Added 14 pre-existing finder-linked entries to the complete resource inventory without altering clinical content.
- Added keyboard-first skip navigation and focus, reduced-motion styling, accent-aware search, direct-result priority.
- Introduced `tests/librarywide-discovery.cjs` into site QA and separate review-only Chromium + axe-core coverage across 320/390/768/1280px, print visibility, search and facet/scope workflows.

**Automated status:** pending exact-head site and Chromium checks when this register was created. A green site check is not proof of native screen-reader usability, clinical approval, source correctness, external-link freshness or physical print quality.

## Human gates

**Ready for Human Review:** clinical/safety source audits and dated primary-source checks; Spanish and jurisdiction accuracy; copyrighted instruments and artwork provenance; caregiver usability of separate drafts; publication, merge and deployment approval. Protect main, all prior drafts, and Vercel production.

## First rendered CI findings (November 12, 2026)

At commit `24d12cbdfb07e2c386e305c58fe820846c1fd506`, [site QA 43306865879](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43306865879) and [legacy rendered QA 43306865818](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43306865818) passed. The new [library-wide Chromium run 43306866197](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43306866197) **FAILED** after finding nine low-contrast shelf-number labels on `resources/index.html` at 390px; inventory and finder pages had no reported axe-core violations and all three passed keyboard/print/overflow checks at 320/390/768/1280px. The present follow-up darkens only those decorative section-number glyphs to `#6d4b29`, preserving all labels, links and page architecture. **Rerun is required** before calling this corrected branch fully passing.

## Source, duplicate-title and external-link audit (November 12, 2026)

- The structured catalog contains **156** entries. **84** have a nonblank `sourceUrl`, while **72** lack a direct source URL. The 84 URLs are structurally web-valid; this does not establish that all resolve or authorize redistribution. Some entries intentionally refer to separately hosted original handouts, so the absence of `sourceUrl` is a provenance task, not proof of missing content.
- The catalog has `evidenceReview` labels for 95 entries (30 `Reviewed`, 25 `Historical annotation required`, 20 `To review`, and 20 `Strengths/limitations review pending`) but **none of 156 entries has a structured last-source-verification date**. A source publication year is not a review timestamp. Separate draft PR #23 addresses the different record-count discrepancy, not this dated provenance gap.
- The complete inventory now contains **776** distinct URLs. **26 current-title groups** have the same displayed title across distinct URLs (many Spanish filename variants). This is a candidate editorial-duplicate register only: content equivalence, translation provenance and preferred canonical URLs were **not** established. Do not redirect, deduplicate, delete or label any version outdated without comparison.
- The repository link checker verifies local paths and fragments and passed at the initial review commit; it intentionally does **not** verify external HTTP URLs. A remote 403 also cannot alone establish a broken public resource.

### Dated primary-page spot checks (not comprehensive source revalidation)

- [CDC overdose response](https://www.cdc.gov/stop-overdose/response/) was retrievable in the November 12, 2026 browsing check; its page date displayed **April 2, 2024**. This only confirms availability and the source page's own date, not exhaustive CPL clinical concordance.
- [CDC parent training in ADHD behavior management](https://www.cdc.gov/adhd/treatment/behavior-therapy.html) was retrievable; it displayed **updated/reviewed October 21, 2026**. It is a source referenced by pending parent education, not permission to merge PR #22.
- [SAMHSA overdose prevention](https://www.samhsa.gov/substance-use/treatment/overdose-prevention) returned **HTTP 403** to the browsing check. Mark **access unverified**, not broken or obsolete, pending a legitimate human/browser/source-owner confirmation.

`scripts/qa/librarywide-provenance.cjs` repeats the metadata and duplicate-title count checks without network calls, preserving source uncertainty rather than inventing verification.

**Human owner actions:** establish dated verification and rights fields for each official clinical source, check these against the specific intended population/jurisdiction, compare same-title Spanish and current resource variants, and complete clinical/SLP/translation/rights/publication review. No automatic content replacements were authorized.
