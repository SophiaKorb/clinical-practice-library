# CPL PR #40 + #41 combined QA — November 16, 2026

**Candidate:** `review/cpl-pr40-pr41-combined-qa-20261116`, draft integration [PR #43](https://github.com/SophiaKorb/clinical-practice-library/pull/43). **No merge, deployment or release authorization.** Both source PRs #40 and #41 remain unmerged.

## Provenance and reconciliation

- Base: exact PR #40 head `554d4e391649533d954407d1f7bcd090cbc4c1fb` (finder display and original readability regression).
- Imported exact PR #41 new guide texts, online directory, 532-entry finder data, and its content QA test from `5e84a43d440b7a286fd89779e3499577c192755b`; subsequent targeted fixes are recorded on this integration branch, not silently backported to either source PR.
- Combined `.github/workflows/site-qa.yml` retains **both** `tests/finder-card-readability.cjs` and `tests/affirming-practice-content.cjs`. Also added `tests/combined-cpl-finder-qa.cjs`.
- Rendered workflow `.github/workflows/pr19-rendered-smoke.yml` now runs both the original `scripts/qa/pr19-rendered-smoke.cjs` and new `scripts/qa/cpl-pr40-pr41-rendered.cjs` on a locally served nonproduction source.
- Production remains last explicitly verified at main SHA `b1d4ec63e4f395e4b64f786fefaf3c37a84cac24` before this integration QA. Reconfirm production at release time.

## Verified scope and search correctness

- 532 / 532 distinct finder URLs; **zero duplicates**, **zero missing local destinations** in full repository tree; **zero invalid controlled facet values**.
- 27 distinct fragment-addressed listings on the existing local/online community pages; all have matching section IDs in source.
- LGBTQ text query matches **30** entries in the combined catalog; the three new guides are individually discoverable with stage, role, task and functional tags. Orientation/identity has no diagnosis tagging.
- Children, teens and adults all have results in *all five* role choices: client/caregiver, school team, staff/case manager, graduate trainee, clinician. Matrix validation is automated rather than based only on static metadata.
- Found and corrected a genuine child-search false positive: explicitly age 13+ Eon Youth Lounge and TrevorSpace, and the approx. age 14+ transition-age guide, were returned under `Children` due to the combined school-age/adolescence facet. Added evidence-specific `minimumAge` metadata for these three and guarded `matchesAge` for the under-13 filter; teen and adult discovery retained.
- School-age/adolescence remains one broad underlying catalog stage for other records. Its suitability has **not** been separately verified for every resource's exact ages; remaining age limits must be assessed individually as source-specific data becomes available.

## UI and accessibility

- PR #40's finder result is now a linked **title** plus an explicit *direct-user-facing* age badge only where assigned; function, diagnosis, audience/index tags, format status, related accordion and per-result boilerplate are not shown. Full hidden search metadata is retained.
- New practice guides and online hub have keyboard-first skip links to focusable main landmarks, reduced-motion CSS and print-suppressed skip navigation.
- GitHub Actions local rendered checks at the last successful candidate head `1ff16315d6ca76d91538685b5a3de65b118e328f`:
  - Site QA **success**: 748 pages, 12,851 local references, 0 local-link errors; 583 scripts/handlers, 0 errors; new 532-entry full finder test passed.
  - Rendered keyboard/print QA **success**: inherited 150 checks/0 failures; new combined 163 checks/0 failures.
  - Combined suite covers 320, 390, 640, 1280 CSS-pixel widths; 320 CSS px is a WCAG 400%-reflow-equivalent viewport for a 1280px original. It is **not** a native browser 400%-zoom or screen-reader certification. Printed Letter PDF output is browser smoke QA only, not a physical print or PDF/UA audit.
- A prior rendered run failed **only** because a test assumed a search for Eon must return exactly one record. Both the Eon program and a guide referencing it correctly match, so the assertion was corrected to check a nonzero teen result, while ensuring under-13 results are zero. Keep both failed and successful results as QA history.
- A later minor test-log adjustment replaced an obsolete literal 529 count with a dynamic count; the exact latest head must pass before marking final.

## Clinical and source review — scoped, not clinical approval

Read the complete original text of all three new guides and checked these official publisher/agency source pages on November 16:
- [Family Acceptance Project, SFSU](https://familyproject.sfsu.edu/) and [multilingual family booklet](https://familyproject.sfsu.edu/family-education-booklet): family support behavior framing and supportive-caregiver education.
- [Family Acceptance Project Q&A for educators/school providers (2023)](https://familyproject.sfsu.edu/sites/default/files/documents/FAP_Q%26A%20for%20Educators%20%26%20School%20Providers_Increasing%20Family%20Support%20for%20LGBTQ%20Students2.pdf): verified publisher's 2023 title and publication source; no reproduction.
- [PFLAG family resources](https://pflag.org/find-resources/): current family and ally resource hub.
- [CDC supporting LGBTQ+ youth (Nov 2024)](https://www.cdc.gov/healthy-youth/lgbtq-youth/index.html) and [CDC Gay-Straight Alliances (Nov 2024)](https://www.cdc.gov/youth-safe-environments/sexualities-alliances/index.html): school-connectedness and inclusive practice claims. CDC notes its website was subject to a court-ordered restoration and administrative caveat; identify historical review date rather than implying 2026 expert re-review.

A clinical wording issue was corrected: the affirming-conversation guide previously said to obtain permission before *all* family/school/community contact, which could mislead around legally mandated reporting or immediate-danger obligations. The candidate now distinguishes **discretionary outreach** (permission and documented scope) from applicable mandatory reporting and urgent safety exceptions, emphasizing accurate confidentiality limits. Neither the change nor the linked source is legal advice.

Remaining specialist review: locally applicable minor consent/confidentiality, clinical safety/mandated reporting wording, family and youth lived-experience usability, source fit across diverse populations, online service age/eligibility/hours, original guide binary PDF publication, copyright/rights, native assistive-technology testing, real browser 200%/400% zoom and physical/grayscale print. No PHI introduced.

## Release recommendation

1. Verify both GitHub Actions workflow successes on **exact current integration SHA**, not only earlier ancestor checks.
2. Owner clinical/accessibility review of three guides and search interaction samples as above.
3. Obtain explicit authorization selecting one final release route: use combined PR #43 or reconcile approved source PR #40 and #41 into the same tested tree. Avoid cherry-pick duplication or dropping either workflow step.
4. Merge/publish only the explicitly approved exact candidate; confirm Vercel `READY` and matching production commit, then smoke-test live finder and all community pages.

**Status: Ready for Human Review for bounded technical tests; clinical/legal/rights/native-AT/publication gates remain open.**
