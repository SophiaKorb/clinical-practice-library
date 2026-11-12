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
